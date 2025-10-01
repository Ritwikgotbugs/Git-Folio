#!/bin/bash

set -e

echo "🚀 Deploying GitPort to AWS K3s..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install K3s first."
    exit 1
fi

# Check if K3s cluster is running
if ! k3s kubectl cluster-info &> /dev/null; then
    echo "❌ K3s cluster is not running. Please start K3s first."
    exit 1
fi

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t gitport:latest .

# Load image into K3s containerd
echo "📦 Loading image into K3s..."
TMP_IMG=/tmp/gitport.tar
docker save gitport:latest -o $TMP_IMG
sudo k3s ctr images import $TMP_IMG
rm $TMP_IMG

# Create namespace
echo "📁 Creating namespace..."
k3s kubectl create namespace gitport --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "📋 Applying Kubernetes manifests..."
k3s kubectl apply -f manifest/ -n gitport


# Get your public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your app is accessible at:"
echo "   http://$PUBLIC_IP"
echo ""
echo "📊 Monitor your deployment:"
echo "   kubectl get pods -n gitport"
echo "   kubectl logs -f deployment/app -n gitport"
