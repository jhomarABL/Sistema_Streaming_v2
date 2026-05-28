
const pool = require('../config/db');

async function findByEmail(correo) {
  const { rows } = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [id]);
  return rows[0];
}

async function createUser({ nombre_completo, correo, contrasena_hash, pais, rol = 'USER' }) {
  const { rows } = await pool.query(
    `INSERT INTO usuario (id_usuario, nombre_completo, correo, contrasena, pais, fecha_registro, estado_cuenta, rol)
     VALUES ((SELECT COALESCE(MAX(id_usuario)+1,1) FROM usuario), $1,$2,$3,$4, NOW(), 'ACTIVA', $5)
     RETURNING *`,
    [nombre_completo, correo, contrasena_hash, pais, rol]
  );
  return rows[0];
}

async function listUsers() {
  const { rows } = await pool.query('SELECT id_usuario, nombre_completo, correo, pais, fecha_registro, estado_cuenta, rol FROM usuario ORDER BY id_usuario');
  return rows;
}

module.exports = { findByEmail, findById, createUser, listUsers };
