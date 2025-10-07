# 🚀 Quick Deploy Guide

## Deploy to Server in 1 Command

```bash
ssh root@194.163.132.186
curl -fsSL https://raw.githubusercontent.com/Daryl-Siyapdjie-dev/cash-collection-backoffice/main/quick-deploy.sh | bash
```

## Access Application

```
http://194.163.132.186:8088
```

## Default Login

- **Username**: admin
- **Password**: admin123

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Update application
cd /opt/cash-collection
git pull origin main
docker-compose up -d --build
```

---

Built with Docker for easy deployment 🐳
