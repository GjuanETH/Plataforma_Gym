const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORTAR MODELOS ---
require('./models/Routine'); 
require('./models/Progress'); 
require('./models/Assessment'); 
// ------------------------

// --- IMPORTAR RUTAS ---
const routineRoutes = require('./routes/routines'); 
const progressRoutes = require('./routes/progress');
const assessmentRoutes = require('./routes/assessments'); 
// ---------------------

const app = express();

app.use(cors());
app.use(express.json());

// --- LOG DE DEPURACIÓN (Para ver si llegan las peticiones) ---
app.use((req, res, next) => {
    console.log(`[TRAINING-SERVICE] Petición entrante: ${req.method} ${req.url}`);
    next();
});

// --- USAR RUTAS ---
app.use('/api/v1/training', routineRoutes);
app.use('/api/v1/training/progress', progressRoutes);
app.use('/api/v1/assessments', assessmentRoutes);

// --- CONEXIÓN DB Y ARRANQUE ---
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3002;

if (!MONGO_URI) {
    console.error("❌ ERROR FATAL: No hay MONGO_URI definida.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Training Service conectado a MongoDB');
        
        // --- LA PIEZA QUE FALTABA: ARRANCAR EL SERVIDOR EN 0.0.0.0 ---
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Training Service corriendo en http://0.0.0.0:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Error Mongo:', err);
        process.exit(1);
    });