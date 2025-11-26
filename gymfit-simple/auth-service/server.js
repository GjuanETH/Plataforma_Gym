const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- CARGA DE MODELOS (AQUÍ SÍ VAN) ---
// Esto registra los esquemas en Mongoose para que 'chat.js' pueda usarlos
require('./models/User'); 
require('./models/message');
require('./models/Request.js');
// --------------------------------------

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const clientRoutes = require('./routes/clients.js');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/clients', clientRoutes);

// Conexión DB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth_service_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Auth Service conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Auth Service corriendo en puerto ${PORT}`));