package handlers

import (
	"net/http"
	"time"

	"reservation-service/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SafeLockHandler struct{}

func NewSafeLockHandler() *SafeLockHandler {
	return &SafeLockHandler{}
}

func (h *SafeLockHandler) CreateLock(c *gin.Context) {
	var req models.SafeLockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For now, return a mock response
	expiresAt := req.ExpiresAt
	if req.Permanent {
		expiresAt = nil
	}

	res := gin.H{
		"id":           uuid.New().String(),
		"inventory_id": req.InventoryID,
		"admin_id":     req.AdminID,
		"quantity":     req.Quantity,
		"expires_at":   expiresAt,
		"permanent":    req.Permanent,
		"created_at":   time.Now(),
	}
	c.JSON(http.StatusCreated, res)
}

func (h *SafeLockHandler) ReleaseLock(c *gin.Context) {
	var req models.SafeLockReleaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"released": true})
}

func (h *SafeLockHandler) GetAllLocks(c *gin.Context) {
	// Return mock data
	res := []gin.H{}
	c.JSON(http.StatusOK, res)
}

func (h *SafeLockHandler) GetLockStats(c *gin.Context) {
	res := gin.H{
		"totalLocked":     0,
		"expiringSoon":    0,
		"safeLockedItems": 0,
	}
	c.JSON(http.StatusOK, res)
}
