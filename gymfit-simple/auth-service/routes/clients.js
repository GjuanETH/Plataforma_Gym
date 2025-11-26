const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Request = require('../models/Request');
const User = mongoose.model('User');

// 1. ENVIAR SOLICITUD (Entrenador -> Cliente)
router.post('/request', async (req, res) => {
    const { trainerId, clientId } = req.body;
    try {
        // Verificar si ya existe solicitud o vinculo
        const existing = await Request.findOne({ trainerId, clientId, status: { $ne: 'rejected' } });
        if (existing) return res.status(400).json({ message: 'Ya existe una solicitud pendiente o activa.' });

        const newRequest = await Request.create({ trainerId, clientId });
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(500).json({ message: 'Error enviando solicitud' });
    }
});

// 2. VER SOLICITUDES PENDIENTES (Para el Cliente)
router.get('/pending/:clientId', async (req, res) => {
    try {
        const requests = await Request.find({ clientId: req.params.clientId, status: 'pending' })
            .populate('trainerId', 'firstName lastName email avatarUrl'); // Traer datos del entrenador
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Error buscando solicitudes' });
    }
});

// 3. ACEPTAR/RECHAZAR SOLICITUD (Cliente)
router.put('/respond', async (req, res) => {
    const { requestId, status } = req.body; // status = 'accepted' o 'rejected'
    try {
        const updated = await Request.findByIdAndUpdate(requestId, { status }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Error respondiendo' });
    }
});

// 4. OBTENER MIS CLIENTES VINCULADOS (Para el Entrenador)
router.get('/my-list/:trainerId', async (req, res) => {
    try {
        // Buscar solicitudes aceptadas
        const relationships = await Request.find({ trainerId: req.params.trainerId, status: 'accepted' })
            .populate('clientId', 'firstName lastName email avatarUrl');
        
        // Devolver solo la info de los clientes
        const clients = relationships.map(r => r.clientId);
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: 'Error cargando clientes' });
    }
});

module.exports = router;