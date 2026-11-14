# CI/CD con GitHub Actions

## Pipeline

```
push / PR ──▶ [CI] lint-and-test ──▶ [CI] docker ──▶ (merge a main) ──▶ [CD] publish ──▶ (tag v*) ──▶ [CD] release
```

## `ci.yml` — Integración continua

**Disparadores:** push a `main`, `develop`, `feature/**`, `release/**`, `hotfix/**` y PRs hacia `main` / `develop`.

| Job | Pasos |
|-----|-------|
| `lint-and-test` | Checkout → Node 22 con caché npm → `npm ci` → `npm run lint` → `npm test` → sube la cobertura como *artifact* |
| `docker` (needs: lint-and-test) | Valida `docker-compose.yml` → `docker build --target test` → `docker compose up --wait` → *smoke test* con `curl` → muestra logs si falla → `down -v` |

`concurrency` cancela ejecuciones viejas de la misma rama para ahorrar minutos.

## `cd.yml` — Entrega continua

**Disparadores:** push a `main` y tags `v*.*.*`.

| Job | Qué hace |
|-----|----------|
| `publish` (matriz `api`, `frontend`) | Login en `ghcr.io` con `GITHUB_TOKEN` → calcula etiquetas con `docker/metadata-action` → build y push con caché de GitHub Actions |
| `release` (solo con tags) | Crea un GitHub Release con notas generadas automáticamente |

### Etiquetas generadas

| Evento | Etiquetas |
|--------|-----------|
| Push a `main` | `latest`, `sha-abc1234` |
| Tag `v1.2.0` | `1.2.0`, `1.2`, `sha-abc1234` |

Las imágenes aparecen en la pestaña **Packages** del perfil/repo:
`ghcr.io/judaherrera/taskflow-api` y `ghcr.io/judaherrera/taskflow-frontend`.

## Secretos

No hace falta crear ninguno: `GITHUB_TOKEN` lo genera GitHub en cada ejecución. Los permisos se declaran en el workflow (`packages: write`, `contents: write`).

## Dependabot

`dependabot.yml` revisa cada semana npm, las imágenes base de Docker y las propias Actions, y abre PRs contra `develop`.
