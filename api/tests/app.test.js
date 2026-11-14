// Tests de la API usando un repositorio en memoria (no necesitan base de datos).
const request = require('supertest');
const { createApp } = require('../src/app');

function createMemoryRepo() {
  let tasks = [];
  let nextId = 1;
  return {
    ping: async () => true,
    list: async () => tasks,
    create: async (title) => {
      const task = { id: nextId++, title, done: false, created_at: new Date().toISOString() };
      tasks.push(task);
      return task;
    },
    setDone: async (id, done) => {
      const task = tasks.find((t) => t.id === id);
      if (task) task.done = done;
      return task;
    },
    remove: async (id) => {
      const before = tasks.length;
      tasks = tasks.filter((t) => t.id !== id);
      return tasks.length < before;
    },
  };
}

describe('TaskFlow API', () => {
  let app;
  beforeEach(() => {
    app = createApp(createMemoryRepo());
  });

  test('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/health responde 503 si la BD está caída', async () => {
    const broken = createApp({ ping: async () => { throw new Error('down'); } });
    const res = await request(broken).get('/api/health');
    expect(res.status).toBe(503);
  });

  test('crea y lista tareas', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Estudiar Docker' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ id: 1, title: 'Estudiar Docker', done: false });

    const list = await request(app).get('/api/tasks');
    expect(list.body).toHaveLength(1);
  });

  test('rechaza tareas sin título', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  test('marca una tarea como completada', async () => {
    await request(app).post('/api/tasks').send({ title: 'Hacer el README' });
    const res = await request(app).patch('/api/tasks/1').send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  test('PATCH devuelve 404 si la tarea no existe', async () => {
    const res = await request(app).patch('/api/tasks/99').send({ done: true });
    expect(res.status).toBe(404);
  });

  test('elimina una tarea', async () => {
    await request(app).post('/api/tasks').send({ title: 'Borrar esto' });
    expect((await request(app).delete('/api/tasks/1')).status).toBe(204);
    expect((await request(app).delete('/api/tasks/1')).status).toBe(404);
  });
});
