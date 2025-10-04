#!/bin/bash

# Quick Deploy Script for Cash Collection Back Office
# Usage: bash quick-deploy.sh

set -e

echo "🚀 Cash Collection Back Office - Quick Deploy"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root${NC}"
    exit 1
fi

# Step 1: Install Docker
echo -e "${YELLOW}📦 Step 1/6: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Step 2: Install Docker Compose
echo -e "${YELLOW}📦 Step 2/6: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Step 3: Clone repository
echo -e "${YELLOW}📥 Step 3/6: Cloning repository...${NC}"
DEPLOY_DIR="/opt/cash-collection"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    rm -rf *
    git clone https://github.com/Daryl-Siyapdjie-dev/cash-collection-backoffice.git .
fi
echo -e "${GREEN}✅ Repository ready${NC}"

# Step 4: Stop existing containers
echo -e "${YELLOW}🛑 Step 4/6: Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✅ Old containers stopped${NC}"

# Step 5: Build and start
echo -e "${YELLOW}🔨 Step 5/6: Building and starting application...${NC}"
docker-compose up -d --build
echo -e "${GREEN}✅ Application started${NC}"

# Step 6: Configure firewall
echo -e "${YELLOW}🔥 Step 6/6: Configuring firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  Firewall-cmd not found, skipping...${NC}"
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 Access your application at:"
echo -e "   ${GREEN}http://${SERVER_IP}:8080${NC}"
echo -e "   ${GREEN}http://194.163.132.186:8080${NC}"
echo ""
echo -e "📊 Useful commands:"
echo -e "   ${YELLOW}docker ps${NC}                    - View running containers"
echo -e "   ${YELLOW}docker-compose logs -f${NC}       - View logs"
echo -e "   ${YELLOW}docker-compose restart${NC}       - Restart application"
echo -e "   ${YELLOW}docker-compose down${NC}          - Stop application"
echo ""
echo -e "🔐 Default login:"
echo -e "   Username: ${YELLOW}admin${NC}"
echo -e "   Password: ${YELLOW}admin123${NC}"
echo ""
