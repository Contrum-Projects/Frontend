# SCRUM-140 · E12-H3 · Panel de campañas: redactar, segmentar y enviar

**Orden:** 48 de 53 · **Puntos:** 8 · **Historia backend:** SCRUM-70 · **API:** No

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-141](SCRUM-141.md)

Como Personal de tienda, necesito crear y enviar campañas desde el panel, con la finalidad de promocionar productos a quienes les interesan.

**Historia backend:** SCRUM-70 · **Figma:** P7 Campañas, P7a Nueva campaña, P7b Confirmar envío

## Criterios de aceptación

1. **Listado.** El personal abre «Campañas». Cuando carga. Ve la lista de contactos con consentimiento, las campañas con segmento, destinatarios, estado y apertura.
2. **Redactar.** El personal escribe asunto y mensaje y elige el segmento. Cuando usa la vista previa (al lado en escritorio, en pestañas en celular). Ve el correo con remitente y enlace de baja y el conteo de destinatarios con consentimiento.
3. **Confirmar envío.** La campaña está lista. Cuando el personal pulsa enviar. Una ventana pide confirmar con el número de destinatarios y avisa que se envía una sola vez.

## Pantalla y ruta

| Pantalla                                | Escritorio                        | Celular               | Ruta                                       |
| --------------------------------------- | --------------------------------- | --------------------- | ------------------------------------------ |
| P7 Campañas · P7a Nueva · P7b Confirmar | 2045:1569 · 2046:1646 · 2046:1846 | 2047:1225 · 2047:1323 | `/panel/campanas`, `/panel/campanas/nueva` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
