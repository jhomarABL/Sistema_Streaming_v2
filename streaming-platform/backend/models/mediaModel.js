
const pool = require('../config/db');

async function getAllMovies() {
  const { rows } = await pool.query(
    `SELECT p.*, d.nombre AS distribuidor
     FROM pelicula p
     LEFT JOIN distribuidor d ON p.id_distribuidor = d.id_distribuidor`
  );
  return rows;
}

async function getAllSeries() {
  const { rows } = await pool.query(
    `SELECT s.*, d.nombre AS distribuidor
     FROM serie s
     LEFT JOIN distribuidor d ON s.id_distribuidor = d.id_distribuidor`
  );
  return rows;
}

async function getMovieById(id) {
  const { rows } = await pool.query('SELECT * FROM pelicula WHERE id_pelicula = $1', [id]);
  return rows[0];
}

async function getEpisodeById(id) {
  const { rows } = await pool.query(
    `SELECT e.*, t.id_serie
     FROM episodio e
     LEFT JOIN temporada t ON e.id_temporada = t.id_temporada
     WHERE e.id_episodio = $1`,
    [id]
  );
  return rows[0];
}

async function getEpisodesBySeries(seriesId) {
  const { rows } = await pool.query(
    `SELECT e.*
     FROM episodio e
     JOIN temporada t ON e.id_temporada = t.id_temporada
     WHERE t.id_serie = $1
     ORDER BY t.numero_temporada, e.numero_episodio`,
    [seriesId]
  );
  return rows;
}

module.exports = {
  getAllMovies,
  getAllSeries,
  getMovieById,
  getEpisodeById,
  getEpisodesBySeries,
};
