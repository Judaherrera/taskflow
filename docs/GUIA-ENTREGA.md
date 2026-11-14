# Guía paso a paso para montar y presentar el proyecto

Sigue esto en orden. Tiempo estimado: 30–40 minutos.

## 0. Requisitos

- Docker Desktop instalado y abierto
- Git instalado y una cuenta de GitHub
- (Windows) antes de nada: `git config --global core.autocrlf input`

## 1. Probarlo en tu computador

```bash
cd taskflow
cp .env.example .env
docker compose up -d --build
docker compose ps        # los 3 deben decir "healthy"
```

Abre http://localhost:8080, crea y marca tareas. Luego `docker compose down` y otra vez `up -d`: las tareas siguen ahí (eso demuestra el **volumen**).

## 2. Crear el repositorio y la rama `main`

En GitHub: **New repository** → nombre `taskflow` → público → **sin** README (ya tienes uno).

```bash
git init -b main
git add .
git commit -m "chore: estructura inicial del proyecto"
git remote add origin https://github.com/Judaherrera/taskflow.git
git push -u origin main
```


## 3. Crear `develop`

```bash
git checkout -b develop
git push -u origin develop
```

En GitHub: **Settings → General → Default branch** → `develop` (así las PRs apuntan ahí por defecto).

## 4. Permisos de Actions

**Settings → Actions → General → Workflow permissions** → *Read and write permissions* → Save.

## 5. Proteger `main` y `develop`

**Settings → Branches → Add classic branch protection rule** (una para `main`, otra para `develop`):

- ☑ Require a pull request before merging (si trabajas solo, pon 0 aprobaciones)
- ☑ Require status checks to pass → busca `Lint y tests` y `Build y prueba con Docker Compose` (aparecen después de que el CI corra una vez)

## 6. Demostrar GitFlow con una feature real

```bash
git checkout develop
git checkout -b feature/contador-tareas
```

Por ejemplo, en `frontend/public/index.html` cambia el subtítulo o agrega un contador. Luego:

```bash
git add .
git commit -m "feat(frontend): mostrar contador de tareas"
git push -u origin feature/contador-tareas
```

En GitHub: **Compare & pull request** hacia `develop` → llena la plantilla → espera el ✅ del CI → **Merge**.
📸 Toma captura de la PR con los checks en verde.

## 7. Hacer un release

```bash
git checkout develop && git pull
git checkout -b release/1.0.0
git push -u origin release/1.0.0
```

PR `release/1.0.0` → `main` → Merge. Luego:

```bash
git checkout main && git pull
git tag -a v1.0.0 -m "Primera versión"
git push origin v1.0.0
```

Esto dispara el **CD**: verás las imágenes en **Packages** y un **Release v1.0.0**.
Finalmente PR `main` → `develop` para sincronizar.

## 8. Publicar la Wiki

1. Pestaña **Wiki** → *Create the first page* → Save (cualquier texto).
2. En tu terminal (Git Bash en Windows):

```bash
bash scripts/publish-wiki.sh
```

## 9. Qué mostrar en la presentación (checklist del enunciado)

| Requisito | Dónde se ve |
|-----------|-------------|
| Contenedores bien configurados | `api/Dockerfile`, `frontend/Dockerfile`, `docker compose ps` (healthy) |
| Docker Compose con varios servicios | `docker-compose.yml` (3 servicios) |
| Buenas prácticas en imágenes | Multi-stage, alpine, no root, healthcheck, `.dockerignore` → `docker compose exec api whoami` = `node` |
| Volúmenes y redes | `docker volume ls`, `docker network ls`, red `backend` interna |
| Repositorio con estructura adecuada | Árbol del README, plantillas en `.github/` |
| GitHub Actions CI/CD | Pestaña **Actions** y **Packages** / **Releases** |
| GitFlow | Ramas `main`, `develop`, `feature/*`, `release/*`, PRs fusionadas, tag `v1.0.0` |
| README y Wiki | Portada del repo y pestaña **Wiki** |

### Preguntas típicas del profesor (y qué responder)

- **¿Por qué multi-stage?** Para que la imagen final no lleve herramientas de desarrollo: más pequeña y más segura.
- **¿Por qué la BD no publica puerto?** Porque solo la API necesita hablarle; está en una red interna. Mínimo privilegio.
- **¿Cómo se encuentran los contenedores?** Por el nombre del servicio, con el DNS interno de Docker (`db`, `api`).
- **¿Qué pasa si borro el contenedor de la BD?** Nada, los datos están en el volumen `pgdata`. Solo se pierden con `down -v`.
- **¿Para qué sirve el healthcheck?** Para que Compose arranque los servicios en orden y no conecte la API antes de que PostgreSQL esté listo.
- **¿Diferencia entre CI y CD?** CI valida cada cambio (lint, tests, build). CD publica artefactos listos para desplegar (imágenes en GHCR, Release).
- **¿Por qué GitFlow y no GitHub Flow?** GitFlow separa desarrollo (`develop`) de producción (`main`) y tiene ramas para releases y hotfixes, útil cuando hay versiones numeradas. GitHub Flow es más simple (solo `main` + ramas cortas) y conviene para despliegue continuo.
