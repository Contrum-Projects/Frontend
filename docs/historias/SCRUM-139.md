# SCRUM-139 · E12-H2 · Pantalla Ofertas por correo y baja

**Orden:** 47 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-69 · **API:** No

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito elegir si recibo publicidad y darme de baja, con la finalidad de controlar lo que la tienda me envía.

**Historia backend:** SCRUM-69 · **Figma:** 10c Ofertas por correo

## Criterios de aceptación

1. **Interruptor.** El cliente abre «Ofertas por correo». Cuando activa o desactiva la opción. La pantalla muestra el estado con la fecha del consentimiento y qué incluye (campañas, cumpleaños, recordatorios de carrito).
2. **Correo sin verificar.** La cuenta no verificó su correo. Cuando abre la pantalla. Se explica que debe verificarlo para recibir ofertas.
3. **Baja desde un correo.** La persona abre el enlace de baja. Cuando se carga. La pantalla confirma que no recibirá más publicidad en esa dirección.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                                                            |
| ---------------------- | ---------- | --------- | --------------------------------------------------------------- |
| 10c Ofertas por correo | 2066:3690  | 2070:2703 | `/cuenta/ofertas`; baja desde el correo: `/ofertas/baja?token=` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
