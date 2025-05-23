#!/bin/bash

echo "==================================="
echo "Building and deploying Lofi app..."
echo "==================================="

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
