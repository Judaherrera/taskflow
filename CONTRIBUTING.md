# Guía de contribución

Este proyecto usa **GitFlow**. Nadie hace push directo a `main` ni a `develop`: todo entra por Pull Request con el CI en verde.

## 1. Crear una feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/filtrar-tareas
# ... programar ...
git add .
git commit -m "feat(api): agregar filtro por estado"
git push -u origin feature/filtrar-tareas
```

Luego abre una **Pull Request hacia `develop`** en GitHub. Se completa la plantilla, el CI corre solo y un compañero revisa.

## 2. Preparar una versión (release)

```bash
git checkout develop && git pull
git checkout -b release/1.1.0
# subir la versión en api/package.json, últimos ajustes
git push -u origin release/1.1.0
```

PR de `release/1.1.0` → `main`. Tras fusionar:

```bash
git checkout main && git pull
git tag -a v1.1.0 -m "Versión 1.1.0"
git push origin v1.1.0        # dispara el CD: imágenes en GHCR + GitHub Release
```

Y fusiona `main` de vuelta en `develop` (PR `main` → `develop`).

## 3. Arreglo urgente (hotfix)

```bash
git checkout main && git pull
git checkout -b hotfix/1.1.1
# arreglar
```

PR a `main`, tag `v1.1.1`, y luego llevar el arreglo a `develop`.

## Convención de commits (Conventional Commits)

| Prefijo     | Uso                         | Ejemplo                                  |
|-------------|-----------------------------|------------------------------------------|
| `feat:`     | Nueva funcionalidad         | `feat(frontend): botón para borrar tareas` |
| `fix:`      | Corrección de error         | `fix(api): validar id numérico`          |
| `docs:`     | Documentación               | `docs: actualizar README`                |
| `ci:`       | Workflows                   | `ci: cachear dependencias npm`           |
| `chore:`    | Mantenimiento               | `chore: actualizar dependencias`         |
| `test:`     | Tests                       | `test(api): caso de tarea inexistente`   |

## Antes de abrir una PR

```bash
cd api && npm run lint && npm test
docker compose up -d --build && docker compose ps
```
