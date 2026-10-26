# SCRUM-134 · E10-H1 · Formulario y estados de la verificación profesional

**Orden:** 42 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-62 · **API:** No

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** [SCRUM-136](SCRUM-136.md)

Como un Cliente, necesito solicitar mi verificación y ver su estado, con la finalidad de acceder al precio mayorista.

**Historia backend:** SCRUM-62 (también muestra el resultado de SCRUM-63) · **Figma:** 08 Verificación profesional

## Criterios de aceptación

1. **Formulario.** El cliente abre «Verificación profesional». Cuando ingresa su RUT y adjunta uno o más documentos. Se envía la solicitud y la pantalla muestra «En revisión».
2. **Sin RUT.** La cuenta no tiene RUT. Cuando intenta enviar. La pantalla le pide registrarlo.
3. **Rechazada.** La solicitud fue rechazada. Cuando el cliente abre la pantalla. Ve el motivo y puede enviar una nueva solicitud.
4. **Archivos.** El cliente envía documentos. Cuando la pantalla los pide. Informa que los archivos se borran a los 30 días de resuelta la solicitud.

## Pantalla y ruta

| Pantalla                    | Escritorio                      | Celular                         | Ruta                   |
| --------------------------- | ------------------------------- | ------------------------------- | ---------------------- |
| 08 Verificación profesional | 2020:1666 · rechazada 2038:2518 | 2020:3006 · rechazada 2038:5337 | `/cuenta/verificacion` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
