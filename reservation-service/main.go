package main

import (
	"log"

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
	svc := services.NewReservationService(repo)
	handler := handlers.NewReservationHandler(svc)

	svc.StartExpiryWorker()

	r := gin.Default()

	r.POST("/reserve", handler.Reserve)
	r.POST("/confirm", handler.Confirm)
	r.POST("/cancel", handler.Cancel)
	r.GET("/reservations/user/:userID", handler.GetByUser)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("Go reservation service listening on :8081")
	if err := r.Run(":8081"); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
