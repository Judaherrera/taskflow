# Docker

## Dockerfile de la API (multi-stage)

```dockerfile
FROM node:22-alpine AS deps          # Etapa 1: solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS test          # Etapa 2: lint + tests
RUN npm ci && npm run lint && npm test

FROM node:22-alpine AS runtime       # Etapa 3: imagen final
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
USER node
HEALTHCHECK CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "src/server.js"]
```

### ¿Por qué multi-stage?

La imagen final solo contiene Node, las dependencias de producción y el código. Jest, ESLint y compañía se quedan en la etapa `test`. Imagen más pequeña = se descarga más rápido y tiene menos superficie de ataque.

## Buenas prácticas

| Práctica | Dónde | Por qué |
|----------|-------|---------|
| Versión fija de imagen base | `node:22-alpine`, `postgres:16-alpine` | Builds reproducibles; `latest` puede cambiar sin avisar |
| Alpine | Todas | Imágenes de decenas de MB en vez de cientos |
| Copiar `package*.json` primero | API | Aprovecha la caché: `npm ci` solo se repite si cambian dependencias |
| `npm ci` en vez de `npm install` | API | Instala exactamente lo del `package-lock.json` |
| Usuario no root | `USER node`, `nginx-unprivileged` | Si alguien compromete el contenedor, no es root |
| `HEALTHCHECK` | API, frontend | Docker sabe si el servicio realmente responde |
| `.dockerignore` | API, frontend | Builds más rápidos y sin secretos ni `node_modules` |
| `CMD` en formato JSON | API | El proceso recibe `SIGTERM` correctamente |
| Variables de entorno | Compose + `.env` | Sin contraseñas en el código |
| Un proceso por contenedor | Todos | Escalar y depurar cada pieza por separado |

## Comandos útiles

```bash
docker compose up -d --build        # construir y levantar
docker compose ps                   # estado (healthy / unhealthy)
docker compose logs -f api          # logs
docker compose exec db psql -U taskflow   # entrar a PostgreSQL
docker compose exec api whoami      # → node (no root)
docker images | grep taskflow       # ver tamaño de las imágenes
docker volume ls                    # ver el volumen pgdata
docker network ls                   # ver las redes frontend y backend
docker build --target test ./api    # correr tests dentro de Docker
```
