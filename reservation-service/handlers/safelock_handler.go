package handlers

import (
	"net/http"
	"time"

	"reservation-service/models"
	"reservation-service/repository"

	"github.com/gin-gonic/gin"
)

type SafeLockHandler struct {
	repo *repository.SafeLockRepo
}

func NewSafeLockHandler(repo *repository.SafeLockRepo) *SafeLockHandler {
	return &SafeLockHandler{repo: repo}
}

func (h *SafeLockHandler) CreateLock(c *gin.Context) {
	var req models.SafeLockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lockID, err := h.repo.CreateLock(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := gin.H{
		"id":           lockID,
		"inventory_id": req.InventoryID,
		"admin_id":     req.AdminID,
		"quantity":     req.Quantity,
		"expires_at":   req.ExpiresAt,
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

	if err := h.repo.ReleaseLock(req.LockID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
