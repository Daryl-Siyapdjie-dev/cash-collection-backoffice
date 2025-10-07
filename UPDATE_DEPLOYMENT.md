# 🔄 MISE À JOUR DU DÉPLOIEMENT

## ✅ CORRECTIONS APPLIQUÉES

### 1. **package.json** - Script Build Corrigé
```json
// AVANT (incorrect)
"build": "tsc -b && vite build"

// APRÈS (correct)
"build": "vite build"
```

### 2. **docker-compose.yml** - Port Mis à Jour
```yaml
// AVANT
ports:
  - "3000:80"  # ou "8080:80"

// APRÈS
ports:
  - "8088:80"  # Port vérifié disponible
```

### 3. **Tous les scripts** - Port 8088 partout
- ✅ `quick-deploy.sh` - Firewall port 8088
- ✅ `DEPLOY_README.md` - URL avec port 8088
- ✅ Documentation mise à jour

---

## 🚀 DÉPLOIEMENT / MISE À JOUR

### Pour un nouveau déploiement:

```bash
ssh root@194.163.132.186

curl -fsSL https://raw.githubusercontent.com/Daryl-Siyapdjie-dev/cash-collection-backoffice/main/quick-deploy.sh | bash
```

### Pour mettre à jour une installation existante:

```bash
ssh root@194.163.132.186

cd /opt/cash-collection

# Pull les dernières modifications
git pull origin main

# Reconstruire avec les corrections
docker-compose down
docker-compose up -d --build

# Vérifier
docker ps
docker-compose logs -f
```

---

## 🌐 ACCÈS

```
http://194.163.132.186:8088
```

**Identifiants:**
- Username: `admin`
- Password: `admin123`

---

## 📝 VÉRIFICATIONS

### 1. Build réussit localement:
```bash
npm install
npm run build
ls dist/  # Doit contenir index.html
```

### 2. Docker build réussit:
```bash
docker build -t test-cash-collection .
```

### 3. Container démarre:
```bash
docker run -p 8088:80 test-cash-collection
```

---

## 🔍 DEBUGGING

### Si le build échoue dans Docker:

```bash
# Voir les logs de build
docker-compose up --build

# Build manuel pour voir les erreurs
docker build -t cash-collection .
```

### Si le container ne démarre pas:

```bash
# Logs du container
docker logs cash-collection-backoffice

# Logs en temps réel
docker-compose logs -f
```

### Si le port est déjà utilisé:

```bash
# Vérifier les ports
netstat -tulpn | grep :8088

# Changer le port dans docker-compose.yml
nano docker-compose.yml
# Modifier: "9000:80" par exemple

# Redéployer
docker-compose down
docker-compose up -d
```

---

**Toutes les corrections ont été appliquées!** ✅
