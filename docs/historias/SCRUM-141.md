# SCRUM-141 · E12-H5 · Tarjeta del saludo de cumpleaños

**Orden:** 49 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-72 · **API:** No

**Necesita antes (frontend):** [SCRUM-140](SCRUM-140.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito activar el saludo de cumpleaños y decidir si lleva oferta, con la finalidad de fidelizar a los clientes.

**Historia backend:** SCRUM-72 · **Figma:** P7 Campañas (tarjeta del saludo de cumpleaños)

## Criterios de aceptación

1. **Activar.** El administrador abre «Campañas». Cuando activa el saludo. La tarjeta muestra el estado activo.
2. **Oferta opcional.** El saludo está activo. Cuando el administrador activa o quita la oferta. La tarjeta lo refleja y guarda el cambio.

**Nota:** qué es la oferta del saludo sigue por definir.

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
