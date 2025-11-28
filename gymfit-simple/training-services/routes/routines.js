const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');

// 1. Crear una nueva rutina
router.post('/', async (req, res) => {
  try {
    // 🔍 1. VERIFICAR QUÉ DATOS LLEGAN
    console.log("📦 [TRAINING] Intentando crear rutina con datos:", JSON.stringify(req.body, null, 2));

    const { name, description, trainerId, clientId, exercises } = req.body;
    
    // Validación manual rápida por si acaso
    if (!trainerId || !clientId) {
        console.error("⚠️ Falta trainerId o clientId");
        return res.status(400).json({ message: "Faltan IDs de entrenador o cliente" });
    }

    const newRoutine = await Routine.create({
      name,
      description,
      trainerId,
      clientId,
      exercises
    });

    console.log("✅ Rutina creada con éxito ID:", newRoutine._id);
    res.status(201).json(newRoutine);

  } catch (err) {
    // 🚨 2. AQUÍ ESTABA EL PROBLEMA: AHORA SÍ IMPRIMIMOS EL ERROR
    console.error("❌ ERROR CRÍTICO MONGODB:", err); 
    
    res.status(500).json({ message: 'Error al crear rutina', error: err.message });
  }
});

// 2. Obtener rutinas de un cliente específico
router.get('/client/:clientId', async (req, res) => {
  try {
    const routines = await Routine.find({ clientId: req.params.clientId });
    res.json(routines);
  } catch (err) {
    console.error("❌ Error obteniendo rutinas:", err);
    res.status(500).json({ message: 'Error al obtener rutinas', error: err.message });
  }
});

// 3. ELIMINAR rutina por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoutine = await Routine.findByIdAndDelete(id);

    if (!deletedRoutine) {
      return res.status(404).json({ message: 'Rutina no encontrada o ya eliminada' });
    }

    res.status(200).json({ message: 'Rutina eliminada correctamente' });
  } catch (err) {
    console.error("❌ Error al borrar:", err);
    res.status(500).json({ message: 'Error interno al eliminar rutina', error: err.message });
  }
});

module.exports = router;