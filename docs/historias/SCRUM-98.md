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

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/personal`, `/api/personal/{codigoPublico}/desactivar`, `/invitacion`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
