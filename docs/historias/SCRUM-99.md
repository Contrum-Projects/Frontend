# SCRUM-99 · E13-H2 · Menú y rutas del panel según el rol

**Orden:** 7 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-25 · **API:** Revisar

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** [SCRUM-98](SCRUM-98.md), [SCRUM-103](SCRUM-103.md), [SCRUM-100](SCRUM-100.md), [SCRUM-110](SCRUM-110.md), [SCRUM-130](SCRUM-130.md), [SCRUM-135](SCRUM-135.md), [SCRUM-140](SCRUM-140.md), [SCRUM-143](SCRUM-143.md)

Como un Administrador, necesito que el panel muestre solo lo que cada rol puede usar, con la finalidad de evitar acciones no autorizadas desde la interfaz.

**Historia backend:** SCRUM-25 · **Figma:** Panel · Escritorio y Panel · Celular (menú lateral, navegación inferior)

## Criterios de aceptación

1. **Opciones por rol.** El usuario del personal inicia sesión. Cuando se carga el panel. El menú muestra solo las secciones permitidas a su rol.
2. **Acceso denegado.** El servidor responde 403. Cuando la interfaz lo recibe. Muestra un aviso de falta de permiso y no cambia datos en pantalla.
3. **Cliente en el panel.** Una cuenta cliente o profesional abre la dirección del panel. Cuando carga. Se la redirige a la tienda.

**Nota:** el frontend solo oculta opciones; quien autoriza es el backend. Los permisos de vendedor y bodeguero siguen por definir.

## Pantalla y ruta

| Pantalla   | Escritorio | Celular  | Ruta     |
| ---------- | ---------- | -------- | -------- |
| P1 Resumen | 2028:470   | 2023:206 | `/panel` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Revisar**. No hay endpoint propio; el rol viene en `/api/cuentas/yo` o en el token. Confirmar en el backend.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
