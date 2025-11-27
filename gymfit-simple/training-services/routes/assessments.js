const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');

// 1. Guardar una nueva valoración (POST /)
router.post('/', async (req, res) => {
    try {
        const newAssessment = new Assessment(req.body);
        const savedAssessment = await newAssessment.save();
        res.status(201).json(savedAssessment);
    } catch (err) {
        console.error("Error guardando valoración:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Obtener la última valoración de un cliente (GET /latest/:clientId)
router.get('/latest/:clientId', async (req, res) => {
    try {
        // Buscamos por ID de cliente, ordenamos por fecha descendente (-1) y traemos solo 1
        const assessment = await Assessment.findOne({ clientId: req.params.clientId })
            .sort({ date: -1 });
            
        res.json(assessment); // Si no hay, devolverá null, lo cual el front ya maneja
    } catch (err) {
        console.error("Error obteniendo valoración:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;