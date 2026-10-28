# SCRUM-98 · E13-H1 · Pantalla Personal del panel

**Orden:** 8 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-24 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito la pantalla Personal del panel, con la finalidad de crear y desactivar cuentas del personal.

**Historia backend:** SCRUM-24 · **Figma:** P8 Personal, P8a Nueva cuenta de personal

## Criterios de aceptación

1. **Listado.** El administrador abre «Personal». Cuando carga la pantalla. Ve una tabla (escritorio) o lista (celular) con rol, estado y último acceso.
2. **Nueva cuenta.** El administrador pulsa «Nueva cuenta». Cuando completa nombre, apellido, correo y rol (tarjetas de opción) y guarda. Se crea la cuenta y se avisa que la persona recibirá un correo para crear su contraseña.
3. **Desactivar.** La cuenta está activa. Cuando el administrador la desactiva (interruptor). La interfaz pide confirmación y la deja como desactivada, sin borrarla.

## Pantalla y ruta

| Pantalla                       | Escritorio            | Celular   | Ruta                                                                                                        |
| ------------------------------ | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| P8 Personal · P8a Nueva cuenta | 2049:1896 · 2049:2070 | 2051:1343 | `/panel/personal`; activar la cuenta desde el correo: `/personal/activar?token=` (ya fijada por el backend) |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 28-10-2026 (`pnpm api:tipos` contra el backend local): **Sí**, con una falta.

- `GET /api/personal`: lista de `CuentaPersonal` (nombre, apellido, email, rol, activo,
  invitacionPendiente). El Swagger no declara la respuesta: el tipo está en
  `compartido/api/respuestas.ts`. **No trae el último acceso** que pide el criterio 1.
- `POST /api/personal` (201, 400, 409 correo registrado), `POST /{codigoPublico}/desactivar`
  (204; 409 si es la propia cuenta), `POST /{codigoPublico}/invitacion` (204; 409 si está
  desactivada o ya definió la contraseña) y `POST /api/personal/invitacion/aceptar` (público).
- No hay endpoint para reactivar una cuenta: el interruptor de una desactivada queda deshabilitado.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

- **Último acceso (pendiente del backend):** `GET /api/personal` no lo entrega. Decisión del
  28-10-2026: la columna se omite y el estado muestra «Invitación pendiente» cuando la persona
  aún no define su contraseña. Pedir al backend `ultimoAcceso` (fecha de la última sesión o
  `null`) en `CuentaPersonal`, y que declare la respuesta en el Swagger. El criterio 1 queda
  incompleto hasta entonces.
- **Acciones:** como en Figma, escritorio con menú «⋯» por fila (Reenviar invitación, solo si
  está pendiente; Desactivar cuenta) y celular con interruptor. En celular, «Reenviar
  invitación» es un enlace bajo el nombre (Figma no lo tiene). La propia cuenta no muestra
  acciones (el backend responde 409).
- **Sin el aviso de Figma** «Los permisos de vendedor y bodeguero están por definir»: la matriz
  se acordó el 19-10-2026 (ver SCRUM-99).
- **Activar la cuenta:** `/personal/activar?token=` (sin pantalla en Figma) reusa el formulario
  de «Nueva contraseña» de SCRUM-96 con `enlace="invitacion"`. Quita el token de la URL, no
  envía Referer y no se indexa. Si el enlace venció, pide una invitación nueva a la
  administración.
- **Componentes base:** `compartido/ui/switch.tsx` y `radio-group.tsx` quedaron adaptados a
  Figma (interruptor 40 × 24 y radio de 20 px).
