# SCRUM-136 · E10-H4 · Cuenta profesional activa en la tienda

**Orden:** 44 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-65 · **API:** No

**Necesita antes (frontend):** [SCRUM-109](SCRUM-109.md), [SCRUM-134](SCRUM-134.md)  
**La necesitan después:** [SCRUM-137](SCRUM-137.md)

Como un Cliente con la verificación aprobada, necesito que la tienda cambie a vista profesional apenas se apruebe, con la finalidad de comprar sin esperas.

**Historia backend:** SCRUM-65 · **Figma:** 08 Verificación profesional, 03 Ficha (peluquero verificado)

## Criterios de aceptación

1. **Cambio de vista.** La solicitud se aprobó. Cuando el cliente vuelve a cargar la tienda. Ve precios mayoristas y productos exclusivos, y la pantalla de verificación muestra la cuenta como aprobada.
2. **Invitación al perfil.** La cuenta acaba de ser aprobada. Cuando abre su cuenta. Ve la invitación a completar el perfil profesional.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                         |
| ---------------------- | ---------- | --------- | ---------------------------- |
| 08c Perfil profesional | 2038:2666  | 2038:5397 | `/cuenta/perfil-profesional` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
