FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o reservation-service .

FROM golang:1.23-alpine
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/reservation-service .
EXPOSE 8081
CMD ["./reservation-service"]
