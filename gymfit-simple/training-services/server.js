const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importación de rutas
const routineRoutes = require('./routes/routines');
const progressRoutes = require('./routes/progress'); 

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a Base de Datos
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/training_service_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Training Service conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// --- DEFINICIÓN DE RUTAS ---
// Nota: Es mejor definir las rutas específicas primero para evitar conflictos de coincidencia

// 1. Ruta para Progreso (Log de ejercicios)
// Url final: http://localhost:8080/api/v1/training/progress
app.use('/api/v1/training/progress', progressRoutes);

// 2. Ruta para Rutinas (Crear, Leer, Borrar)
// Url final: http://localhost:8080/api/v1/training
app.use('/api/v1/training', routineRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`💪 Training Service corriendo en puerto ${PORT}`));