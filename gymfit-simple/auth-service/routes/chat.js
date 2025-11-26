const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 

// --- CORRECCIÓN DE RUTA ---
// Como este archivo está en 'routes/', debemos salir (..) e ir a 'models/'
const Message = require('../models/message'); 
// --------------------------

// Obtenemos el modelo User ya registrado
const User = mongoose.model('User'); 

// 1. OBTENER TODOS LOS ENTRENADORES
router.get('/trainers', async (req, res) => {
    try {
        const trainers = await User.find({ role: 'Trainer' }).select('firstName lastName email _id avatarUrl');
        res.json(trainers);
    } catch (err) {
        console.error("Error en /chat/trainers:", err);
        res.status(500).json({ message: 'Error buscando entrenadores', details: err.message });
    }
});

// 2. ENVIAR MENSAJE
router.post('/send', async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        const newMessage = await Message.create({ senderId, receiverId, content });
        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Error enviando mensaje:", err);
        res.status(500).json({ message: 'Error enviando mensaje' });
    }
});

// 3. HISTORIAL
router.get('/history/:userId/:otherId', async (req, res) => {
    try {
        const { userId, otherId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        console.error("Error historial:", err);
        res.status(500).json({ message: 'Error cargando chat' });
    }
});

// 4. OBTENER USUARIOS QUE HAN HABLADO CONMIGO (Para el Entrenador)
// GET /api/v1/chat/my-clients/:trainerId
router.get('/my-clients/:trainerId', async (req, res) => {
    try {
        const { trainerId } = req.params;

        // 1. Buscar todos los mensajes donde el entrenador es emisor o receptor
        const messages = await Message.find({
            $or: [{ senderId: trainerId }, { receiverId: trainerId }]
        });

        // 2. Extraer los IDs de las "otras personas"
        const clientIds = new Set();
        messages.forEach(msg => {
            const otherId = msg.senderId.toString() === trainerId 
                ? msg.receiverId.toString() 
                : msg.senderId.toString();
            clientIds.add(otherId);
        });

        // 3. Buscar la info de esos clientes (Nombre, Foto, Email)
        const clients = await User.find({ _id: { $in: Array.from(clientIds) } })
            .select('firstName lastName email avatarUrl _id');

        res.json(clients);
    } catch (err) {
        console.error("Error cargando clientes del chat:", err);
        res.status(500).json({ message: 'Error cargando clientes' });
    }
});

module.exports = router;