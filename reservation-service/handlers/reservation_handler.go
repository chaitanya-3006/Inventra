package handlers

import (
	"context"
	"errors"
	"log"
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
	log.Printf("Go Service: Processing Reserve request: %+v", req)
	res, err := h.svc.Reserve(c.Request.Context(), req)
	if err != nil {
		log.Printf("Go Service: Reserve request failed: %v", err)
		c.JSON(getErrorStatus(err), gin.H{"error": err.Error()})
		return
	}
	log.Printf("Go Service: Reserve request completed successfully")
	c.JSON(http.StatusCreated, res)
}

func (h *ReservationHandler) Confirm(c *gin.Context) {
	var req models.ConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Go Service: Processing Confirm request: %+v", req)
	res, err := h.svc.Confirm(c.Request.Context(), req)
	if err != nil {
		log.Printf("Go Service: Confirm request failed: %v", err)
		c.JSON(getErrorStatus(err), gin.H{"error": err.Error()})
		return
	}
	log.Printf("Go Service: Confirm request completed successfully")
	c.JSON(http.StatusOK, res)
}

func (h *ReservationHandler) Cancel(c *gin.Context) {
	var req models.CancelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Go Service: Processing Cancel request: %+v", req)
	res, err := h.svc.Cancel(c.Request.Context(), req)
	if err != nil {
		log.Printf("Go Service: Cancel request failed: %v", err)
		c.JSON(getErrorStatus(err), gin.H{"error": err.Error()})
		return
	}
	log.Printf("Go Service: Cancel request completed successfully")
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
	reservations, err := h.svc.GetHistory(c.Request.Context())
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

func (h *ReservationHandler) GetHistoryStats(c *gin.Context) {
	confirmed, expired, cancelled, err := h.svc.GetHistoryStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"confirmed": confirmed,
		"expired":   expired,
		"cancelled": cancelled,
	})
}
