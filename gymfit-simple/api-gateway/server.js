const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// 1. Configuración de CORS
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Definir URL de los servicios
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const TRAINING_SERVICE_URL = process.env.TRAINING_SERVICE_URL || 'http://localhost:3002'; // Corregido ;;

// 3. Ruta de Salud
app.get('/', (req, res) => {
    res.send('API Gateway GymFit funcionando 🚀');
});

// 4. Configurar Proxies

// --- AUTH SERVICE ---
app.use('/api/v1/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy Auth] ${req.method} ${req.originalUrl} -> ${AUTH_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error Auth]', err);
        res.status(500).send('Error de conexión con Auth Service');
    }
}));

// --- TRAINING SERVICE ---
app.use('/api/v1/training', createProxyMiddleware({
    target: TRAINING_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy Training] Redirigiendo -> ${TRAINING_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error Training]', err);
        res.status(500).send('Error de conexión con Training Service');
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Gateway corriendo en el puerto ${PORT}`);
    console.log(` -> Auth Service: ${AUTH_SERVICE_URL}`);
    console.log(` -> Training Service: ${TRAINING_SERVICE_URL}`); // ¡Si no ves esto, no se actualizó!
});