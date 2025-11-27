const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORTAR MODELOS (Para evitar errores de Mongoose) ---
require('./models/Routine'); 
require('./models/Progress'); 
require('./models/Assessment'); // <--- NUEVO: Importamos el modelo de Valoraciones
// ---------------------------------------------------------

// --- IMPORTAR RUTAS ---
// Asegúrate de que estos archivos existan en la carpeta 'routes'
const routineRoutes = require('./routes/routines'); 
const progressRoutes = require('./routes/progress');
const assessmentRoutes = require('./routes/assessments'); // <--- NUEVO: Importamos el archivo de rutas
// ---------------------

const app = express();

app.use(cors());
app.use(express.json());

// --- USAR RUTAS ---
// El Gateway envía la petición con el prefijo /api/v1/training
// Así que montamos las rutas en ese path base.

// Rutas de Rutinas (Crear, Ver)
app.use('/api/v1/training', routineRoutes);

// Rutas de Progreso (Guardar historial, Ver historial)
app.use('/api/v1/training', progressRoutes);

// Rutas de Valoraciones (Assessments)
// NOTA: El frontend llama a /api/v1/assessments, así que definimos esa ruta base aquí
app.use('/api/v1/assessments', assessmentRoutes); // <--- NUEVO: Conectamos el cable
// ------------------

// Conexión a BD
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/training_service_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Training Service conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Training Service corriendo en puerto ${PORT}`));