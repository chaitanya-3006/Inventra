package repository

import (
	"context"
	"errors"
	"time"

	"reservation-service/db"
	"reservation-service/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SafeLockRepo struct {
	pool *pgxpool.Pool
}

func NewSafeLockRepo() *SafeLockRepo {
	return &SafeLockRepo{pool: db.Pool}
}

func (r *SafeLockRepo) CreateLock(req models.SafeLockRequest) (string, error) {
	ctx := context.Background()
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	// Lock the inventory row
	var availableQty int
	err = tx.QueryRow(ctx, "SELECT available_quantity FROM inventory WHERE id = $1 FOR UPDATE", req.InventoryID).Scan(&availableQty)
	if err != nil {
		return "", err
	}

	if availableQty < req.Quantity {
		return "", errors.New("not enough available quantity to secure safe-lock")
	}

	// Update inventory.locked_quantity
	_, err = tx.Exec(ctx, "UPDATE inventory SET locked_quantity = locked_quantity + $1 WHERE id = $2", req.Quantity, req.InventoryID)
	if err != nil {
		return "", err
	}

	lockID := uuid.New().String()
	var expiresAt *time.Time
	if !req.Permanent && req.ExpiresAt != nil {
		expiresAt = req.ExpiresAt
	}

	_, err = tx.Exec(ctx, `INSERT INTO safe_locks (id, inventory_id, admin_id, quantity, expires_at, permanent) 
	                  VALUES ($1, $2, $3, $4, $5, $6)`,
		lockID, req.InventoryID, req.AdminID, req.Quantity, expiresAt, req.Permanent)
	if err != nil {
		return "", err
	}

	return lockID, tx.Commit(ctx)
}

func (r *SafeLockRepo) ReleaseLock(lockID string) error {
	ctx := context.Background()
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var inventoryID string
	var quantity int
	err = tx.QueryRow(ctx, "SELECT inventory_id, quantity FROM safe_locks WHERE id = $1 FOR UPDATE", lockID).Scan(&inventoryID, &quantity)
	if err != nil {
		if err == pgx.ErrNoRows {
			return errors.New("safe-lock not found")
		}
		return err
	}

	// Unlock in inventory
	_, err = tx.Exec(ctx, "UPDATE inventory SET locked_quantity = locked_quantity - $1 WHERE id = $2", quantity, inventoryID)
	if err != nil {
		return err
	}

	// Remove lock
	_, err = tx.Exec(ctx, "DELETE FROM safe_locks WHERE id = $1", lockID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
