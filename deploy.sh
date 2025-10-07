#!/bin/bash

# Deployment script for Cash Collection Back Office
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment of Cash Collection Back Office..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="cash-collection-backoffice"
GITHUB_REPO="https://github.com/Daryl-Siyapdjie-dev/cash-collection-backoffice.git"
DEPLOY_DIR="/opt/$APP_NAME"
PORT=3000

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "  - App Name: $APP_NAME"
echo "  - Deploy Directory: $DEPLOY_DIR"
echo "  - Port: $PORT"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}🔍 Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo -e "${YELLOW}Installing Docker...${NC}"

    # Install Docker on CentOS/RHEL
    yum install -y yum-utils
    yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl start docker
    systemctl enable docker

    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
    docker --version
fi

# Check if Docker Compose is installed
echo -e "${YELLOW}🔍 Checking Docker Compose installation...${NC}"
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose is already installed${NC}"
fi

# Create deploy directory
echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Updating repository...${NC}"
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    rm -rf *
    git clone $GITHUB_REPO .
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start containers
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for container to be ready
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 5

# Check if container is running
if docker ps | grep -q $APP_NAME; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Application is running at:${NC}"
    echo -e "   ${GREEN}http://$(hostname -I | awk '{print $1}'):$PORT${NC}"
    echo ""
    echo -e "${YELLOW}📊 Container Status:${NC}"
    docker ps | grep $APP_NAME
    echo ""
    echo -e "${YELLOW}📝 View logs with:${NC} docker-compose logs -f"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}📝 Check logs with:${NC} docker-compose logs"
    exit 1
fi

# Configure firewall if needed
if command -v firewall-cmd &> /dev/null; then
    echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
    firewall-cmd --permanent --add-port=$PORT/tcp
    firewall-cmd --reload
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
