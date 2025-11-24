# Build stage
FROM golang:1.25-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache git

# Set working directory to workspace root
WORKDIR /workspace

# Copy workspace configuration first (rarely changes)
COPY go.work go.work.sum* ./

# Copy all go.mod and go.sum files (changes less frequently than source)
# Note: Some modules may not have go.sum files, so copy only go.mod for those
COPY shared/go.mod ./shared/
COPY api/go.mod api/go.sum ./api/
COPY services/user/go.mod services/user/go.sum ./services/user/
COPY services/api-gateway/go.mod services/api-gateway/go.sum ./services/api-gateway/
COPY services/guild/go.mod services/guild/go.sum ./services/guild/
COPY services/message/go.mod services/message/go.sum ./services/message/
COPY services/realtime/go.mod services/realtime/go.sum ./services/realtime/
COPY services/media/go.mod services/media/go.sum ./services/media/

# Download all dependencies (cached layer)
RUN go mod download

# Copy shared packages (changes less frequently)
COPY shared/ ./shared/
COPY api/ ./api/

# Copy specific service source
ARG SERVICE_NAME
COPY services/${SERVICE_NAME}/ ./services/${SERVICE_NAME}/

# Build with workspace support and security optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w -extldflags '-static'" \
    -o app ./services/${SERVICE_NAME}/cmd/main.go

# Production stage
FROM alpine:latest AS production

# Copy the binary
COPY --from=builder /workspace/app /app

ENTRYPOINT ["/app"]
