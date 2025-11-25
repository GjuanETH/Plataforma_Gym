const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Permite conexiones externas

// Conexión a Base de Datos (Usa la variable de entorno de Docker)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth_service_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Auth Service conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Rutas
app.use('/api/v1/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Auth Service corriendo en puerto ${PORT}`));