package repository

import (
	"context"
	"fmt"
	"time"

	"reservation-service/db"
	"reservation-service/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type ReservationRepo struct{}

func NewReservationRepo() *ReservationRepo {
	return &ReservationRepo{}
}

func (r *ReservationRepo) Reserve(ctx context.Context, req models.ReserveRequest) (*models.Reservation, error) {
	inventoryID, err := uuid.Parse(req.InventoryID)
	if err != nil {
		return nil, fmt.Errorf("invalid inventory_id: %w", err)
	}
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, fmt.Errorf("invalid user_id: %w", err)
	}

	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var available int
	err = tx.QueryRow(ctx,
		`SELECT available_quantity FROM inventory WHERE id = $1 FOR UPDATE`,
		inventoryID,
	).Scan(&available)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("inventory not found")
	}
	if err != nil {
		return nil, err
	}

	if available < req.Quantity {
		return nil, fmt.Errorf("insufficient stock: available=%d, requested=%d", available, req.Quantity)
	}

	// Create PENDING reservation: stock is available, so increase reserved_quantity.
	// total_quantity stays the same until CONFIRMED.
	_, err = tx.Exec(ctx,
		`UPDATE inventory
		 SET reserved_quantity = reserved_quantity + $1,
		     updated_at = NOW()
		 WHERE id = $2`,
		req.Quantity, inventoryID,
	)
	if err != nil {
		return nil, err
	}

	var res models.Reservation
	err = tx.QueryRow(ctx,
		`INSERT INTO reservations (inventory_id, user_id, quantity, status, expires_at)
		 VALUES ($1, $2, $3, 'PENDING', NOW() + INTERVAL '15 minutes')
		 RETURNING id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at`,
		inventoryID, userID, req.Quantity,
	).Scan(
		&res.ID, &res.InventoryID, &res.UserID,
		&res.Quantity, &res.Status, &res.ExpiresAt,
		&res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *ReservationRepo) Extend(ctx context.Context, reservationID, userID uuid.UUID) (*models.Reservation, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var res models.Reservation
	err = tx.QueryRow(ctx,
		`SELECT id, inventory_id, user_id, quantity, status, expires_at FROM reservations WHERE id = $1 AND user_id = $2 FOR UPDATE`,
		reservationID, userID,
	).Scan(&res.ID, &res.InventoryID, &res.UserID, &res.Quantity, &res.Status, &res.ExpiresAt)
	
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("reservation not found")
	}
	if err != nil {
		return nil, err
	}

	if res.Status != "PENDING" {
		return nil, fmt.Errorf("only PENDING reservations can be extended, current status: %s", res.Status)
	}
	if time.Now().After(res.ExpiresAt) {
		return nil, fmt.Errorf("reservation has already expired")
	}

	err = tx.QueryRow(ctx,
		`UPDATE reservations SET expires_at = expires_at + INTERVAL '15 minutes', updated_at = NOW()
     WHERE id = $1 RETURNING id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at`,
		reservationID,
	).Scan(
		&res.ID, &res.InventoryID, &res.UserID,
		&res.Quantity, &res.Status, &res.ExpiresAt,
		&res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &res, tx.Commit(ctx)
}

func (r *ReservationRepo) Confirm(ctx context.Context, reservationID, userID uuid.UUID, isAdmin bool) (*models.Reservation, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var res models.Reservation
	query := `SELECT id, inventory_id, user_id, quantity, status, expires_at FROM reservations WHERE id = $1`
	args := []interface{}{reservationID}
	
	if !isAdmin {
		query += ` AND user_id = $2 FOR UPDATE`
		args = append(args, userID)
	} else {
		query += ` FOR UPDATE`
	}

	err = tx.QueryRow(ctx, query, args...).Scan(&res.ID, &res.InventoryID, &res.UserID, &res.Quantity, &res.Status, &res.ExpiresAt)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("reservation not found")
	}
	if err != nil {
		return nil, err
	}

	if res.Status != "PENDING" {
		return nil, fmt.Errorf("reservation is not in PENDING state, current status: %s", res.Status)
	}
	if time.Now().After(res.ExpiresAt) {
		return nil, fmt.Errorf("reservation has expired")
	}

	_, err = tx.Exec(ctx,
		`UPDATE inventory
     SET total_quantity = total_quantity - $1,
         reserved_quantity = reserved_quantity - $1,
         updated_at = NOW()
     WHERE id = $2`,
		res.Quantity, res.InventoryID,
	)
	if err != nil {
		return nil, err
	}

	err = tx.QueryRow(ctx,
		`UPDATE reservations SET status = 'CONFIRMED', updated_at = NOW()
     WHERE id = $1 RETURNING id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at`,
		reservationID,
	).Scan(
		&res.ID, &res.InventoryID, &res.UserID,
		&res.Quantity, &res.Status, &res.ExpiresAt,
		&res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &res, tx.Commit(ctx)
}

func (r *ReservationRepo) Cancel(ctx context.Context, reservationID, userID uuid.UUID, isAdmin bool) (*models.Reservation, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var res models.Reservation
	query := `SELECT id, inventory_id, user_id, quantity, status FROM reservations WHERE id = $1`
	args := []interface{}{reservationID}

	if !isAdmin {
		query += ` AND user_id = $2 FOR UPDATE`
		args = append(args, userID)
	} else {
		query += ` FOR UPDATE`
	}

	err = tx.QueryRow(ctx, query, args...).Scan(&res.ID, &res.InventoryID, &res.UserID, &res.Quantity, &res.Status)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("reservation not found")
	}
	if err != nil {
		return nil, err
	}

	if res.Status != "CONFIRMED" {
		return nil, fmt.Errorf("only CONFIRMED reservations can be cancelled, current: %s", res.Status)
	}

	// Restore the stock: since auto-confirm deducted total_quantity directly,
	// cancelling must add it back so the item is available again.
	_, err = tx.Exec(ctx,
		`UPDATE inventory SET total_quantity = total_quantity + $1, updated_at = NOW() WHERE id = $2`,
		res.Quantity, res.InventoryID,
	)
	if err != nil {
		return nil, err
	}

	err = tx.QueryRow(ctx,
		`UPDATE reservations SET status = 'CANCELLED', updated_at = NOW()
		 WHERE id = $1 RETURNING id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at`,
		reservationID,
	).Scan(
		&res.ID, &res.InventoryID, &res.UserID,
		&res.Quantity, &res.Status, &res.ExpiresAt,
		&res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &res, tx.Commit(ctx)
}

func (r *ReservationRepo) ExpireReservations(ctx context.Context) (int, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	rows, err := tx.Query(ctx,
		`SELECT id, inventory_id, quantity FROM reservations
     WHERE status = 'PENDING' AND expires_at < NOW() FOR UPDATE SKIP LOCKED`,
	)
	if err != nil {
		return 0, err
	}

	type expiredRow struct {
		ID          uuid.UUID
		InventoryID uuid.UUID
		Quantity    int
	}
	var expired []expiredRow
	for rows.Next() {
		var e expiredRow
		if err := rows.Scan(&e.ID, &e.InventoryID, &e.Quantity); err != nil {
			rows.Close()
			return 0, err
		}
		expired = append(expired, e)
	}
	rows.Close()

	for _, e := range expired {
		_, err = tx.Exec(ctx,
			`UPDATE inventory SET reserved_quantity = reserved_quantity - $1, updated_at = NOW() WHERE id = $2`,
			e.Quantity, e.InventoryID,
		)
		if err != nil {
			return 0, err
		}
		_, err = tx.Exec(ctx,
			`UPDATE reservations SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1`,
			e.ID,
		)
		if err != nil {
			return 0, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, err
	}
	return len(expired), nil
}

func (r *ReservationRepo) GetReservationsByUser(ctx context.Context, userID uuid.UUID) ([]models.Reservation, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at
     FROM reservations WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []models.Reservation{}
	for rows.Next() {
		var res models.Reservation
		if err := rows.Scan(
			&res.ID, &res.InventoryID, &res.UserID,
			&res.Quantity, &res.Status, &res.ExpiresAt,
			&res.CreatedAt, &res.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *ReservationRepo) GetAllReservations(ctx context.Context) ([]models.Reservation, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at
     FROM reservations ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []models.Reservation{}
	for rows.Next() {
		var res models.Reservation
		if err := rows.Scan(
			&res.ID, &res.InventoryID, &res.UserID,
			&res.Quantity, &res.Status, &res.ExpiresAt,
			&res.CreatedAt, &res.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *ReservationRepo) GetHistory(ctx context.Context) ([]models.Reservation, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, inventory_id, user_id, quantity, status, expires_at, created_at, updated_at
     FROM reservations WHERE status IN ('CONFIRMED', 'CANCELLED', 'EXPIRED') ORDER BY updated_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []models.Reservation{}
	for rows.Next() {
		var res models.Reservation
		if err := rows.Scan(
			&res.ID, &res.InventoryID, &res.UserID,
			&res.Quantity, &res.Status, &res.ExpiresAt,
			&res.CreatedAt, &res.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *ReservationRepo) GetHistoryStats(ctx context.Context) (int, int, int, error) {
	row := db.Pool.QueryRow(ctx,
		`SELECT 
			COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END), 0) as confirmed,
			COALESCE(SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END), 0) as expired,
			COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelled
		 FROM reservations`,
	)
	var confirmed, expired, cancelled int
	if err := row.Scan(&confirmed, &expired, &cancelled); err != nil {
		return 0, 0, 0, err
	}
	return confirmed, expired, cancelled, nil
}
