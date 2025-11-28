# GYM FIT - Plataforma Integral de Fitness

Una plataforma web moderna que conecta entrenadores y atletas, permitiendo la gestión completa de entrenamientos, seguimiento de progreso y comercio electrónico especializado en productos fitness.

![GymFit Banner](gymfit-simple/public/gymfit.png)

## Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [API Endpoints](#-api-endpoints)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## Características

### Gestión de Usuarios
- **Registro y Autenticación**: Sistema seguro con JWT
- **Roles**: Cliente y Entrenador con permisos diferenciados
- **Perfiles Personalizables**: Avatar, biografía y nombre personalizado

### Gestión de Entrenamientos
- **Rutinas Personalizadas**: Planes de entrenamiento adaptados
- **Seguimiento de Ejercicios**: Registro de series, repeticiones y peso
- **Sesiones de Entrenamiento**: Interface dedicada para workouts
- **Progreso Visual**: Estadísticas detalladas y gráficos de progreso

### Análisis y Estadísticas
- **Métricas Detalladas**: Total de sesiones, kg levantados, rachas actuales
- **Gráficos de Actividad**: Análisis semanal y mensual
- **Radar de Músculos**: Visualización de grupos musculares trabajados
- **Records Personales**: Seguimiento de mejores marcas

### Comunicación
- **Chat en Tiempo Real**: Comunicación directa entre entrenador-cliente
- **Solicitudes de Conexión**: Sistema de solicitud y aprobación
- **Historial de Mensajes**: Conversaciones organizadas

### E-commerce Integrado
- **Tienda Especializada**: Suplementos, ropa y accesorios fitness
- **Carrito de Compras**: Gestión completa de productos
- **Proceso de Pago**: Sistema de checkout integrado
- **Historial de Órdenes**: Seguimiento de compras

### Modo Zen
- **Ambiente de Relajación**: Música y interfaz minimalista
- **Recuperación Mental**: Espacio para descompresión post-entrenamiento

### Valoraciones
- **Evaluaciones de Entrenamiento**: Sistema de assessment
- **Seguimiento de Progreso**: Métricas de mejora continua

## Tecnologías

### Frontend
- **React 19.2.0**: Framework de interfaz de usuario
- **Vite 7.2.4**: Herramienta de build ultrarrápida
- **Lucide React**: Iconografía moderna
- **Recharts**: Visualización de datos y gráficos
- **Axios**: Cliente HTTP para APIs

### Backend
- **Node.js**: Entorno de ejecución JavaScript
- **Express.js**: Framework web minimalista
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación por tokens
- **CORS**: Manejo de políticas de origen cruzado

### DevOps
- **Docker**: Containerización de servicios
- **Docker Compose**: Orquestación de contenedores
- **ESLint**: Linting de código JavaScript

## Arquitectura

La aplicación sigue una arquitectura de microservicios con los siguientes componentes:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │    │   API Gateway    │    │   Auth Service      │
│   (React/Vite)  │◄──►│   (Express)      │◄──►│   (MongoDB)         │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Training Service │
                       │   (MongoDB)      │
                       └──────────────────┘
```

### Servicios

1. **API Gateway** (Puerto 8080)
   - Punto de entrada único
   - Enrutamiento de requests
   - Balanceador de carga

2. **Auth Service** (Puerto 3001)
   - Autenticación de usuarios
   - Gestión de perfiles
   - Sistema de chat

3. **Training Service** (Puerto 3002)
   - Gestión de rutinas
   - Seguimiento de progreso
   - Valoraciones y assessments

## Instalación

### Prerrequisitos
- Node.js 18+ 
- MongoDB 4.4+
- Docker (opcional)
- npm o yarn

### Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd GYM FIT/Plataforma_Gym
   ```

2. **Instalar dependencias**
   ```bash
   # Frontend
   cd gymfit-simple
   npm install

   # Backend Services
   cd ../auth-service
   npm install

   cd ../training-services
   npm install

   cd ../api-gateway
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en cada servicio
   # Auth Service
   MONGO_URI=mongodb://localhost:27017/auth_service_db
   JWT_SECRET=your-super-secret-key

   # Training Service  
   MONGO_URI=mongodb://localhost:27017/training_service_db

   # API Gateway
   AUTH_SERVICE_URL=http://localhost:3001
   TRAINING_SERVICE_URL=http://localhost:3002
   PORT=8080
   ```

4. **Iniciar MongoDB**
   ```bash
   mongod --dbpath /path/to/your/db
   ```

### Con Docker

1. **Build y запуск**
   ```bash
   # Desde el directorio raíz
   cd gymfit-simple
   docker-compose up --build
   ```

2. **Servicios disponibles**
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:8080
   - Auth Service: http://localhost:3001
   - Training Service: http://localhost:3002

## Desarrollo

### Comandos Disponibles

```bash
# Frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting del código

# Backend (en cada servicio)
npm start            # Iniciar servidor
npm run dev          # Modo desarrollo con nodemon
```

### Estructura de Directorios

```
Plataforma_Gym/
├── gymfit-simple/           # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── assets/         # Imágenes y recursos
│   │   └── api.js          # Configuración API
│   ├── public/             # Archivos públicos
│   └── package.json
├── auth-service/           # Servicio de autenticación
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas API
│   └── server.js
├── training-services/      # Servicio de entrenamiento
│   ├── models/            # Modelos de rutinas y progreso
│   ├── routes/            # Rutas API
│   └── server.js
├── api-gateway/           # Gateway de APIs
│   └── server.js
└── docker-compose.yml     # Configuración Docker
```

### Flujo de Desarrollo

1. **Crear rama feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar y testear**
   ```bash
   npm run lint
   npm run dev
   ```

3. **Commit y push**
   ```bash
   git add .
   git commit -m "feat: añadir nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

## Despliegue

### Variables de Entorno de Producción

```bash
# Auth Service
MONGO_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/auth_db
JWT_SECRET=production-secret-key
PORT=3001

# Training Service
MONGO_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/training_db  
PORT=3002

# API Gateway
AUTH_SERVICE_URL=https://auth.gymfit.com
TRAINING_SERVICE_URL=https://training.gymfit.com
PORT=8080
```

### Docker en Producción

```bash
# Build de imágenes
docker-compose build

# Deploy con Docker Swarm o similar
docker stack deploy -c docker-compose.yml gymfit
```

## API Endpoints

### Auth Service (`/api/v1/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registro de usuario |
| POST | `/login` | Iniciar sesión |
| GET | `/profile/:id` | Obtener perfil |
| PUT | `/profile/:id` | Actualizar perfil |

### Chat (`/api/v1/chat`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/trainers` | Obtener entrenadores |
| GET | `/clients/:id` | Obtener clientes de trainer |
| GET | `/history/:user1/:user2` | Historial de chat |
| POST | `/send` | Enviar mensaje |

### Training (`/api/v1/training`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/routines/:clientId` | Obtener rutinas |
| POST | `/routines` | Crear rutina |
| POST | `/progress` | Guardar progreso |
| GET | `/history/:clientId` | Obtener historial |

### Assessments (`/api/v1/assessments`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/:clientId` | Obtener valoraciones |
| POST | `/` | Crear valoración |

## Funcionalidades por Rol

### Cliente
- Ver rutinas asignadas
- Iniciar sesiones de entrenamiento
- Registrar progreso y ejercicios
- Ver estadísticas y gráficos
- Chatear con entrenador
- Comprar en la tienda
- Gestionar perfil personal

### Entrenador  
- Crear y asignar rutinas
- Ver progreso de clientes
- Realizar valoraciones
- Chatear con clientes
- Gestionar solicitudes de conexión
- Ver estadísticas detalladas de clientes

## Testing

```bash
# Ejecutar tests (configurar según necesidades)
npm test

# Tests de integración
npm run test:integration

# Tests de API
npm run test:api
```

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles completos.

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Equipo

- **Desarrollo Frontend**: React/Vite Team
- **Desarrollo Backend**: Node.js/MongoDB Team  
- **DevOps**: Docker/Kubernetes Team
- **UI/UX Design**: Design Team

## Soporte

- **Email**: soporte@gymfit.com
- **WhatsApp**: +57 300 123 4567
- **Ubicación**: Bogotá, Colombia
- **Web**: https://gymfit.com

## Roadmap

### Versión 2.0
- Aplicación móvil (React Native)
- Integración con wearables
- Inteligencia artificial para rutinas
- Sistema de pagos avanzado
- Marketplace de entrenadores

### Versión 2.1
- Gamificación y logros
- Comunidad y grupos
- Análisis nutricional
- Video llamadas con entrenador

---

<div align="center">

**¡Transforma tu cuerpo, domina tu mente!**

[GYM FIT](https://gymfit.com) - *La plataforma que tu evolución necesita*

</div>
