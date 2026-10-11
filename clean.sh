#!/bin/bash

# Momentum - Clean/Reset Script
# This script stops all containers, removes volumes, and cleans up generated files
# Use this to roll back to a completely fresh state

set -e  # Exit on any error

echo "🧹 Starting Momentum Cleanup/Reset..."
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This will remove all containers, volumes, and generated files!${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo "  • All Docker containers"
echo "  • All Docker volumes (database data will be lost!)"
echo "  • All Docker networks"
echo "  • Backend build files (dist/)"
echo "  • Client build files (dist/)"
echo "  • Backend node_modules"
echo "  • Client node_modules"
echo "  • Prisma generated files"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${BLUE}Cleanup cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🐳 Step 1: Stopping and Removing Docker Containers${NC}"
cd "$SCRIPT_DIR"
if docker compose ps -q | grep -q .; then
    echo "Stopping all containers..."
    docker compose down -v
    echo -e "${GREEN}✓ All containers stopped and removed${NC}"
else
    echo -e "${YELLOW}⚠ No running containers found${NC}"
fi

echo ""
echo -e "${BLUE}🗑️  Step 2: Removing Docker Volumes${NC}"
# Remove the specific volume if it exists
if docker volume ls | grep -q momentum-db-data; then
    echo "Removing momentum-db-data volume..."
    docker volume rm momentum-db-data 2>/dev/null || echo -e "${YELLOW}⚠ Volume may have been removed with docker compose down${NC}"
    echo -e "${GREEN}✓ Database volume removed${NC}"
else
    echo -e "${YELLOW}⚠ Database volume not found${NC}"
fi

echo ""
echo -e "${BLUE}🧹 Step 3: Cleaning Backend Generated Files${NC}"
cd "$SCRIPT_DIR/backend"

# Remove build output (files may be owned by root from Docker container)
if [ -d "dist" ]; then
    echo "Removing backend/dist/..."
    # Try normal removal first, then sudo if needed (files may be owned by root from Docker)
    if rm -rf dist 2>/dev/null; then
        echo -e "${GREEN}✓ Backend build files removed${NC}"
    else
        echo "Files owned by root, using sudo to remove..."
        sudo rm -rf dist 2>/dev/null && echo -e "${GREEN}✓ Backend build files removed (with sudo)${NC}" || {
            echo -e "${YELLOW}⚠ Some files may still exist. You may need to run: sudo rm -rf backend/dist${NC}"
        }
    fi
else
    echo -e "${YELLOW}⚠ Backend dist/ not found${NC}"
fi

# Remove Prisma generated files (may be owned by root)
if [ -d "node_modules/.prisma" ]; then
    echo "Removing Prisma generated client..."
    if rm -rf node_modules/.prisma 2>/dev/null; then
        echo -e "${GREEN}✓ Prisma generated files removed${NC}"
    else
        echo "Files owned by root, using sudo to remove..."
        sudo rm -rf node_modules/.prisma 2>/dev/null && echo -e "${GREEN}✓ Prisma generated files removed (with sudo)${NC}" || {
            echo -e "${YELLOW}⚠ Some files may still exist. You may need to run: sudo rm -rf backend/node_modules/.prisma${NC}"
        }
    fi
else
    echo -e "${YELLOW}⚠ Prisma generated files not found${NC}"
fi

# Remove node_modules (may be owned by root from Docker)
if [ -d "node_modules" ]; then
    echo "Removing backend/node_modules/..."
    if rm -rf node_modules 2>/dev/null; then
        echo -e "${GREEN}✓ Backend node_modules removed${NC}"
    else
        echo "Files owned by root, using sudo to remove..."
        sudo rm -rf node_modules 2>/dev/null && echo -e "${GREEN}✓ Backend node_modules removed (with sudo)${NC}" || {
            echo -e "${YELLOW}⚠ Some files may still exist. You may need to run: sudo rm -rf backend/node_modules${NC}"
        }
    fi
else
    echo -e "${YELLOW}⚠ Backend node_modules not found${NC}"
fi

echo ""
echo -e "${BLUE}🧹 Step 4: Cleaning Client Generated Files${NC}"
cd "$SCRIPT_DIR/client"

# Remove build output (files may be owned by root from Docker container)
if [ -d "dist" ]; then
    echo "Removing client/dist/..."
    # Try normal removal first, then sudo if needed (files may be owned by root from Docker)
    if rm -rf dist 2>/dev/null; then
        echo -e "${GREEN}✓ Client build files removed${NC}"
    else
        echo "Files owned by root, using sudo to remove..."
        sudo rm -rf dist 2>/dev/null && echo -e "${GREEN}✓ Client build files removed (with sudo)${NC}" || {
            echo -e "${YELLOW}⚠ Some files may still exist. You may need to run: sudo rm -rf client/dist${NC}"
        }
    fi
else
    echo -e "${YELLOW}⚠ Client dist/ not found${NC}"
fi

# Remove node_modules (may be owned by root from Docker)
if [ -d "node_modules" ]; then
    echo "Removing client/node_modules/..."
    if rm -rf node_modules 2>/dev/null; then
        echo -e "${GREEN}✓ Client node_modules removed${NC}"
    else
        echo "Files owned by root, using sudo to remove..."
        sudo rm -rf node_modules 2>/dev/null && echo -e "${GREEN}✓ Client node_modules removed (with sudo)${NC}" || {
            echo -e "${YELLOW}⚠ Some files may still exist. You may need to run: sudo rm -rf client/node_modules${NC}"
        }
    fi
else
    echo -e "${YELLOW}⚠ Client node_modules not found${NC}"
fi

echo ""
echo -e "${BLUE}🧹 Step 5: Cleaning Momentum-AI Generated Files${NC}"
cd "$SCRIPT_DIR/momentum-ai"

# Remove Python cache files
if [ -d "__pycache__" ]; then
    echo "Removing Python __pycache__ files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    echo -e "${GREEN}✓ Python cache files removed${NC}"
else
    echo -e "${YELLOW}⚠ Python cache files not found${NC}"
fi

# Optional: Remove ChromaDB data (commented out by default)
# Uncomment the following lines if you want to remove ChromaDB data too
# if [ -d "chroma_db" ]; then
#     echo "Removing ChromaDB data..."
#     rm -rf chroma_db
#     echo -e "${GREEN}✓ ChromaDB data removed${NC}"
# fi

echo ""
echo -e "${BLUE}🧹 Step 6: Cleaning Docker Networks${NC}"
# Remove the custom network if it exists
if docker network ls | grep -q momentum-network; then
    echo "Removing momentum-network..."
    docker network rm momentum-network 2>/dev/null || echo -e "${YELLOW}⚠ Network may have been removed with docker compose down${NC}"
    echo -e "${GREEN}✓ Network removed${NC}"
else
    echo -e "${YELLOW}⚠ Network not found${NC}"
fi

echo ""
echo -e "${BLUE}🧹 Step 7: Final Cleanup${NC}"
# Remove any orphaned containers
if docker ps -a --filter "name=momentum" --format "{{.Names}}" | grep -q .; then
    echo "Removing any remaining momentum containers..."
    docker ps -a --filter "name=momentum" --format "{{.Names}}" | xargs -r docker rm -f 2>/dev/null || true
    echo -e "${GREEN}✓ Orphaned containers removed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo ""
echo "The project has been reset to a fresh state."
echo ""
echo "What was removed:"
echo "  ✓ All Docker containers"
echo "  ✓ All Docker volumes (database data)"
echo "  ✓ All Docker networks"
echo "  ✓ Backend build files (dist/)"
echo "  ✓ Client build files (dist/)"
echo "  ✓ Backend node_modules"
echo "  ✓ Client node_modules"
echo "  ✓ Prisma generated files"
echo "  ✓ Python cache files"
echo ""
echo "What was kept:"
echo "  • Source code files"
echo "  • .env files (your configuration)"
echo "  • ChromaDB data (vector database)"
echo ""
echo "To start fresh, run:"
echo "  ./setup.sh"
echo ""

