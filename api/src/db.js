// db.js — Repositorio de tareas sobre PostgreSQL.
// La conexión se configura con variables de entorno (las define docker-compose.yml).
const { Pool } = require('pg');

function createPgRepo() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'taskflow',
    password: process.env.DB_PASSWORD || 'taskflow',
    database: process.env.DB_NAME || 'taskflow',
  });

  return {
    ping: () => pool.query('SELECT 1'),
    list: async () =>
      (await pool.query('SELECT id, title, done, created_at FROM tasks ORDER BY id')).rows,
    create: async (title) =>
      (
        await pool.query(
          'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, done, created_at',
          [title],
        )
      ).rows[0],
    setDone: async (id, done) =>
      (
        await pool.query(
          'UPDATE tasks SET done = $2 WHERE id = $1 RETURNING id, title, done, created_at',
          [id, done],
        )
      ).rows[0],
    remove: async (id) => (await pool.query('DELETE FROM tasks WHERE id = $1', [id])).rowCount > 0,
    close: () => pool.end(),
  };
}

module.exports = { createPgRepo };
