---
name: historia
description: Empieza a trabajar una historia de frontend (SCRUM-n) de punta a punta - la lee desde docs/historias, revisa su API y su pantalla de Figma, planifica, crea la rama, implementa con pruebas por criterio y verifica en escritorio y celular. Úsala cuando el usuario diga "tomemos SCRUM-93", "implementa la pantalla de registro" o similar.
argument-hint: SCRUM-<n>
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(pnpm *) Bash(gh api *) Read Edit mcp__figma__get_design_context mcp__figma__get_screenshot mcp__figma__get_metadata mcp__figma__get_variable_defs
---

# Historia $ARGUMENTS

Trabaja la historia **$ARGUMENTS** siguiendo estos pasos en orden. Si el argumento viene vacío,
haz lo mismo que `/siguiente`: propone la primera historia «Por hacer» del tablero
(`docs/historias/README.md`) cuyas dependencias estén «Hecha» o «En revisión», y pregunta.

El backlog vive en el repositorio: **no hace falta Jira**. No leas ni cambies Jira desde aquí.

## 1. Leer la historia

- Abre `docs/historias/$ARGUMENTS.md`: criterios de aceptación, puntos, historia backend,
  pantalla de Figma con sus nodos, ruta, estado de la API y notas de trabajo anteriores.
- Mira en `docs/historias/README.md` su fila: si alguna historia de «Necesita antes» sigue
  «Por hacer» o «En curso», avísalo antes de seguir.
- Si el archivo no existe, pide al usuario el texto de la historia; no la armes de memoria.

## 2. Comprobar la API

- Busca en `compartido/api/esquema.d.ts` los endpoints que la pantalla necesita. Si el backend
  corre en local, primero `pnpm api:tipos` para tener el esquema al día.
- Lee la historia backend en el repo del backend cuando haga falta (controlador, DTO, reglas):
  `gh api -H "Accept: application/vnd.github.raw" repos/Contrum-Projects/Backend/contents/<ruta>`.
  Las reglas de negocio están en `docs/reglas-de-negocio.md` de ese repo.
- Actualiza la sección «API» del archivo de la historia y la columna API del tablero si cambió.
- **Si falta un endpoint:** propón trabajar con la API simulada (`docs/api-simulada.md`). Antes,
  escribe en la sección «API» de la historia la forma que vas a simular (ruta, cuerpo, respuesta,
  errores) y pregunta al usuario si ya la acordó con quien hace la historia backend. No inventes
  reglas: la ruta simulada devuelve datos fijos.

## 3. Ver la pantalla en Figma

- Usa los nodos de la sección «Pantalla y ruta» (o `docs/pantallas.md`).
- Con el MCP de Figma (fileKey `cl9eSD5YBS9qF4tQXJki68`): `get_screenshot` de escritorio y
  celular, y `get_design_context` de las secciones que vas a construir. Úsalo como referencia, no
  copies su código: traduce a los tokens de `app/globals.css` y a los componentes de
  `compartido/ui`.
- Lee `docs/diseno.md` (tokens, componentes y criterios de contenido).
- Las cifras, nombres y textos de ejemplo de Figma no se copian: vienen de la API.
- Si el MCP de Figma no responde, pide al usuario una captura o sigue con `docs/diseno.md` y
  avísalo en el resumen final.

## 4. Plan

Presenta un plan corto y espera la aprobación del usuario:

- Criterio de aceptación → qué componente o comportamiento lo cumple → qué prueba lo comprueba.
- Rutas y archivos: página en `app/…`, componentes en `tienda/<area>/` o `panel/<area>/`,
  componentes base nuevos en `compartido/ui`.
- Qué se pide en el servidor (datos públicos, dentro de `<Suspense>`) y qué en el navegador
  (TanStack Query con `api`).
- Endpoints reales y endpoints simulados.
- Estados: carga (esqueleto), vacío, error, sin permiso; y la versión de celular.
- Lo que no está definido (textos, estados, casos vacíos): **pregunta antes de inventarlo**.
- Dependencias nuevas, si hay (justificadas).

## 5. Rama y tablero

- `git fetch origin && git switch main && git pull --ff-only origin main`
- `git switch -c $ARGUMENTS-<descripcion-corta-en-kebab-case>`
- En `docs/historias/README.md`, cambia el estado de la historia a **En curso**.

## 6. Implementar

- Sigue `CLAUDE.md`: el backend decide precios y permisos, sesión en memoria, llamadas solo por
  `api`/`apiServidor`, lecturas del servidor dentro de `<Suspense>`, tokens de diseño, 360 px sin
  desplazamiento horizontal, accesibilidad.
- Escribe primero las pruebas de cada criterio (el nombre del test con la historia y el
  criterio), luego el código hasta que pasen. Las pruebas simulan `fetch`, no usan la API
  simulada.
- Formularios con react-hook-form + zod, mensajes en español junto a cada campo, sin perder lo
  escrito cuando el backend rechaza.

## 7. Verificar

- `pnpm verificar`.
- Con `pnpm dev` (backend en :3000, y `API_SIMULADA=1` si usas rutas simuladas), revisa la
  pantalla a 1440 y a 360 px. Compárala con el `get_screenshot` de Figma.
- Pide al subagente **verificador-criterios** que compare la historia con la implementación y las
  pruebas, y al subagente **revisor-diseno** que la compare con Figma. Corrige lo que marquen.
- Si la historia toca sesión, pagos, datos personales, subida de archivos o el panel, pide también
  al subagente **auditor-seguridad** que revise el diff.

## 8. Commit y notas

- Commits pequeños en español: `feat(<area>): <qué hace> ($ARGUMENTS)`.
- Completa «Notas de trabajo» en `docs/historias/$ARGUMENTS.md`: decisiones, endpoints simulados,
  preguntas abiertas y lo que el backend debería cambiar. Inclúyelo en el commit.
- Termina con un resumen: criterios cumplidos (con su prueba), decisiones, pendientes, y sugiere
  `/pr`.
