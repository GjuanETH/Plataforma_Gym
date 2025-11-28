const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// DEBUG: Verificar si el secreto existe al cargar
if (!process.env.JWT_SECRET) {
    console.error("🔴 [AUTH] PELIGRO: No existe process.env.JWT_SECRET");
} else {
    console.log("🟢 [AUTH] JWT_SECRET cargado correctamente (longitud: " + process.env.JWT_SECRET.length + ")");
}

// Generar JWT Token
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) throw new Error("Falta JWT_SECRET"); // Esto nos dirá si falta
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  console.log("📩 [REGISTER] Intento de registro:", req.body.email); // Log
  const { firstName, lastName, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log("⚠️ [REGISTER] Usuario ya existe");
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    user = await User.create({ firstName, lastName, email, password, role });
    console.log("✅ [REGISTER] Usuario creado en DB");

    res.status(201).json({
      token: generateToken(user._id, user.role),
      userId: user._id,
      role: user.role,
      message: 'Usuario registrado exitosamente'
    });
  } catch (err) {
    console.error("❌ [REGISTER ERROR]:", err); // ¡ESTO ES LO QUE NECESITAMOS VER!
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// @route   POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  console.log("📩 [LOGIN] Intento de login:", req.body.email); // Log
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ [LOGIN] Usuario no encontrado");
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("⚠️ [LOGIN] Contraseña incorrecta");
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id, user.role);
    console.log("✅ [LOGIN] Token generado exitosamente");

    res.json({
      token: token,
      userId: user._id,
      role: user.role,
      message: 'Login exitoso'
    });
  } catch (err) {
    console.error("❌ [LOGIN ERROR]:", err); // ¡ESTO ES LO QUE NECESITAMOS VER!
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

router.put('/update-avatar', async (req, res) => {
  const { userId, avatarUrl } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
    res.json({ success: true, avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("❌ [AVATAR ERROR]:", err);
    res.status(500).json({ message: 'Error actualizando imagen' });
  }
});

module.exports = router;