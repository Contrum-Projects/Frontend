# SCRUM-96 · E1-H4 · Pantallas de recuperación de contraseña

**Orden:** 4 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-22 · **API:** No

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** ninguna

Como un Usuario registrado, necesito las pantallas para recuperar mi contraseña, con la finalidad de volver a entrar si la olvido.

**Historia backend:** SCRUM-22 · **Figma:** 10 Cuenta (recuperar contraseña y «Revisa tu correo»)

## Criterios de aceptación

1. **Solicitud.** El usuario abre «¿Olvidaste tu contraseña?». Cuando ingresa su correo y envía. La pantalla muestra «Revisa tu correo».
2. **Nueva contraseña.** El usuario abre el enlace vigente. Cuando define la nueva contraseña. La pantalla confirma el cambio y lo lleva a iniciar sesión.
3. **Enlace vencido o usado.** El servidor rechaza el enlace. Cuando el usuario lo abre. La pantalla explica el motivo y ofrece pedir uno nuevo.

## Pantalla y ruta

| Pantalla                | Escritorio | Celular                                | Ruta                                                      |
| ----------------------- | ---------- | -------------------------------------- | --------------------------------------------------------- |
| 10 Recuperar contraseña | —          | 2034:4783 · revisa tu correo 2034:4841 | `/recuperar-contrasena`, `/restablecer-contrasena?token=` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. No hay endpoints de recuperación de contraseña.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
