# GitFlow

## Ramas

| Rama | Vida | Sale de | Se fusiona en |
|------|------|---------|---------------|
| `main` | Permanente | — | — |
| `develop` | Permanente | `main` | — |
| `feature/<nombre>` | Temporal | `develop` | `develop` |
| `release/<versión>` | Temporal | `develop` | `main` + `develop` |
| `hotfix/<versión>` | Temporal | `main` | `main` + `develop` |

## Ciclo de vida de una funcionalidad

1. Crear un **Issue** (plantilla "Nueva funcionalidad").
2. `git checkout -b feature/<nombre> develop`
3. Commits con Conventional Commits (`feat:`, `fix:`…).
4. Push y **Pull Request a `develop`** usando la plantilla, con `Closes #<issue>`.
5. El **CI** corre automáticamente.
6. **Revisión** de un compañero (mínimo 1 aprobación).
7. *Squash and merge* y borrar la rama.

## Versionado semántico

`MAYOR.MENOR.PARCHE` → `v1.2.3`

- **MAYOR**: cambios incompatibles en la API
- **MENOR**: funcionalidades nuevas compatibles
- **PARCHE**: correcciones (`hotfix/*`)

## Protección de ramas (configurar en GitHub)

**Settings → Branches → Add branch ruleset** (o *Add classic branch protection rule*) para `main` y `develop`:

- ☑ Require a pull request before merging → 1 approval
- ☑ Require status checks to pass → `Lint y tests`, `Build y prueba con Docker Compose`
- ☑ Require branches to be up to date before merging
- ☑ Block force pushes

## Comandos con la extensión git-flow (opcional)

```bash
git flow init -d
git flow feature start filtrar-tareas
git flow feature finish filtrar-tareas
git flow release start 1.1.0
git flow release finish 1.1.0
```
