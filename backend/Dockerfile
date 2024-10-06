# First stage: build the Go binary
FROM golang:1.21.5 AS builder

WORKDIR /app

# Copy Go mod and sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go app (consider giving the binary a more generic name)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o maxhealth_be .

# Second stage: minimal runtime
FROM alpine:latest

# Install required packages
RUN apk --no-cache add ca-certificates

# Copy the built binary from the builder stage
COPY --from=builder /app/maxhealth_be /maxhealth_be

# Ensure the binary is executable
RUN chmod +x /maxhealth_be

# Expose port 8080
EXPOSE 8080

# Run the binary
CMD ["./maxhealth_be"]
