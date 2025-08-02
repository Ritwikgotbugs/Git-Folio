#!/bin/bash
set -e

echo "🚀 Setting up Kubernetes on AWS server..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run as root. Use a regular user with sudo access."
    exit 1
fi

# Check if already installed
if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
    echo "✅ Kubernetes is already installed and running!"
    echo "You can now run: ./k8-aws.sh"
    exit 0
fi

# Update system
echo "📦 Updating system..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install kubectl
echo "☸️ Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

# Install kubeadm
echo "🏗️ Installing kubeadm..."
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl
EOF

sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo systemctl enable kubelet
sudo systemctl start kubelet

# Configure system for Kubernetes
echo "⚙️ Configuring system..."
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# Load kernel modules
sudo modprobe overlay
sudo modprobe br_netfilter

# Configure sysctl
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system

# Initialize Kubernetes cluster
echo "🏗️ Initializing Kubernetes cluster..."
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

# Set up kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install Flannel network plugin
echo "🌐 Installing Flannel network plugin..."
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# Remove taint from master node (for single-node cluster)
kubectl taint nodes --all node-role.kubernetes.io/control-plane-

echo ""
echo "✅ Kubernetes setup completed!"
echo ""
echo "📊 Verify installation:"
echo "   kubectl get nodes"
echo "   kubectl get pods --all-namespaces"
echo ""
echo "🚀 Now you can deploy your app:"
echo "   ./start-app.sh" 