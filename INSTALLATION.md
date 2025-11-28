# Manual de Instalación - GYM FIT

## Guía Completa de Instalación y Configuración

Este documento proporciona instrucciones detalladas para instalar y configurar el proyecto GYM FIT desde cero en diferentes entornos.

---

## Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: Versión 18.0 o superior
- **npm**: Versión 8.0 o superior
- **MongoDB**: Versión 4.4 o superior
- **Git**: Versión 2.0 o superior
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Espacio en disco**: Mínimo 2GB libres

### Requisitos Recomendados
- **Node.js**: Versión 20.x LTS
- **MongoDB**: Versión 6.0 o superior
- **RAM**: 8GB o más
- **Docker**: Versión 20.0 o superior (para containerización)

---

## Instalación Paso a Paso

### Paso 1: Preparación del Entorno

#### Instalar Node.js

**Windows/macOS:**
1. Descarga Node.js desde [nodejs.org](https://nodejs.org/)
2. Ejecuta el instalador y sigue las instrucciones
3. Verifica la instalación:
   ```bash
   node --version
   npm --version
   ```

**Ubuntu/Debian:**
```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### Instalar MongoDB

**Windows:**
1. Descarga MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community)
2. Ejecuta el instalador como administrador
3. Selecciona "Run service as Network Service user"
4. Completa la instalación

**macOS (con Homebrew):**
```bash
# Instalar Homebrew si no está instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB como servicio
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Debian:**
```bash
# Importar clave pública de MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Agregar repositorio de MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Instalar MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Iniciar y habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Instalar Git

**Windows:**
1. Descarga Git desde [git-scm.com](https://git-scm.com/download/win)
2. Ejecuta el instalador con configuración predeterminada

**macOS:**
```bash
# Instalar con Homebrew
brew install git

# O descargar desde git-scm.com
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install git
```

### Paso 2: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <repository-url>
cd GYM FIT/Plataforma_Gym

# Verificar estructura del proyecto
ls -la
```

**Estructura esperada:**
```
Plataforma_Gym/
├── gymfit-simple/           # Frontend React
├── auth-service/           # Servicio de autenticación
├── training-services/      # Servicio de entrenamiento
├── api-gateway/           # Gateway de APIs
└── docker-compose.yml     # Configuración Docker
```

### Paso 3: Instalación de Dependencias

#### Frontend (React/Vite)

```bash
# Navegar al directorio del frontend
cd gymfit-simple

# Instalar dependencias
npm install

# Verificar instalación
npm list
```

#### Auth Service

```bash
# Regresar al directorio raíz
cd ../auth-service

# Instalar dependencias
npm install

# Verificar instalación
npm list
```

#### Training Services

```bash
# Navegar al directorio
cd ../training-services

# Instalar dependencias
npm install

# Verificar instalación
npm list
```

#### API Gateway

```bash
# Navegar al directorio
cd ../api-gateway

# Instalar dependencias
npm install

# Verificar instalación
npm list
```

### Paso 4: Configuración de Variables de Entorno

#### Auth Service (.env)

Crear archivo `auth-service/.env`:

```bash
# Configuración de base de datos
MONGO_URI=mongodb://localhost:27017/auth_service_db

# Configuración JWT
JWT_SECRET=tu-super-secret-jwt-key-aqui-muy-larga-y-segura-2025

# Configuración del servidor
PORT=3001
NODE_ENV=development

# Configuración CORS
CORS_ORIGIN=http://localhost:5173

# Configuración de email (opcional para desarrollo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-app
```

#### Training Services (.env)

Crear archivo `training-services/.env`:

```bash
# Configuración de base de datos
MONGO_URI=mongodb://localhost:27017/training_service_db

# Configuración del servidor
PORT=3002
NODE_ENV=development

# Configuración CORS
CORS_ORIGIN=http://localhost:5173

# Configuración de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Configuración de imágenes
IMGBB_API_KEY=5ddc683f72b1a8e246397ff506b520d5
```

#### API Gateway (.env)

Crear archivo `api-gateway/.env`:

```bash
# Puertos de servicios
PORT=8080
NODE_ENV=development

# URLs de servicios
AUTH_SERVICE_URL=http://localhost:3001
TRAINING_SERVICE_URL=http://localhost:3002

# Configuración CORS
CORS_ORIGIN=http://localhost:5173

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Paso 5: Inicialización de Bases de Datos

#### Iniciar MongoDB

```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# Si no está corriendo, iniciarlo:
sudo systemctl start mongod
```

#### Crear Bases de Datos

```bash
# Conectar a MongoDB
mongo

# Crear bases de datos para cada servicio
use auth_service_db
db.createCollection("users")

use training_service_db
db.createCollection("routines")
db.createCollection("progress")
db.createCollection("assessments")

# Salir de MongoDB
exit
```

### Paso 6: Iniciar los Servicios

#### Opción A: Inicio Manual (Desarrollo)

**Terminal 1 - Auth Service:**
```bash
cd auth-service
npm run dev
```

**Terminal 2 - Training Services:**
```bash
cd training-services
npm run dev
```

**Terminal 3 - API Gateway:**
```bash
cd api-gateway
npm run dev
```

**Terminal 4 - Frontend:**
```bash
cd gymfit-simple
npm run dev
```

#### Opción B: Con Docker (Recomendado)

```bash
# Desde el directorio raíz del proyecto
cd gymfit-simple

# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

---

## Verificación de Instalación

### Verificar Servicios

#### 1. Verificar Frontend
```bash
# El frontend debe estar disponible en:
curl http://localhost:5173

# Debe responder con HTML de React
```

#### 2. Verificar Auth Service
```bash
# Verificar que el servicio responde
curl http://localhost:3001/api/v1/auth/test

# Debe responder con mensaje de éxito
```

#### 3. Verificar Training Service
```bash
# Verificar que el servicio responde
curl http://localhost:3002/api/v1/training/test

# Debe responder con mensaje de éxito
```

#### 4. Verificar API Gateway
```bash
# Verificar que el gateway enruta correctamente
curl http://localhost:8080/api/v1/auth/test

# Debe responder con mensaje del auth service
```

### Pruebas de Conectividad

#### Probar Registro de Usuario

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "Client"
  }'
```

#### Probar Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Configuración de Producción

### Variables de Entorno de Producción

#### Auth Service (.env.production)

```bash
# Base de datos de producción
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/auth_production_db

# JWT secreto fuerte
JWT_SECRET=jwt-production-secret-super-long-and-secure-2025

# Configuración del servidor
PORT=3001
NODE_ENV=production

# CORS configurado para dominio de producción
CORS_ORIGIN=https://gymfit.com

# Configuración de logging
LOG_LEVEL=info
LOG_FILE=./logs/auth-service.log
```

#### Training Services (.env.production)

```bash
# Base de datos de producción
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/training_production_db

# Configuración del servidor
PORT=3002
NODE_ENV=production

# CORS configurado para dominio de producción
CORS_ORIGIN=https://gymfit.com

# Configuración de archivos
UPLOAD_PATH=/var/www/gymfit/uploads
MAX_FILE_SIZE=5242880

# Configuración de imágenes en producción
IMGBB_API_KEY=tu-api-key-produccion
CDN_URL=https://cdn.gymfit.com
```

#### API Gateway (.env.production)

```bash
# Configuración del servidor
PORT=8080
NODE_ENV=production

# URLs de servicios en producción
AUTH_SERVICE_URL=https://auth.gymfit.com
TRAINING_SERVICE_URL=https://api.gymfit.com

# CORS configurado para dominio de producción
CORS_ORIGIN=https://gymfit.com

# Configuración de SSL
SSL_KEY_PATH=/etc/ssl/private/gymfit.key
SSL_CERT_PATH=/etc/ssl/certs/gymfit.crt

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Configuración con PM2 (Process Manager)

#### Instalar PM2

```bash
npm install -g pm2
```

#### Configuración PM2

Crear archivo `ecosystem.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  apps: [{
    name: 'auth-service',
    script: './auth-service/server.js',
    cwd: './auth-service',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }, {
    name: 'training-service',
    script: './training-services/server.js',
    cwd: './training-services',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }, {
    name: 'api-gateway',
    script: './api-gateway/server.js',
    cwd: './api-gateway',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
}
```

#### Iniciar con PM2

```bash
# Iniciar todos los servicios
pm2 start ecosystem.config.js

# Ver estado de servicios
pm2 status

# Ver logs
pm2 logs

# Detener servicios
pm2 stop all

# Reiniciar servicios
pm2 restart all
```

---

## Solución de Problemas Comunes

### Error: "Cannot connect to MongoDB"

**Síntoma:** Servicios no pueden conectar a MongoDB

**Solución:**
```bash
# Verificar estado de MongoDB
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod

# Verificar logs
sudo journalctl -u mongod -f

# Verificar que el puerto 27017 esté disponible
netstat -tulpn | grep 27017
```

### Error: "Port already in use"

**Síntoma:** Error al iniciar servicios en puertos específicos

**Solución:**
```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3001

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en archivo .env
```

### Error: "Module not found"

**Síntoma:** Errores de dependencias faltantes

**Solución:**
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules
rm -rf node_modules

# Reinstalar dependencias
npm install

# Verificar versión de Node.js
node --version
```

### Error: "CORS Policy"

**Síntoma:** Errores de CORS en el navegador

**Solución:**
```bash
# Verificar configuración CORS en .env
CORS_ORIGIN=http://localhost:5173

# Reiniciar servicios
pm2 restart all
```

### Error: "JWT Secret not provided"

**Síntoma:** Error de autenticación

**Solución:**
```bash
# Verificar que JWT_SECRET esté configurado en auth-service/.env
echo $JWT_SECRET

# Si está vacío, configurar una clave segura
JWT_SECRET=tu-clave-super-secreta-aqui-2025
```

---

## Scripts de Automatización

### Script de Instalación Completa (install.sh)

Crear archivo `install.sh`:

```bash
#!/bin/bash

echo "Iniciando instalación de GYM FIT..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js no está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Instalando..."
    sudo apt install npm
fi

# Instalar dependencias del frontend
echo "Instalando dependencias del frontend..."
cd gymfit-simple
npm install

# Instalar dependencias del auth service
echo "Instalando dependencias del auth service..."
cd ../auth-service
npm install

# Instalar dependencias del training service
echo "Instalando dependencias del training service..."
cd ../training-services
npm install

# Instalar dependencias del API gateway
echo "Instalando dependencias del API gateway..."
cd ../api-gateway
npm install

echo "Instalación completada!"
echo "Para iniciar el proyecto, ejecuta: npm run dev en cada directorio"
```

### Script de Inicio (start.sh)

Crear archivo `start.sh`:

```bash
#!/bin/bash

echo "Iniciando servicios de GYM FIT..."

# Función para manejar cierre de procesos
cleanup() {
    echo "Deteniendo todos los servicios..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar servicios en background
echo "Iniciando Auth Service..."
cd auth-service && npm run dev &
AUTH_PID=$!

echo "Iniciando Training Service..."
cd ../training-services && npm run dev &
TRAINING_PID=$!

echo "Iniciando API Gateway..."
cd ../api-gateway && npm run dev &
GATEWAY_PID=$!

echo "Iniciando Frontend..."
cd ../gymfit-simple && npm run dev &
FRONTEND_PID=$!

echo "Todos los servicios iniciados!"
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar indefinidamente
wait
```

---

## Monitoreo y Logs

### Configuración de Logs

#### Auth Service Logs

```bash
# Logs en tiempo real
tail -f auth-service/logs/auth-service.log

# Buscar errores
grep "ERROR" auth-service/logs/auth-service.log
```

#### Training Service Logs

```bash
# Logs en tiempo real
tail -f training-services/logs/training-service.log

# Buscar errores
grep "ERROR" training-services/logs/training-service.log
```

### Monitoreo de Recursos

```bash
# Monitorear uso de CPU y memoria
top

# Monitorear puertos en uso
netstat -tulpn

# Verificar espacio en disco
df -h

# Verificar memoria disponible
free -h
```

---

## Backup y Restauración

### Backup de Bases de Datos

```bash
# Backup de auth service database
mongodump --db auth_service_db --out ./backups/$(date +%Y%m%d)_auth_db

# Backup de training service database
mongodump --db training_service_db --out ./backups/$(date +%Y%m%d)_training_db
```

### Restauración de Bases de Datos

```bash
# Restaurar auth service database
mongorestore --db auth_service_db ./backups/20251128_auth_db/auth_service_db

# Restaurar training service database
mongorestore --db training_service_db ./backups/20251128_training_db/training_service_db
```

---

## Optimización de Rendimiento

### Configuración de MongoDB

Editar `/etc/mongod.conf`:

```yaml
# Configuración optimizada para desarrollo
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

# Configuración de rendimiento
operationProfiling:
  slowOpThresholdMs: 100
```

### Configuración de Node.js

#### Variables de entorno para producción:

```bash
# Aumentar límite de memoria
NODE_OPTIONS="--max-old-space-size=4096"

# Optimizaciones de V8
NODE_OPTIONS="--optimize-for-size --max-old-space-size=4096 --gc-interval=100"
```

---

## Actualización del Sistema

### Actualizar Dependencias

```bash
# Actualizar dependencias en todos los servicios
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix
```

### Actualizar MongoDB

```bash
# Backup antes de actualizar
./backup_databases.sh

# Actualizar MongoDB
sudo apt update
sudo apt install --only-upgrade mongodb-org

# Reiniciar servicio
sudo systemctl restart mongod
```

---

## Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] npm 8+ instalado
- [ ] MongoDB 4.4+ instalado y funcionando
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas en todos los servicios
- [ ] Variables de entorno configuradas
- [ ] Bases de datos creadas
- [ ] Servicios iniciados correctamente
- [ ] Frontend accesible en http://localhost:5173
- [ ] API Gateway accesible en http://localhost:8080
- [ ] Auth Service respondiendo en http://localhost:3001
- [ ] Training Service respondiendo en http://localhost:3002
- [ ] Pruebas de registro y login funcionando
- [ ] Logs configurados correctamente
- [ ] Scripts de backup configurados

---

**Soporte para Instalación:**

Si encuentras problemas durante la instalación, contacta al equipo de desarrollo:
- **Email**: dev-team@gymfit.com
- **Documentación**: [wiki.gymfit.com/installation](https://wiki.gymfit.com/installation)
- **Issues**: [GitHub Issues](https://github.com/gymfit/issues)

---

**Versión del Manual**: 1.0  
**Última Actualización**: Noviembre 2025  
**Compatibilidad**: GYM FIT v1.0+