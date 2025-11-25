const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// 1. Configuración de CORS (Vital para que React pueda conectarse)
app.use(cors({
    origin: '*', // En producción esto se cambia por la URL real del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Definir URL de los servicios (vienen de docker-compose.yml)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
const TRAINING_SERVICE_URL = process.env.TRAINING_SERVICE_URL || 'http://localhost:3002';;

// 3. Ruta de Salud (Para ver si el Gateway está vivo)
app.get('/', (req, res) => {
    res.send('API Gateway GymFit funcionando 🚀');
});

// 4. Configurar el Proxy
// Todo lo que empiece por /api/v1/auth se va al Auth Service
app.use('/api/v1/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    // Importante: No reescribimos el path porque el Auth Service ya espera /api/v1/auth
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Redirigiendo ${req.method} ${req.originalUrl} -> ${AUTH_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
        res.status(500).send('Error de conexión con el microservicio');
    }
}));

app.use('/api/v1/training', createProxyMiddleware({
    target: TRAINING_SERVICE_URL,
    changeOrigin: true,
    // Importante: Training service espera /api/v1/training, así que no reescribimos path
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Redirigiendo Training -> ${TRAINING_SERVICE_URL}`);
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Gateway corriendo en el puerto ${PORT}`);
    console.log(` -> Redirigiendo Auth a: ${AUTH_SERVICE_URL}`);
});