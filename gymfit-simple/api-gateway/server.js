const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// --- 1. CONFIGURACIÓN CORS ---
const allowedOrigins = [
    'https://black-moss-056cc280f.3.azurestaticapps.net', 
    'http://localhost:5173', 
    'http://localhost:4173'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log(`[CORS BLOQUEADO] Origen: ${origin}`);
            return callback(new Error('Bloqueado por CORS'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    console.log(`[GATEWAY] ${req.method} ${req.url}`);
    next();
});

// --- 3. DEFINICIÓN DE SERVICIOS (CORREGIDO PARA DOCKER) ---
// CAMBIO: El fallback ahora apunta al nombre del servicio en Docker, no a 127.0.0.1
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const TRAINING_SERVICE_URL = process.env.TRAINING_SERVICE_URL || 'http://training-services:3002'; 

console.log(`[CONFIG] Auth apunta a: ${AUTH_SERVICE_URL}`);
console.log(`[CONFIG] Training apunta a: ${TRAINING_SERVICE_URL}`);

app.get('/', (req, res) => res.send('API Gateway GymFit funcionando 🚀'));

// --- 5. PROXIES ---
app.use(['/api/v1/auth', '/api/v1/chat', '/api/v1/clients'], createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        // A veces es necesario, a veces no. Si tus microservicios esperan /api/v1, déjalo así.
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error Auth]', err.code);
        res.status(500).json({ error: 'Auth Service no disponible', details: err.message });
    }
}));

app.use(['/api/v1/training', '/api/v1/assessments'], createProxyMiddleware({
    target: TRAINING_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('[Proxy Error Training]', err.code);
        res.status(500).json({ error: 'Training Service no disponible', details: err.message });
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`🚀 Gateway en puerto ${PORT}`);
});