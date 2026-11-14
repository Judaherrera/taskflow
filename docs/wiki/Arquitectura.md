# Arquitectura

## Servicios

| Servicio | Responsabilidad | Redes |
|----------|-----------------|-------|
| `frontend` | Sirve HTML/CSS/JS y reenvía `/api/*` a la API | `frontend` |
| `api` | Lógica de negocio, validación, acceso a datos | `frontend`, `backend` |
| `db` | Persistencia (PostgreSQL) | `backend` |

## Redes

Docker Compose crea dos redes *bridge*:

- **`frontend`**: conecta Nginx con la API.
- **`backend`** (`internal: true`): conecta la API con la BD. Al ser interna, no tiene salida a internet.

Resultado: **el frontend no puede llegar a la base de datos** aunque quisiera, porque no comparten red. Es el principio de **mínimo privilegio** aplicado a la red.

Dentro de una red, los contenedores se encuentran **por nombre de servicio** gracias al DNS interno de Docker. Por eso la API se conecta a `DB_HOST=db` y Nginx hace `proxy_pass http://api:3000`.

## Volúmenes

| Volumen | Tipo | Para qué |
|---------|------|----------|
| `pgdata` → `/var/lib/postgresql/data` | Volumen con nombre | Los datos sobreviven a `docker compose down` |
| `./db/init.sql` → `/docker-entrypoint-initdb.d/` | Bind mount (solo lectura) | Crea la tabla la primera vez |

> `init.sql` solo se ejecuta cuando el volumen está **vacío**. Si cambias el esquema, usa `docker compose down -v` para empezar de cero.

## Flujo de una petición

1. El navegador pide `POST http://localhost:8080/api/tasks`.
2. Nginx (contenedor `frontend`) recibe la petición en el puerto 8080 y la reenvía a `http://api:3000/api/tasks`.
3. La API valida el body y ejecuta `INSERT` en `db:5432`.
4. PostgreSQL guarda en el volumen `pgdata` y devuelve la fila.
5. La respuesta vuelve por el mismo camino.

## Orden de arranque

`db` (healthy con `pg_isready`) → `api` (healthy con `/api/health`) → `frontend`.
Esto se logra con `depends_on: condition: service_healthy`.

## Diseño de la API

`app.js` recibe el repositorio de datos como parámetro (*inyección de dependencias*). En producción se le pasa el repositorio PostgreSQL (`db.js`); en los tests, uno en memoria. Así los tests son rápidos y no necesitan BD.
