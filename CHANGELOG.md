# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-11-14

### Agregado
- API REST de tareas (Node.js + Express) con validación y healthcheck.
- Frontend estático servido por Nginx, que actúa como reverse proxy.
- PostgreSQL 16 con volumen persistente y script de inicialización.
- Orquestación con Docker Compose: 3 servicios, 2 redes (backend interna) y arranque ordenado por healthchecks.
- Dockerfile multi-etapa (deps → test → runtime) ejecutado con un usuario no root.
- CI con GitHub Actions: lint, tests, build y smoke test del stack completo.
- CD: publicación de imágenes en GHCR y GitHub Release al crear tags.
- Contador de tareas completadas en el frontend (#2).
- Plantillas de issues y PR, Dependabot, README, CONTRIBUTING y Wiki.

### Corregido
- Healthcheck del frontend fallaba por la resolución IPv6 de `localhost` en Alpine (#3).
