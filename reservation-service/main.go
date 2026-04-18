package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"reservation-service/db"
	"reservation-service/handlers"
	"reservation-service/repository"
	"reservation-service/services"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := db.Connect(); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	log.Println("connected to PostgreSQL")

	repo := repository.NewReservationRepo()
	safeLockRepo := repository.NewSafeLockRepo()
	svc := services.NewReservationService(repo)
	handler := handlers.NewReservationHandler(svc)
	safeLockHandler := handlers.NewSafeLockHandler(safeLockRepo)

	svc.StartExpiryWorker()

	r := gin.Default()

	r.POST("/reserve", handler.Reserve)
	r.POST("/confirm", handler.Confirm)
	r.POST("/cancel", handler.Cancel)
	r.GET("/reservations/user/:userID", handler.GetByUser)
	r.GET("/reservations", handler.GetAll)

	r.POST("/safe-lock", safeLockHandler.CreateLock)
	r.POST("/safe-lock/release", safeLockHandler.ReleaseLock)
	r.GET("/safe-lock", safeLockHandler.GetAllLocks)
	r.GET("/safe-lock/stats", safeLockHandler.GetLockStats)

	r.GET("/history", handler.GetHistory)
	r.GET("/history/stats", handler.GetHistoryStats)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("Go reservation service listening on :%s\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down server...")

	services.StopExpiryWorker()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}

	log.Println("server exited")
}
