package handlers

import (
	"net/http"

	"reservation-service/models"
	"reservation-service/services"

	"github.com/gin-gonic/gin"
)

type ReservationHandler struct {
	svc *services.ReservationService
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
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
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
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
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
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ReservationHandler) GetByUser(c *gin.Context) {
	userID := c.Param("userID")
	reservations, err := h.svc.GetByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if reservations == nil {
		reservations = []models.Reservation{}
	}
	c.JSON(http.StatusOK, reservations)
}
