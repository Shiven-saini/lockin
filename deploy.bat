@echo off
echo ===================================
echo Building and deploying Lofi app...
echo ===================================

echo.
echo 1. Installing dependencies...
call npm run install-all

echo.
echo 2. Building frontend...
cd frontend
call npm run build
cd ..

echo.
echo 3. Starting server...
call npm start

echo.
echo ===================================
echo Deployment complete!
echo ===================================
