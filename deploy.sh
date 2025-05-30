#!/bin/bash

echo "==================================="
echo "Building and deploying Lofi app..."
echo "==================================="

# Check if port 5000 is in use and terminate the process
echo
echo "Checking for existing server processes..."
PORT_PID=$(lsof -t -i:5000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
  echo "Port 5000 is in use by process $PORT_PID. Forcefully stopping it..."
  kill -9 $PORT_PID
  sleep 2
fi

echo
echo "1. Installing dependencies..."
npm run install-all

echo
echo "2. Building frontend..."
cd frontend
npm run build
cd ..

echo
echo "3. Starting server..."
npm start

echo
echo "==================================="
echo "Deployment complete!"
echo "==================================="
