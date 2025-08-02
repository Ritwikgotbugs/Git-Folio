#!/bin/bash

set -e

echo "🚀 Deploying GitPort to AWS Kubernetes..."

# Build Docker image
echo "Building Docker image..."
docker build -t gitport:latest .

# Create namespace
echo "📁 Creating namespace..."
kubectl create namespace gitport --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "📋 Applying Kubernetes manifests..."
kubectl apply -f manifest/ -n gitport

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/app -n gitport

# Get service information
echo "🌐 Service information:"
kubectl get svc -n gitport

# Get pod information
echo "📦 Pod information:"
kubectl get pods -n gitport

# Get your public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your app is accessible at:"
echo "   http://$PUBLIC_IP:30000"
echo ""
echo "📊 Monitor your deployment:"
echo "   kubectl get pods -n gitport"
echo "   kubectl logs -f deployment/app -n gitport" 