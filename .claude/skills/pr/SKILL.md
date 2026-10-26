---
name: pr
description: Abre el pull request de la rama actual hacia main con la plantilla del proyecto, y deja la historia En revisión en el tablero local. Úsala cuando la historia está implementada y verificada.
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(pnpm verificar) Bash(gh pr view *) Read Edit
---

# Abrir pull request

1. **Rama.** Confirma que no estás en `main` y que la rama se llama `SCRUM-<n>-...`. Saca la clave
   de la historia del nombre. Si hay cambios sin commit, muéstralos y pregunta qué hacer.
2. **Al día con main.** `git fetch origin main`. Si `main` avanzó, propone `git rebase origin/main`
   y resuelve conflictos con el usuario.
3. **Verificación.** Corre `pnpm verificar`. Si algo falla, detente y arréglalo antes de seguir.
4. **Descripción.** Lee `docs/historias/SCRUM-<n>.md` y llena `.github/pull_request_template.md`:
   - Título: `SCRUM-<n> <resumen de la historia>`.
   - Cada criterio de aceptación con la prueba que lo comprueba (`archivo › nombre del test`).
   - Pantalla de Figma (nodos de `docs/pantallas.md`) y rutas nuevas.
   - Historia backend y endpoints que usa; tipos agregados a `compartido/api/respuestas.ts`.
   - Variables nuevas de `.env.example`; lo pendiente o las decisiones que el revisor debe validar.
     Muestra la descripción al usuario antes de publicar.
5. **Publicar** (cada paso pide permiso):
   - `git push -u origin <rama>`
   - `gh pr create --base main --title "<título>" --body-file <archivo temporal>`
     Si `gh` no está instalado o no tiene sesión, entrega el título y la descripción para que el
     usuario los pegue en GitHub.
6. **Tablero.** Cambia la historia a **En revisión** en `docs/historias/README.md`, anota el enlace
   al PR en sus «Notas de trabajo» y haz un commit con eso (`docs: SCRUM-<n> en revisión`) antes
   del push. Si quedaron endpoints simulados, lístalos en la sección API del PR: la historia
   pasa a **Hecha** solo cuando se integra y se probó con el backend real.
7. Recuerda que el PR lo revisa y lo integra otro integrante del equipo; tú no haces merge.
