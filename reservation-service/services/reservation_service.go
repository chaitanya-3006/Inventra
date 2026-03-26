package services

import (
	"context"
	"log"

	"reservation-service/models"
	"reservation-service/repository"

	"github.com/google/uuid"
	"github.com/robfig/cron/v3"
)

type ReservationService struct {
	repo *repository.ReservationRepo
}

func NewReservationService(repo *repository.ReservationRepo) *ReservationService {
	return &ReservationService{repo: repo}
}

func (s *ReservationService) Reserve(ctx context.Context, req models.ReserveRequest) (*models.Reservation, error) {
	return s.repo.Reserve(ctx, req)
}

func (s *ReservationService) Confirm(ctx context.Context, req models.ConfirmRequest) (*models.Reservation, error) {
	reservationID, err := uuid.Parse(req.ReservationID)
	if err != nil {
		return nil, err
	}
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, err
	}
	return s.repo.Confirm(ctx, reservationID, userID)
}

func (s *ReservationService) Cancel(ctx context.Context, req models.CancelRequest) (*models.Reservation, error) {
	reservationID, err := uuid.Parse(req.ReservationID)
	if err != nil {
		return nil, err
	}
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, err
	}
	return s.repo.Cancel(ctx, reservationID, userID)
}

func (s *ReservationService) GetByUser(ctx context.Context, userIDStr string) ([]models.Reservation, error) {
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, err
	}
	return s.repo.GetReservationsByUser(ctx, userID)
}

// StartExpiryWorker runs every minute to expire stale reservations.
func (s *ReservationService) StartExpiryWorker() {
	c := cron.New()
	c.AddFunc("@every 1m", func() {
		n, err := s.repo.ExpireReservations(context.Background())
		if err != nil {
			log.Printf("[expiry worker] error: %v", err)
			return
		}
		if n > 0 {
			log.Printf("[expiry worker] expired %d reservations", n)
		}
	})
	c.Start()
}
