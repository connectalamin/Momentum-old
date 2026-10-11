#!/bin/sh

# Start Prisma Studio in the background
echo "Starting Prisma Studio on port 5555..."
npx prisma studio --hostname 0.0.0.0 --port 5555 > /tmp/prisma-studio.log 2>&1 &
PRISMA_PID=$!

# Give Prisma Studio a moment to start
sleep 3

# Verify Prisma Studio started
if kill -0 $PRISMA_PID 2>/dev/null; then
    echo "Prisma Studio is running (PID: $PRISMA_PID)"
else
    echo "Warning: Prisma Studio may not have started correctly"
fi

# Start the Express server (foreground - this keeps the container alive)
echo "Starting Express server on port 5000..."
npm run start

# If Express server exits, kill Prisma Studio
kill $PRISMA_PID 2>/dev/null || true
