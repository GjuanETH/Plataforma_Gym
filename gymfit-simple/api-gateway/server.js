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

// 2. Definir URL de los servicios (Variables de entorno o localhost para Docker)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const TRAINING_SERVICE_URL = process.env.TRAINING_SERVICE_URL || 'http://training-services:3002'; 

// 3. Ruta de Salud
app.get('/', (req, res) => {
    res.send('API Gateway GymFit funcionando 🚀');
});

// 4. Configurar Proxies

// --- AUTH SERVICE & CHAT (Todo va al puerto 3001) ---
app.use(['/api/v1/auth', '/api/v1/chat', '/api/v1/clients'], createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
       // console.log(`[Proxy Auth Group] ...`);
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error Auth Group]', err);
        res.status(500).send('Error de conexión');
    }
}));

// --- TRAINING SERVICE & ASSESSMENTS (Va al puerto 3002) ---
// CAMBIO AQUÍ: Agregamos '/api/v1/assessments' al arreglo para que pase
app.use(['/api/v1/training', '/api/v1/assessments'], createProxyMiddleware({
    target: TRAINING_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('[Proxy Error Training]', err);
        res.status(500).send('Error de conexión con Training Service');
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Gateway corriendo en el puerto ${PORT}`);
    console.log(` -> Redirigiendo Auth/Chat a: ${AUTH_SERVICE_URL}`);
    console.log(` -> Redirigiendo Training/Assessments a: ${TRAINING_SERVICE_URL}`);
});