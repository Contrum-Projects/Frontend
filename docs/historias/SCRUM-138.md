# SCRUM-138 · E12-H1 · Formulario de suscripción a ofertas

**Orden:** 46 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-68 · **API:** No

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** ninguna

Como un Visitante, necesito suscribirme a las ofertas desde el sitio, con la finalidad de enterarme de las promociones.

**Historia backend:** SCRUM-68 · **Figma:** footer de la tienda

## Criterios de aceptación

1. **Suscribirse.** El visitante ingresa su correo. Cuando envía. La pantalla indica que debe confirmar desde el correo.
2. **Confirmación.** El visitante abre el enlace del correo. Cuando se carga. La pantalla confirma la suscripción.
3. **Exceso de solicitudes.** El servidor rechaza por límite. Cuando el visitante intenta otra vez. La pantalla pide esperar un momento.

## Pantalla y ruta

| Pantalla              | Escritorio     | Celular | Ruta                  |
| --------------------- | -------------- | ------- | --------------------- |
| Suscripción a ofertas | (en el footer) | —       | componente del footer |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
