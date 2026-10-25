---
name: api-tipos
description: Actualiza los tipos de la API (compartido/api/esquema.d.ts) desde el Swagger del backend y revisa qué cambió para el frontend. Úsala cuando el backend agregó o cambió endpoints, o cuando un tipo no coincide con lo que responde la API.
disable-model-invocation: true
allowed-tools: Bash(pnpm api:tipos) Bash(pnpm typecheck) Bash(git diff *) Bash(curl -s *)
---

# Actualizar los tipos de la API

1. **Backend arriba.** Comprueba que responde: `curl -s ${API_URL:-http://localhost:3000}/api/salud`.
   Si no, pide al usuario que lo levante (`pnpm start:dev` en el repo del backend, con
   `docker compose up -d db redis`) y que esté actualizado con su `main`.
2. **Generar.** `pnpm api:tipos`.
3. **Qué cambió.** `git diff --stat compartido/api/esquema.d.ts` y resume en una tabla: rutas
   nuevas, rutas eliminadas, cuerpos o parámetros que cambiaron.
4. **Tipos.** `pnpm typecheck`. Si algo dejó de compilar, explica cada error y propone la
   corrección; no la apliques sin aprobación si cambia el comportamiento de una pantalla.
5. **Respuestas documentadas.** Si ahora una respuesta tiene tipo en el esquema, propone borrar el
   tipo copiado de `compartido/api/respuestas.ts` y quitar el `exigir<Tipo>` correspondiente.
6. Sugiere el commit: `chore(api): actualizar tipos desde el Swagger`.
