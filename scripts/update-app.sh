#!/bin/bash

set -e

echo "🔄 Updating GitPort application..."

# Pull latest code (force reset for clean update)
echo "📥 Pulling latest code..."
git reset --hard
git clean -fd
git pull origin main

# Build new Docker image
echo "🏗️ Building new Docker image..."
docker build -t gitport:latest .

# Load image into K3s containerd
echo "📦 Loading image into K3s..."
TMP_IMG=$(mktemp /tmp/gitport.XXXXXX.tar)
docker save gitport:latest -o $TMP_IMG
sudo k3s ctr images import $TMP_IMG
rm -f $TMP_IMG

# Restart deployment
echo "🔄 Restarting deployment..."
kubectl rollout restart deployment/app -n gitport

# Wait for rollout to complete
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/app -n gitport

# Check status
echo "📊 Deployment status:"
kubectl get pods -n gitport
kubectl get svc -n gitport

echo "✅ Update completed!"
echo "🌐 Your updated app is accessible at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"