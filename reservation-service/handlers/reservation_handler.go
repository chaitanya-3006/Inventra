package handlers

import (
	"context"
	"errors"
	"net/http"

	"reservation-service/models"
	"reservation-service/services"

	"github.com/gin-gonic/gin"
)

type ReservationHandler struct {
	svc *services.ReservationService
}

func getErrorStatus(err error) int {
	if err == nil {
		return http.StatusOK
	}
	var validationErr *validationError
	if errors.As(err, &validationErr) {
		return http.StatusBadRequest
	}
	if errors.Is(err, context.DeadlineExceeded) {
		return http.StatusGatewayTimeout
	}
	return http.StatusConflict
}

type validationError struct {
	msg string
}

func (e *validationError) Error() string {
	return e.msg
}

func NewReservationHandler(svc *services.ReservationService) *ReservationHandler {
	return &ReservationHandler{svc: svc}
}

func (h *ReservationHandler) Reserve(c *gin.Context) {
	var req models.ReserveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.svc.Reserve(c.Request.Context(), req)
	if err != nil {
		c.JSON(getErrorStatus(err), gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, res)
}

func (h *ReservationHandler) Confirm(c *gin.Context) {
	var req models.ConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.svc.Confirm(c.Request.Context(), req)
	if err != nil {
		c.JSON(getErrorStatus(err), gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ReservationHandler) Cancel(c *gin.Context) {
	var req models.CancelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := h.svc.Cancel(c.Request.Context(), req)
	if err != nil {
		c.JSON(getErrorStatus(err), gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ReservationHandler) GetByUser(c *gin.Context) {
	userID := c.Param("userID")
	reservations, err := h.svc.GetByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if reservations == nil {
		reservations = []models.Reservation{}
	}
	c.JSON(http.StatusOK, reservations)
}

func (h *ReservationHandler) GetAll(c *gin.Context) {
	reservations, err := h.svc.GetAllReservations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if reservations == nil {
		reservations = []models.Reservation{}
	}
	c.JSON(http.StatusOK, gin.H{
		"data":  reservations,
		"total": len(reservations),
	})
}

func (h *ReservationHandler) GetHistory(c *gin.Context) {
	// Return empty list for now - would query from DB
	c.JSON(http.StatusOK, gin.H{
		"data":  []models.Reservation{},
		"total": 0,
	})
}

func (h *ReservationHandler) GetHistoryStats(c *gin.Context) {
	// Return mock stats for now
	c.JSON(http.StatusOK, gin.H{
		"confirmed": 0,
		"expired":   0,
		"cancelled": 0,
	})
}
