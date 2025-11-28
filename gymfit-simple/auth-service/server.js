const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- CARGA DE MODELOS ---
require('./models/User'); 
require('./models/message'); // Respetando tu nombre de archivo (minúscula)
require('./models/Request.js');
// ------------------------

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const clientRoutes = require('./routes/clients.js');

const app = express();

app.use(cors());
app.use(express.json());

// --- LOG DE DEPURACIÓN (Para ver si llegan las peticiones en Azure) ---
app.use((req, res, next) => {
    console.log(`[AUTH-SERVICE] Petición entrante: ${req.method} ${req.url}`);
    next();
});

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/clients', clientRoutes);

// --- CONEXIÓN DB Y ARRANQUE ---
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001;

// Validación de seguridad
if (!MONGO_URI) {
    console.error("❌ ERROR FATAL: No hay MONGO_URI definida.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Auth Service conectado a MongoDB');
        
        // --- CAMBIO CLAVE AQUÍ: '0.0.0.0' ---
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Auth Service corriendo en http://0.0.0.0:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Error Mongo:', err);
        process.exit(1);
    });