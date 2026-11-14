# ---------------------------------------------------------------
# Dockerfile de la API — build multi-etapa (multi-stage)
# Buenas prácticas aplicadas:
#  1. Imagen base pequeña y con versión fija (alpine, no "latest")
#  2. Multi-stage: las dependencias de desarrollo NO llegan a producción
#  3. Se copian primero package*.json para aprovechar la caché de capas
#  4. Se ejecuta con un usuario sin privilegios (no root)
#  5. HEALTHCHECK para que Docker sepa si el contenedor está sano
# ---------------------------------------------------------------

# Etapa 1: instalar dependencias de producción
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Etapa 2: ejecutar lint y tests dentro de Docker.
# Se construye con: docker build --target test ./api   (el pipeline de CI lo hace)
# BuildKit solo construye las etapas que la etapa final necesita, por eso
# un "docker compose build" normal se salta esta etapa y es más rápido.
FROM node:22-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm test

# Etapa 3: imagen final, solo lo necesario para correr
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

# La imagen oficial de Node ya trae el usuario "node" (no root)
USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "src/server.js"]
