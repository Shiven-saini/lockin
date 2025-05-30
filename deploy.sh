#!/bin/bash

echo "==================================="
echo "Building and deploying Lofi app..."
echo "==================================="

# Check if lsof is installed, install if not
if ! command -v lsof &> /dev/null; then
  echo "lsof not found, attempting to install..."
  sudo apt-get update && sudo apt-get install -y lsof || {
    echo "Could not install lsof. You may need to manually check for processes using port 5000."
  }
fi

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
# Set the SERVER_DEPLOY environment variable to true
export SERVER_DEPLOY=true
npm start

echo
echo "==================================="
echo "Deployment complete!"
echo "==================================="
