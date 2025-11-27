const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// GUARDAR PROGRESO
router.post('/progress', async (req, res) => {
    // 1. AQUI ESTABA EL DETALLE: Hay que leer photoUrl del cuerpo de la petición
    const { clientId, routineId, exerciseName, weightUsed, repsDone, date, photoUrl } = req.body;

    try {
        const newProgress = await Progress.create({
            clientId,
            routineId,
            exerciseName,
            weightUsed,
            repsDone,
            date: date || Date.now(),
            photoUrl: photoUrl || null // 2. Y pasarlo aquí para guardarlo
        });
        res.status(201).json(newProgress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error guardando progreso' });
    }
});

// OBTENER HISTORIAL (Este probablemente ya lo tienes bien, pero por si acaso)
router.get('/progress/:clientId', async (req, res) => {
    try {
        const logs = await Progress.find({ clientId: req.params.clientId }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo historial' });
    }
});

module.exports = router;