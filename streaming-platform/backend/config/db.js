
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function initDb() {
  // Agregar columna ROL si no existe
  const alterSql = `ALTER TABLE IF EXISTS usuario ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'USER';`;
  await pool.query(alterSql);
}

initDb().catch(err => {
  console.error('Error inicializando base de datos', err);
});

module.exports = pool;
