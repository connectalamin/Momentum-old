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

# Load .env file if it exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo "Loading environment variables from .env file..."
    # Export variables from .env file, ignoring comments and empty lines
    set -a  # Automatically export all variables
    # Use a temporary file to filter comments and empty lines, then source it
    grep -v '^[[:space:]]*#' "$SCRIPT_DIR/.env" | grep -v '^[[:space:]]*$' > "$SCRIPT_DIR/.env.tmp" 2>/dev/null || true
    if [ -f "$SCRIPT_DIR/.env.tmp" ] && [ -s "$SCRIPT_DIR/.env.tmp" ]; then
        source "$SCRIPT_DIR/.env.tmp"
        rm -f "$SCRIPT_DIR/.env.tmp"
    fi
    set +a  # Stop automatically exporting
    echo -e "${GREEN}✓ Environment variables loaded from .env${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found, using defaults${NC}"
fi

# Base host for all local HTTP checks/URLs.
# Can be overridden by exporting BASE_HOST before running this script.
# This will use BASE_HOST from .env if loaded, otherwise default to http://localhost
BASE_HOST="${BASE_HOST:-http://localhost}"

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

# Ensure backend container is running
if ! docker ps --format "{{.Names}}" | grep -q "^backend$"; then
    echo "Starting backend container..."
    docker start backend
    sleep 5
fi

# Run migrations with proper error handling
MIGRATE_OUTPUT=$(docker exec backend npx prisma migrate deploy 2>&1)
MIGRATE_EXIT_CODE=$?

if [ $MIGRATE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations applied successfully${NC}"
    # Check if there were pending migrations
    if echo "$MIGRATE_OUTPUT" | grep -q "No pending migrations"; then
        echo "  (All migrations were already applied)"
    fi
else
    echo -e "${RED}✗ Migrations failed with exit code $MIGRATE_EXIT_CODE${NC}"
    echo "Error output:"
    echo "$MIGRATE_OUTPUT" | tail -20
    echo ""
    echo -e "${YELLOW}⚠ You can try running migrations manually:${NC}"
    echo "  docker exec backend npx prisma migrate deploy"
fi

echo ""
echo -e "${BLUE}🌱 Step 7: Seeding Database with Bangladeshi Context Data${NC}"
echo "Running Prisma seed to populate sample users..."

# Ensure backend container is running
if ! docker ps --format "{{.Names}}" | grep -q "^backend$"; then
    echo "Starting backend container..."
    docker start backend
    sleep 5
fi

# Wait for backend to be ready (check if node_modules exists and backend is responsive)
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if docker exec backend sh -c "test -d /app/node_modules && test -f /app/node_modules/.bin/ts-node" 2>/dev/null; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Backend took longer than expected to be ready${NC}"
    else
        sleep 1
    fi
done

# Run the seed command with proper error handling
echo "Running seed command..."
SEED_OUTPUT=$(docker exec backend npx prisma db seed 2>&1)
SEED_EXIT_CODE=$?

if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded successfully with Bangladeshi context data${NC}"
    # Show summary if available
    echo "$SEED_OUTPUT" | grep -E "(Total users created|Database seed completed)" || true
else
    echo -e "${RED}✗ Seed failed with exit code $SEED_EXIT_CODE${NC}"
    echo "Error output:"
    echo "$SEED_OUTPUT" | tail -20
    echo ""
    echo -e "${YELLOW}⚠ You can try running the seed manually:${NC}"
    echo "  docker exec backend npx prisma db seed"
fi

echo ""
echo -e "${BLUE}📋 Step 8: Verifying Services${NC}"
echo "Checking service health..."

# Check backend
if curl -sS "$BASE_HOST:5000/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on $BASE_HOST:5000${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check failed (may still be starting)${NC}"
fi

# Check client
if curl -sS "$BASE_HOST:3000" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Client is running on $BASE_HOST:3000${NC}"
else
    echo -e "${YELLOW}⚠ Client health check failed (may still be starting)${NC}"
fi

# Check momentum-ai
if curl -sS "$BASE_HOST:8001/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Momentum AI is running on $BASE_HOST:8001${NC}"
else
    echo -e "${YELLOW}⚠ Momentum AI health check failed (may still be starting)${NC}"
fi

# Check database
if docker exec db pg_isready -U momentum > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is running on $BASE_HOST:5432${NC}"
else
    echo -e "${YELLOW}⚠ Database health check failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Services are starting up. You can access:"
echo "  • Frontend:    $BASE_HOST:3000"
echo "  • Backend API: $BASE_HOST:5000/api"
echo "  • AI Service:  $BASE_HOST:8001"
echo "  • Prisma Studio: $BASE_HOST:5555"
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