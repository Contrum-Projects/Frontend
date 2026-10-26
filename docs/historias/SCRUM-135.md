# SCRUM-135 · E10-H3 · Panel de verificaciones: revisión manual

**Orden:** 43 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-64 · **API:** No

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito revisar solicitudes desde el panel, con la finalidad de decidir quién accede al precio mayorista.

**Historia backend:** SCRUM-64 · **Figma:** P4 Verificación

## Criterios de aceptación

1. **Pendientes.** El personal abre «Verificaciones». Cuando carga. Ve la lista de pendientes y la revisión al lado (escritorio) o en una pantalla aparte (celular).
2. **Revisión.** El personal abre una solicitud. Cuando la revisa. Ve el motivo de revisión manual, los documentos con el texto leído y el puntaje frente al umbral.
3. **Resolver.** El personal decide. Cuando aprueba, o rechaza con un motivo obligatorio. La solicitud sale de la lista y la pantalla confirma la resolución.

## Pantalla y ruta

| Pantalla          | Escritorio | Celular  | Ruta                    |
| ----------------- | ---------- | -------- | ----------------------- |
| P4 Verificaciones | 2029:872   | 2025:481 | `/panel/verificaciones` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
