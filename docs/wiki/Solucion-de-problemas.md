# Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `port is already allocated` | Otro programa usa el 8080 | Cambia `APP_PORT=8081` en `.env` |
| La web dice "API no disponible" | La API aún arranca o falló | `docker compose ps` y `docker compose logs api` |
| `relation "tasks" does not exist` | El volumen ya existía antes de `init.sql` | `docker compose down -v && docker compose up -d` |
| `password authentication failed` | Cambiaste la clave en `.env` con el volumen ya creado | `docker compose down -v` (borra los datos) |
| Cambios en el código no se ven | Imagen vieja | `docker compose up -d --build` |
| CI falla en `npm ci` | `package-lock.json` desactualizado | `npm install` en `api/` y commitea el lock |
| CD falla con `denied` en GHCR | Permisos de Actions | Settings → Actions → General → Workflow permissions → *Read and write* |
| Windows: `init.sql` no se ejecuta | Finales de línea CRLF | `git config core.autocrlf input` y vuelve a clonar |
