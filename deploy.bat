@echo off
echo ===================================
echo Building and deploying Lofi app...
echo ===================================

echo.
echo Checking for existing server processes...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') DO (
  echo Port 5000 is in use by process %%P. Attempting to stop it...
  taskkill /F /PID %%P
  timeout /t 2
)

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
set SERVER_DEPLOY=true
call npm start

echo.
echo ===================================
echo Deployment complete!
echo ===================================
