# TaskFlow 📝

[![CI](https://github.com/Judaherrera/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/Judaherrera/taskflow/actions/workflows/ci.yml)
[![CD](https://github.com/Judaherrera/taskflow/actions/workflows/cd.yml/badge.svg)](https://github.com/Judaherrera/taskflow/actions/workflows/cd.yml)

Aplicación de gestión de tareas **contenerizada con Docker** y desarrollada con un **flujo colaborativo en GitHub** (GitFlow + GitHub Actions).


---

## 🏗️ Arquitectura

```
           ┌──────────────── red: frontend ────────────────┐   ┌──── red: backend (internal) ────┐
Navegador ─┼─▶ :8080  frontend (Nginx) ──/api/──▶ api (Node)─┼───┼─▶ db (PostgreSQL 16)            │
           └───────────────────────────────────────────────┘   │      └─ volumen: pgdata         │
                                                               └──────────────────────────────────┘
```

| Servicio   | Imagen                         | Función                                               | Puerto        |
|------------|--------------------------------|-------------------------------------------------------|---------------|
| `frontend` | `nginx-unprivileged:1.27-alpine` | Sirve la web y hace de *reverse proxy* hacia la API | `8080` (host) |
| `api`      | `node:22-alpine` (multi-stage) | API REST de tareas (Express)                          | `3000` (interno) |
| `db`       | `postgres:16-alpine`           | Base de datos con persistencia en volumen             | `5432` (interno) |

**Solo el frontend expone un puerto al host.** La base de datos vive en una red `internal`: ni siquiera tiene salida a internet, solo la API puede hablar con ella.

---

## 🚀 Inicio rápido

**Requisitos:** Docker Desktop (o Docker Engine + Compose v2) y Git.

```bash
git clone https://github.com/Judaherrera/taskflow.git
cd taskflow
cp .env.example .env          # ajusta la contraseña si quieres
docker compose up -d --build
```

Abre **http://localhost:8080** 🎉

| Comando                                   | Para qué sirve                                  |
|-------------------------------------------|-------------------------------------------------|
| `docker compose ps`                       | Ver estado y salud de los contenedores          |
| `docker compose logs -f api`              | Ver logs de la API en vivo                      |
| `docker compose down`                     | Apagar (los datos se conservan en el volumen)   |
| `docker compose down -v`                  | Apagar **y borrar** los datos                   |
| `docker build --target test ./api`        | Correr lint + tests dentro de Docker            |

---

## 🔌 API

| Método   | Ruta              | Body                   | Respuesta          |
|----------|-------------------|------------------------|--------------------|
| `GET`    | `/api/health`     | —                      | `{status, db}`     |
| `GET`    | `/api/tasks`      | —                      | Lista de tareas    |
| `POST`   | `/api/tasks`      | `{"title": "..."}`     | `201` tarea creada |
| `PATCH`  | `/api/tasks/:id`  | `{"done": true}`       | Tarea actualizada  |
| `DELETE` | `/api/tasks/:id`  | —                      | `204`              |

```bash
curl -X POST localhost:8080/api/tasks -H "Content-Type: application/json" -d '{"title":"Mi tarea"}'
```

---

## 🐳 Buenas prácticas de Docker aplicadas

- ✅ **Build multi-etapa**: `deps` → `test` → `runtime`. La imagen final no lleva herramientas de desarrollo.
- ✅ **Imágenes `alpine` con versión fija** (nunca `latest`): pequeñas y reproducibles.
- ✅ **Caché de capas**: se copia `package*.json` antes que el código, así `npm ci` no se repite si solo cambia el código.
- ✅ **Usuario sin privilegios** (`node` / `nginx`), nunca root.
- ✅ **`HEALTHCHECK`** en cada servicio + `depends_on: condition: service_healthy` para arrancar en orden.
- ✅ **`.dockerignore`** para no copiar `node_modules`, `.git` ni secretos.
- ✅ **Configuración por variables de entorno** (`.env`), sin contraseñas en el código.
- ✅ **Apagado limpio**: la API maneja `SIGTERM`.

---

## 🔄 CI/CD con GitHub Actions

| Workflow | Cuándo se ejecuta | Qué hace |
|----------|-------------------|----------|
| [`ci.yml`](.github/workflows/ci.yml) | Push a ramas GitFlow y PRs a `main`/`develop` | Lint → tests → build de imágenes → levanta el stack con Compose → *smoke test* |
| [`cd.yml`](.github/workflows/cd.yml) | Push a `main` y tags `v*.*.*` | Publica las imágenes en **GHCR** y crea un **Release** al etiquetar |
| [`dependabot.yml`](.github/dependabot.yml) | Semanal | PRs automáticas para actualizar dependencias |

---

## 🌿 Flujo de ramas (GitFlow)

```
main      ●────────────────●───────────●      ← producción (tags v1.0.0, v1.1.0…)
           \              / \         /
release     \        ●───●   \       /        ← preparar versión
             \      /         \     /
develop  ─────●──●─●───────────●───●          ← integración
               \  /             \ /
feature/x       ●●               ●  hotfix/y  ← trabajo diario / arreglos urgentes
```

| Rama        | Sale de   | Se fusiona en       | Uso                         |
|-------------|-----------|---------------------|-----------------------------|
| `main`      | —         | —                   | Código en producción        |
| `develop`   | `main`    | —                   | Integración de features     |
| `feature/*` | `develop` | `develop`           | Nuevas funcionalidades      |
| `release/*` | `develop` | `main` y `develop`  | Preparar una versión        |
| `hotfix/*`  | `main`    | `main` y `develop`  | Arreglos urgentes en prod   |

Detalle completo en [CONTRIBUTING.md](CONTRIBUTING.md) y en la [Wiki](../../wiki).

---

## 📁 Estructura del repositorio

```
taskflow/
├── .github/
│   ├── workflows/          # ci.yml, cd.yml
│   ├── ISSUE_TEMPLATE/     # plantillas de issues
│   ├── dependabot.yml
│   └── pull_request_template.md
├── api/                    # API Node.js + Express
│   ├── src/                # app.js (rutas), db.js (PostgreSQL), server.js
│   ├── tests/              # tests con Jest + Supertest
│   ├── Dockerfile          # multi-stage
│   └── .dockerignore
├── frontend/               # Nginx + HTML/CSS/JS
│   ├── public/
│   ├── nginx.conf          # reverse proxy hacia la API
│   └── Dockerfile
├── db/init.sql             # esquema y datos iniciales
├── docs/wiki/              # páginas de la Wiki (se publican con scripts/publish-wiki.sh)
├── scripts/publish-wiki.sh
├── docker-compose.yml
├── .env.example
├── CONTRIBUTING.md
└── README.md
```

---

## 🧑‍💻 Desarrollo local sin Docker (opcional)

```bash
cd api
npm install
npm run lint
npm test          # no necesita base de datos: usa un repositorio en memoria
```

## 📚 Documentación

- 📖 [Wiki del proyecto](../../wiki): arquitectura, Docker, CI/CD, GitFlow y solución de problemas
- 🤝 [Guía de contribución](CONTRIBUTING.md)

## 📄 Licencia

MIT
