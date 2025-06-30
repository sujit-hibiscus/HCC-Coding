#!/bin/bash

#set -e  # Exit on error
#set -x  # Debug output

PROJECT_DIR="/home/ubuntu/aadi-frontend/HCC-Coding-CodeDeploy"
PM2="/usr/local/bin/pm2"

# Navigate to the project directory
cd "$PROJECT_DIR"

# Remove existing node_modules if it exists
if [ -d "$PROJECT_DIR/node_modules" ]; then
  echo "Removing existing node_modules..."
  rm -rf "$PROJECT_DIR/node_modules"
fi

# Install app dependencies (but NOT pm2)
echo "Installing app dependencies..."
npm install || { echo "npm install failed."; exit 1; }
npm run build
# Ensure PM2 is available
if [ ! -f "$PM2" ]; then
  echo "Global PM2 not found at expected path. Exiting."
  exit 1
fi

# Version checks
node -v
"$PM2" -v

# Stop and delete existing PM2 process named 'aadi-frontend'
"$PM2" delete hcc-coding-dev || echo "No existing PM2 process found for hcc-coding-dev."

# Start the app using PM2 with npm start
"$PM2" start npm --name "hcc-coding-dev" -- run dev

# Save PM2 process list
"$PM2" save

# Checking processes
"$PM2" list

# Restart nginx to apply any reverse proxy config changes
sudo systemctl reload nginx

echo "Deployment completed successfully."
