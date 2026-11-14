// server.js — Punto de entrada: conecta la app con PostgreSQL y arranca el servidor.
const { createApp } = require('./app');
const { createPgRepo } = require('./db');

const PORT = Number(process.env.PORT) || 3000;
const repo = createPgRepo();
const app = createApp(repo);

const server = app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});

// Apagado limpio: Docker envía SIGTERM al hacer "docker compose down".
function shutdown(signal) {
  console.log(`${signal} recibido, cerrando...`);
  server.close(() => repo.close().then(() => process.exit(0)));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
