---
name: historia
description: Empieza a trabajar una historia de frontend de Jira (SCRUM-n) de punta a punta - la lee con su historia backend y su pantalla de Figma, planifica, crea la rama, implementa con pruebas por criterio y verifica en escritorio y celular. Úsala cuando el usuario diga "tomemos SCRUM-93", "implementa la pantalla de registro" o similar.
argument-hint: SCRUM-<n>
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(pnpm *) Bash(gh api *) mcp__atlassian__getJiraIssue mcp__atlassian__searchJiraIssuesUsingJql mcp__figma__get_design_context mcp__figma__get_screenshot mcp__figma__get_metadata mcp__figma__get_variable_defs
---

# Historia $ARGUMENTS

Trabaja la historia **$ARGUMENTS** siguiendo estos pasos en orden. Si el argumento viene vacío,
pregunta qué historia tomar y sugiere la siguiente del sprint activo:
`project = SCRUM AND labels = frontend AND sprint in openSprints() AND statusCategory = "To Do" ORDER BY Rank ASC`.

## 1. Leer la historia y su historia backend

- Lee la incidencia con el conector de Jira (`getJiraIssue`, cloudId
  `bc9de2c3-63ac-4379-8782-8b69ef593475`): resumen, descripción completa (criterios de aceptación),
  puntos (`customfield_10016`), épica padre y estado.
- La descripción nombra su **historia backend** (`Historia backend: SCRUM-n`) y su pantalla de
  Figma. Lee también la historia backend: ahí están los endpoints y las reglas.
- Si el conector no responde, pide al usuario que pegue la historia; no sigas de memoria.
- Si la historia backend no está Finalizada, o su endpoint no aparece en
  `compartido/api/esquema.d.ts`, avísalo antes de seguir: puedes avanzar la pantalla con datos de
  prueba solo si el usuario lo aprueba.

## 2. Ver la pantalla en Figma

- Busca la pantalla en `docs/pantallas.md` (nodos de escritorio y celular, y ruta propuesta).
- Con el MCP de Figma (fileKey `cl9eSD5YBS9qF4tQXJki68`): `get_screenshot` de ambas versiones y
  `get_design_context` de las secciones que vas a construir. Úsalo como referencia, no copies su
  código: traduce a los tokens de `app/globals.css` y a los componentes de `compartido/ui`.
- Lee `docs/diseno.md` (tokens, componentes y criterios de contenido).
- Las cifras, nombres y textos de ejemplo de Figma no se copian: vienen de la API.

## 3. Entender el contrato con la API

- Revisa en `compartido/api/esquema.d.ts` cada endpoint que la pantalla usa: ruta, parámetros y
  cuerpo. Si la respuesta no tiene tipo, búscala en el backend
  (`gh api -H "Accept: application/vnd.github.raw" repos/Contrum-Projects/Backend/contents/<ruta>`)
  y agrégala a `compartido/api/respuestas.ts` citando el archivo.
- Si el backend corre en local, `pnpm api:tipos` para tener el esquema al día.
- Lee la sección de la épica en `docs/reglas-de-negocio.md` del backend.
- Lista lo que no está definido (textos, estados, casos vacíos). **Pregunta antes de inventarlo.**

## 4. Plan

Presenta un plan corto y espera la aprobación del usuario:

- Criterio de aceptación → qué componente o comportamiento lo cumple → qué prueba lo comprueba.
- Rutas y archivos: página en `app/…` (según `docs/pantallas.md`), componentes en `tienda/<area>/`
  o `panel/<area>/`, componentes base nuevos en `compartido/ui`.
- Qué se pide en el servidor (datos públicos, dentro de `<Suspense>`) y qué en el navegador
  (TanStack Query con `api`).
- Estados: carga (esqueleto), vacío, error, sin permiso; y la versión de celular.
- Dependencias nuevas, si hay (justificadas).

## 5. Rama y Jira

- `git fetch origin && git switch main && git pull --ff-only origin main`
- `git switch -c SCRUM-<n>-<descripcion-corta-en-kebab-case>`
- Ofrece mover la historia a **En curso** en Jira (pide confirmación; el cambio lo ve todo el equipo).

## 6. Implementar

- Sigue `CLAUDE.md`: el backend decide precios y permisos, sesión en memoria, llamadas solo por
  `api`/`apiServidor`, lecturas del servidor dentro de `<Suspense>`, tokens de diseño, 360 px sin
  desplazamiento horizontal, accesibilidad.
- Escribe primero las pruebas de cada criterio (el nombre del test con la historia y el
  criterio), luego el código hasta que pasen.
- Formularios con react-hook-form + zod, mensajes en español junto a cada campo, sin perder lo
  escrito cuando el backend rechaza.

## 7. Verificar

- `pnpm verificar`.
- Con `pnpm dev` (y el backend en :3000), revisa la pantalla a 1440 y a 360 px. Compárala con el
  `get_screenshot` de Figma.
- Pide al subagente **verificador-criterios** que compare la historia con la implementación y las
  pruebas, y al subagente **revisor-diseno** que la compare con Figma. Corrige lo que marquen.
- Si la historia toca sesión, pagos, datos personales, subida de archivos o el panel, pide también
  al subagente **auditor-seguridad** que revise el diff.

## 8. Commit

- Commits pequeños en español: `feat(<area>): <qué hace> (SCRUM-<n>)`.
- Termina con un resumen: criterios cumplidos (con su prueba), decisiones tomadas, lo que quedó
  pendiente o por preguntar (incluido lo que el backend debería cambiar), y sugiere `/pr`.
