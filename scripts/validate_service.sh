#!/bin/bash

echo "Waiting for the application to start..."

# Try for 30 seconds
for i in {1..6}; do
  if curl -f http://localhost:3000; then
    echo "Application is running."
    exit 0
  fi
  echo "Attempt $i: Application not yet available, retrying..."
  sleep 5
done

echo "Application failed to start after multiple attempts."
exit 1