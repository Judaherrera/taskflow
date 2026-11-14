// app.js — Define las rutas de la API.
// Recibe el "repositorio" de datos como parámetro (inyección de dependencias):
// en producción es PostgreSQL, en los tests es una lista en memoria.
// Así podemos probar la API sin levantar una base de datos.
const express = require('express');

function createApp(repo) {
  const app = express();
  app.use(express.json());

  // Healthcheck: lo usan Docker y Docker Compose para saber si el servicio está vivo.
  app.get('/api/health', async (req, res) => {
    try {
      await repo.ping();
      res.json({ status: 'ok', db: 'up' });
    } catch {
      res.status(503).json({ status: 'error', db: 'down' });
    }
  });

  app.get('/api/tasks', async (req, res, next) => {
    try {
      res.json(await repo.list());
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/tasks', async (req, res, next) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!title || title.length > 200) {
      return res.status(400).json({ error: 'El título es obligatorio (máx. 200 caracteres)' });
    }
    try {
      res.status(201).json(await repo.create(title));
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/tasks/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || typeof req.body?.done !== 'boolean') {
      return res.status(400).json({ error: 'Se requiere un id numérico y "done" booleano' });
    }
    try {
      const task = await repo.setDone(id, req.body.done);
      if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/tasks/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
    try {
      const deleted = await repo.remove(id);
      if (!deleted) return res.status(404).json({ error: 'Tarea no encontrada' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // Manejador de errores centralizado
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };
