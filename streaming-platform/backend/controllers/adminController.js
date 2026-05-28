
const pool = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [usuarios, peliculas, series, masVistoPeliculas, masVistoEpisodios, actividadReciente] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM usuario'),
      pool.query('SELECT COUNT(*) AS total FROM pelicula'),
      pool.query('SELECT COUNT(*) AS total FROM serie'),
      pool.query(`
        SELECT p.id_pelicula, p.titulo, COUNT(*) AS reproducciones
        FROM historial h
        JOIN historial_pelicula hp ON h.id_historial = hp.id_historial
        JOIN pelicula p ON hp.id_pelicula = p.id_pelicula
        GROUP BY p.id_pelicula, p.titulo
        ORDER BY reproducciones DESC
        LIMIT 10`),
      pool.query(`
        SELECT e.id_episodio, e.titulo, COUNT(*) AS reproducciones
        FROM historial h
        JOIN historial_episodio he ON h.id_historial = he.id_historial
        JOIN episodio e ON he.id_episodio = e.id_episodio
        GROUP BY e.id_episodio, e.titulo
        ORDER BY reproducciones DESC
        LIMIT 10`),
      pool.query(`
        SELECT h.id_historial, u.correo, h.fecha_reproduccion, h.tiempo_reproducido, er.tipo_estado
        FROM historial h
        LEFT JOIN usuario u ON h.id_usuario = u.id_usuario
        LEFT JOIN estado_reproduccion er ON h.id_estado = er.id_estado
        ORDER BY h.fecha_reproduccion DESC
        LIMIT 20`),
    ]);

    return res.json({
      total_usuarios: parseInt(usuarios.rows[0].total, 10),
      total_peliculas: parseInt(peliculas.rows[0].total, 10),
      total_series: parseInt(series.rows[0].total, 10),
      mas_visto_peliculas: masVistoPeliculas.rows,
      mas_visto_episodios: masVistoEpisodios.rows,
      actividad_reciente: actividadReciente.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
}

async function runReadonlyQuery(req, res) {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ message: 'SQL requerida' });
    }
    const trimmed = sql.trim().toLowerCase();
    if (!trimmed.startsWith('select')) {
      return res.status(400).json({ message: 'Solo se permiten consultas SELECT' });
    }
    const result = await pool.query(sql);
    return res.json({ rows: result.rows, fields: result.fields.map(f => f.name) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error ejecutando consulta' });
  }
}

async function advancedQueries(req, res) {
  try {
    const [porGenero, promedioDuracion, topActivos] = await Promise.all([
      // GROUP BY, JOIN, COUNT, HAVING
      pool.query(`
        SELECT g.nombre_genero, COUNT(pg.id_pelicula) AS total
        FROM genero g
        LEFT JOIN pelicula_genero pg ON g.id_genero = pg.id_genero
        GROUP BY g.nombre_genero
        HAVING COUNT(pg.id_pelicula) > 0
        ORDER BY total DESC`),
      // AVG, MAX, MIN
      pool.query(`
        SELECT
          AVG(p.duracion_minutos) AS promedio_peliculas,
          MAX(p.duracion_minutos) AS max_pelicula,
          MIN(p.duracion_minutos) AS min_pelicula
        FROM pelicula p`),
      // Subconsulta: usuarios con más de X reproducciones
      pool.query(`
        SELECT u.id_usuario, u.correo, total_repros
        FROM usuario u
        JOIN (
          SELECT h.id_usuario, COUNT(*) AS total_repros
          FROM historial h
          GROUP BY h.id_usuario
        ) stats ON u.id_usuario = stats.id_usuario
        WHERE total_repros >= 5
        ORDER BY total_repros DESC`),
    ]);

    return res.json({
      contenido_por_genero: porGenero.rows,
      duracion_peliculas: promedioDuracion.rows[0],
      usuarios_mas_activos: topActivos.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en consultas avanzadas' });
  }
}

module.exports = { getDashboardStats, runReadonlyQuery, advancedQueries };
