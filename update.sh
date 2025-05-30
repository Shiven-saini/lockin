#!/bin/bash

echo "==================================="
echo "Updating Lofi app..."
echo "==================================="

# Check if we are in a git repository
if [ -d ".git" ]; then
  echo "Git repository detected, pulling latest changes..."
  git pull
else
  echo "This is not a git repository. Manual update required."
fi

# Run the deployment script
echo "Running deployment script..."
./deploy.sh

# Restart the service if it's running
if systemctl is-active --quiet lockin-lofi; then
  echo "Restarting the service..."
  sudo systemctl restart lockin-lofi
  echo "Service restarted. Status:"
  sudo systemctl status lockin-lofi
else
  echo "Service not currently active. No need to restart."
fi

echo "==================================="
echo "Update complete!"
echo "==================================="
