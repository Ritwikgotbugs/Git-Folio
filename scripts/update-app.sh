#!/bin/bash

set -e

echo "🔄 Updating GitPort application..."

# Pull latest code (if using git)
echo "📥 Pulling latest code..."
git pull origin main

# Build new Docker image
echo "🏗️ Building new Docker image..."
docker build -t gitport:latest .

# Restart deployment to use new image
echo "🔄 Restarting deployment..."
kubectl rollout restart deployment/app -n gitport

# Wait for rollout to complete
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/app -n gitport

# Check status
echo "📊 Checking deployment status..."
kubectl get pods -n gitport
kubectl get svc -n gitport

echo "✅ Update completed!"
echo "🌐 Your updated app is accessible at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" 