package models

import (
	"time"

	"github.com/google/uuid"
)

type Inventory struct {
	ID                uuid.UUID `json:"id"`
	SKU               string    `json:"sku"`
	Name              string    `json:"name"`
	TotalQuantity     int       `json:"total_quantity"`
	ReservedQuantity  int       `json:"reserved_quantity"`
	AvailableQuantity int       `json:"available_quantity"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type Reservation struct {
	ID          uuid.UUID `json:"id"`
	InventoryID uuid.UUID `json:"inventory_id"`
	UserID      uuid.UUID `json:"user_id"`
	Quantity    int       `json:"quantity"`
	Status      string    `json:"status"`
	ExpiresAt   time.Time `json:"expires_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type SafeLock struct {
	ID          uuid.UUID  `json:"id"`
	InventoryID uuid.UUID  `json:"inventory_id"`
	AdminID     uuid.UUID  `json:"admin_id"`
	Quantity    int        `json:"quantity"`
	ExpiresAt   *time.Time `json:"expires_at"`
	Permanent   bool       `json:"permanent"`
	CreatedAt   time.Time  `json:"created_at"`
}

type History struct {
	ID          uuid.UUID `json:"id"`
	InventoryID uuid.UUID `json:"inventory_id"`
	UserID      uuid.UUID `json:"user_id"`
	Quantity    int       `json:"quantity"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type ReserveRequest struct {
	InventoryID string `json:"inventory_id" binding:"required"`
	UserID      string `json:"user_id"      binding:"required"`
	Quantity    int    `json:"quantity"     binding:"required,min=1"`
}

type ConfirmRequest struct {
	ReservationID string `json:"reservation_id" binding:"required"`
	UserID        string `json:"user_id"        binding:"required"`
	IsAdmin       bool   `json:"is_admin"`
}

type CancelRequest struct {
	ReservationID string `json:"reservation_id" binding:"required"`
	UserID        string `json:"user_id"        binding:"required"`
	IsAdmin       bool   `json:"is_admin"`
}



type SafeLockRequest struct {
	InventoryID string     `json:"inventory_id" binding:"required"`
	AdminID     string     `json:"admin_id"     binding:"required"`
	Quantity    int        `json:"quantity"      binding:"required,min=1"`
	ExpiresAt   *time.Time `json:"expires_at"`
	Permanent   bool       `json:"permanent"`
}

type SafeLockReleaseRequest struct {
	LockID string `json:"lock_id" binding:"required"`
}
