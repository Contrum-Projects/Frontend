# SCRUM-97 · E1-H5 · Mis datos y direcciones

**Orden:** 6 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-23 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** [SCRUM-126](SCRUM-126.md), [SCRUM-118](SCRUM-118.md), [SCRUM-129](SCRUM-129.md), [SCRUM-134](SCRUM-134.md), [SCRUM-139](SCRUM-139.md)

Como un Cliente, necesito pantallas para editar mis datos y administrar mis direcciones, con la finalidad de mantener mi cuenta al día.

**Historia backend:** SCRUM-23 · **Figma:** 10 Cuenta (Mis datos, Direcciones)

## Criterios de aceptación

1. **Editar datos.** El cliente abre «Mis datos». Cuando modifica y guarda. La pantalla muestra los datos actualizados.
2. **Direcciones.** El cliente abre «Direcciones». Cuando agrega, edita o elimina una y marca una como principal. La lista muestra una sola principal, con región y comuna elegidas de la lista oficial.
3. **RUT repetido.** El servidor informa que el RUT ya está en uso. Cuando el cliente guarda. La pantalla muestra el error junto al campo.
4. **Menú de cuenta.** El cliente está en escritorio o celular. Cuando navega entre pantallas de cuenta. Usa el menú lateral en escritorio o el enlace «Mi cuenta» en celular.

## Pantalla y ruta

| Pantalla                                     | Escritorio | Celular | Ruta            |
| -------------------------------------------- | ---------- | ------- | --------------- |
| 10 Mis datos (datos, direcciones, seguridad) | 2034:2270  | —       | `/cuenta/datos` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Parcial**. `/api/cuentas/yo`, `/api/cuentas/yo/direcciones…`; falta la lista de comunas (la base solo tiene regiones).

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
