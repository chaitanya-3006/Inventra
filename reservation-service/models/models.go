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

type ReserveRequest struct {
	InventoryID string `json:"inventory_id" binding:"required"`
	UserID      string `json:"user_id"      binding:"required"`
	Quantity    int    `json:"quantity"     binding:"required,min=1"`
}

type ConfirmRequest struct {
	ReservationID string `json:"reservation_id" binding:"required"`
	UserID        string `json:"user_id"        binding:"required"`
}

type CancelRequest struct {
	ReservationID string `json:"reservation_id" binding:"required"`
	UserID        string `json:"user_id"        binding:"required"`
}
