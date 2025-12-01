#!/bin/bash

# Momentum - Fresh Setup Script
# This script sets up the entire Momentum project from scratch
# Run this when setting up on a new machine or after a complete reset

set -e  # Exit on any error

echo "🚀 Starting Momentum Fresh Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}🐳 Step 1: Starting Docker Containers${NC}"
cd "$SCRIPT_DIR"
echo "Starting all services with docker compose..."
echo "  • This will automatically install Python requirements for momentum-ai"
echo "  • Database will be created and initialized"
echo "  • Backend and client may exit initially (will be fixed after installing dependencies)"
docker compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for containers to initialize...${NC}"
sleep 3

echo ""
echo -e "${BLUE}📦 Step 2: Installing Backend Dependencies${NC}"
echo "Installing npm packages inside backend container..."

# Backend container may have exited because npm run build failed (no node_modules yet)
# Start a temporary container to install dependencies
echo "Starting temporary container to install dependencies..."
docker compose run --rm -d --name backend-install backend sh -c "tail -f /dev/null" 2>/dev/null || \
docker run -d --name backend-install --network momentum-network \
    -v "$SCRIPT_DIR/backend:/app" \
    -v "$SCRIPT_DIR/backend/node_modules:/app/node_modules" \
    -w /app node:20 sh -c "tail -f /dev/null"

sleep 3

# Install dependencies
if docker exec backend-install sh -c "cd /app && npm install"; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Installation had issues, but continuing...${NC}"
fi

# Clean up temp container
docker stop backend-install 2>/dev/null || true
docker rm backend-install 2>/dev/null || true

echo ""
echo -e "${BLUE}📦 Step 3: Installing Client Dependencies${NC}"
echo "Installing npm packages inside client container..."

# Client container may have exited because npm run dev failed (no node_modules yet)
# Start a temporary container to install dependencies
echo "Starting temporary container to install dependencies..."
docker compose run --rm -d --name client-install client sh -c "tail -f /dev/null" 2>/dev/null || \
docker run -d --name client-install --network momentum-network \
    -v "$SCRIPT_DIR/client:/app" \
    -v "$SCRIPT_DIR/client/node_modules:/app/node_modules" \
    -w /app node:20-alpine sh -c "tail -f /dev/null"

sleep 3

# Install dependencies
if docker exec client-install sh -c "cd /app && npm install"; then
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Installation had issues, but continuing...${NC}"
fi

# Clean up temp container
docker stop client-install 2>/dev/null || true
docker rm client-install 2>/dev/null || true

echo ""
echo -e "${BLUE}🔧 Step 4: Generating Prisma Client${NC}"
echo "Generating Prisma Client with linux-musl support inside backend container..."
# Ensure backend is running
if ! docker ps --format "{{.Names}}" | grep -q "^backend$"; then
    docker start backend
    sleep 2
fi
docker exec backend sh -c "cd /app && npx prisma generate"
echo -e "${GREEN}✓ Prisma Client generated${NC}"

echo ""
echo -e "${BLUE}🔄 Step 5: Restarting Containers with Real Commands${NC}"
echo "Restarting containers to run with actual application commands..."
docker compose restart backend client

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
echo "Waiting for database to be ready..."
# Wait for database to be ready (max 30 seconds)
for i in {1..30}; do
    if docker exec db pg_isready -U momentum > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Database took longer than expected to start${NC}"
    else
        sleep 1
    fi
done

# Wait a bit more for backend to build and start
echo "Waiting for backend to build and start..."
sleep 20

echo ""
echo -e "${BLUE}🗄️  Step 6: Running Database Migrations${NC}"
echo "Connecting to database and applying Prisma migrations..."
if docker exec backend npx prisma migrate deploy 2>/dev/null; then
    echo -e "${GREEN}✓ Database migrations applied successfully${NC}"
else
    echo -e "${YELLOW}⚠ Migrations may have already been applied or backend not ready yet${NC}"
    echo "You can run this manually later: docker exec backend npx prisma migrate deploy"
fi

echo ""
echo -e "${BLUE}📋 Step 7: Verifying Services${NC}"
echo "Checking service health..."

# Check backend
if curl -sS http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:5000${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check failed (may still be starting)${NC}"
fi

# Check client
if curl -sS http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Client is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Client health check failed (may still be starting)${NC}"
fi

# Check momentum-ai
if curl -sS http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Momentum AI is running on http://localhost:8001${NC}"
else
    echo -e "${YELLOW}⚠ Momentum AI health check failed (may still be starting)${NC}"
fi

# Check database
if docker exec db pg_isready -U momentum > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is running on localhost:5432${NC}"
else
    echo -e "${YELLOW}⚠ Database health check failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Services are starting up. You can access:"
echo "  • Frontend:    http://localhost:3000"
echo "  • Backend API: http://localhost:5000/api"
echo "  • AI Service:  http://localhost:8001"
echo "  • Prisma Studio: http://localhost:5555"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop all services:"
echo "  docker compose down"
echo ""
echo "To restart services:"
echo "  docker compose restart"
echo ""

