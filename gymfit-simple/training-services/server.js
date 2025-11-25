const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routineRoutes = require('./routes/routines');
const progressRoutes = require('./routes/progress'); // <--- 1. IMPORTAR

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/training_service_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Training Service conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

app.use('/api/v1/training', routineRoutes); // Rutas viejas
app.use('/api/v1/training/progress', progressRoutes); // <--- 2. USAR NUEVA RUTA

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`💪 Training Service corriendo en puerto ${PORT}`));