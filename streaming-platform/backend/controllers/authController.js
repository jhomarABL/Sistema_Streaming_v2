
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const User = require('../models/userModel');

async function register(req, res) {
  try {
    const { nombre_completo, correo, contrasena, pais } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }
    const existing = await User.findByEmail(correo);
    if (existing) {
      return res.status(409).json({ message: 'Correo ya registrado' });
    }
    const hash = await hashPassword(contrasena);
    const user = await User.createUser({ nombre_completo, correo, contrasena_hash: hash, pais });
    const token = signToken({ id_usuario: user.id_usuario, correo: user.correo, rol: user.rol });
    return res.status(201).json({ user: { id_usuario: user.id_usuario, nombre_completo: user.nombre_completo, correo: user.correo, rol: user.rol }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en registro' });
  }
}

async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;
    const user = await User.findByEmail(correo);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const ok = await comparePassword(contrasena, user.contrasena || '');
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = signToken({ id_usuario: user.id_usuario, correo: user.correo, rol: user.rol });
    return res.json({ user: { id_usuario: user.id_usuario, nombre_completo: user.nombre_completo, correo: user.correo, rol: user.rol }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en login' });
  }
}

module.exports = { register, login };
