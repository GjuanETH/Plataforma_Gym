const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Guardar un registro de progreso
router.post('/', async (req, res) => {
  try {
    const { clientId, routineId, exerciseName, weightUsed, repsDone } = req.body;
    
    const newLog = await Progress.create({
      clientId,
      routineId,
      exerciseName,
      weightUsed,
      repsDone
    });

    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ message: 'Error guardando progreso', error: err.message });
  }
});

// Ver el historial de un cliente (Opcional, pero útil)
router.get('/:clientId', async (req, res) => {
    try {
        const logs = await Progress.find({ clientId: req.params.clientId }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo historial' });
    }
});

module.exports = router;