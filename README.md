# Cabello Perfecto — Frontend

Tienda online y panel de administración de Cabello Perfecto. Una sola app Next.js que consume la
API del [backend](https://github.com/Contrum-Projects/Backend).

| Pieza       | Elección                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript 6  |
| Estilos     | Tailwind CSS 4 con los tokens de Figma; shadcn/ui (Radix) en `compartido/ui`  |
| API         | openapi-fetch con tipos generados del Swagger; TanStack Query en el navegador |
| Formularios | react-hook-form + zod                                                         |
| Pruebas     | Vitest + Testing Library                                                      |
| Calidad     | ESLint (next/core-web-vitals), Prettier, GitHub Actions y gitleaks            |

## Empezar

Requisitos: Node 22 y pnpm 11 (`corepack enable`), y el backend corriendo en
http://localhost:3000.

```bash
pnpm install
cp .env.example .env.local
pnpm dev                 # http://localhost:3001
```

- http://localhost:3001 muestra si la API está conectada.
- http://localhost:3001/muestrario (solo en desarrollo) muestra los tokens y componentes base.

## Comandos

| Comando          | Qué hace                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo en el puerto 3001                               |
| `pnpm verificar` | Lint, formato, tipos, pruebas y build: debe pasar antes de cada commit |
| `pnpm test`      | Pruebas (`pnpm test:watch` para dejarlas corriendo)                    |
| `pnpm api:tipos` | Regenera `compartido/api/esquema.d.ts` desde el Swagger del backend    |
| `pnpm format`    | Formatea con Prettier (también ordena las clases de Tailwind)          |

## Documentación

- [CLAUDE.md](CLAUDE.md): reglas del proyecto (también las sigue Claude Code).
- [docs/arquitectura.md](docs/arquitectura.md): proxy `/api`, sesión, datos, despliegue.
- [docs/diseno.md](docs/diseno.md): tokens y componentes de Figma, criterios de contenido.
- [docs/pantallas.md](docs/pantallas.md): historias, nodos de Figma y rutas.
- [docs/historias](docs/historias/README.md): tablero del frontend y una ficha por historia.
- [docs/api-simulada.md](docs/api-simulada.md): cómo avanzar sin el endpoint del backend.

## Claude Code

Con el repo abierto en Claude Code:

- `/siguiente` muestra el avance del tablero y la próxima historia que se puede tomar.
- `/historia SCRUM-93` lee la historia desde `docs/historias/`, revisa su API y su pantalla de
  Figma, crea la rama e implementa con pruebas.
- `/pr` abre el pull request y `/revisar` revisa una rama o PR (código, diseño, seguridad y
  criterios).
- `/api-tipos` actualiza los tipos cuando cambia el backend.

El backlog del frontend está en [docs/historias](docs/historias/README.md) (copia local de Jira con
el orden y el estado de cada historia), así que no hace falta Jira para trabajar. Para pantallas
cuyo endpoint aún no existe, usa la [API simulada](docs/api-simulada.md) (`API_SIMULADA=1`).

Los conectores de Figma y Jira (Atlassian) están en `.mcp.json`; la primera vez cada integrante
inicia sesión con `/mcp`. Jira solo se usa con `/sincronizar-jira`.

## Flujo

Una rama por historia desde `main` (`SCRUM-<n>-<descripcion>`), commits en español con la clave de
la historia y pull request revisado por otro integrante. Nadie hace push a `main`.
