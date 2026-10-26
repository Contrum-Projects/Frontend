# SCRUM-94 · E1-H2 · Pantalla de inicio de sesión

**Orden:** 2 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-20 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** [SCRUM-93](SCRUM-93.md), [SCRUM-96](SCRUM-96.md), [SCRUM-95](SCRUM-95.md), [SCRUM-97](SCRUM-97.md), [SCRUM-99](SCRUM-99.md)

Como un Usuario registrado, necesito una pantalla para iniciar sesión, con la finalidad de entrar a mi cuenta desde la tienda o el panel.

**Historia backend:** SCRUM-20 · **Figma:** 06 Ingreso y registro

## Criterios de aceptación

1. **Ingreso correcto.** El usuario ingresa sus credenciales. Cuando envía el formulario. La interfaz guarda la sesión y muestra las opciones de su rol (tienda o panel).
2. **Credenciales incorrectas.** El servidor rechaza el ingreso. Cuando se muestra la respuesta. La pantalla informa el error sin indicar qué dato falló.
3. **Límite de intentos.** El servidor bloquea los intentos. Cuando el usuario vuelve a intentar. La pantalla indica que debe esperar.

## Pantalla y ruta

| Pantalla              | Escritorio | Celular   | Ruta                                               |
| --------------------- | ---------- | --------- | -------------------------------------------------- |
| 06 Ingreso y registro | 2018:1261  | 2018:2508 | `/ingresar` (pestañas «Ingresar» y «Crear cuenta») |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `POST /api/cuentas/sesion`, `POST /api/cuentas/sesion/renovar`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
