# SCRUM-95 · E1-H3 · Cerrar sesión en el dispositivo o en todos

**Orden:** 5 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-21 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** ninguna

Como un Usuario registrado, necesito las opciones de cerrar sesión en la interfaz, con la finalidad de proteger mi cuenta.

**Historia backend:** SCRUM-21 · **Figma:** 10 Cuenta (seguridad), 12 Menú

## Criterios de aceptación

1. **Cerrar sesión.** El usuario tiene la sesión iniciada. Cuando pulsa «Cerrar sesión» en el menú. La interfaz borra la sesión local y muestra el sitio como visitante.
2. **Cerrar en todos los dispositivos.** El usuario está en «Mi cuenta · Seguridad». Cuando elige cerrar sesión en todos los dispositivos. La interfaz pide confirmación y luego lo lleva a iniciar sesión de nuevo.
3. **Sesión revocada.** Otra sesión fue cerrada desde otro dispositivo. Cuando la interfaz recibe un rechazo del servidor. Lleva al usuario a iniciar sesión.

## Pantalla y ruta

| Pantalla                                     | Escritorio | Celular | Ruta            |
| -------------------------------------------- | ---------- | ------- | --------------- |
| 10 Mis datos (datos, direcciones, seguridad) | 2034:2270  | —       | `/cuenta/datos` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 27-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `DELETE /api/cuentas/sesion`, `/api/cuentas/sesion/todas`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/10
- **Dónde se cierra la sesión:** al pie del menú del celular (Figma 2060:2224) y en el menú
  lateral de «Mi cuenta» en escritorio (2034:2324). El header de escritorio no tiene menú
  desplegable en Figma: el nombre lleva a Mis datos.
- **Adónde va después:** lo decide `CuentaProtegida` (layout de `/cuenta`). Si cerró sesión en
  este dispositivo, al inicio como visitante (fuera de `/cuenta` se queda en la página); si la
  cerró en todos, a `/ingresar`; si el servidor rechazó la sesión (401 y la renovación también
  falla) o entra sin sesión, a `/ingresar?volver=<ruta>`. Para distinguirlos, el almacén guarda
  `cierre: 'este' | 'todos'` cuando la persona cerró la sesión.
- **Si el cierre falla** (5xx, 429 o sin conexión): la sesión sigue abierta y se muestra «No
  pudimos cerrar tu sesión. Intenta de nuevo.» junto al botón (en el diálogo, para «todos»).
  Así nadie cree haber cerrado una sesión que sigue viva en el servidor (acordado con el
  usuario). Un 401 cuenta como «ya estaba cerrada».
- **Carrera con la renovación:** antes de cerrar se espera la renovación en curso, y una
  renovación que termina después de cerrar no revive la sesión (contador `generacion` en
  `almacen.ts`).
- **/cuenta/datos:** por ahora solo la tarjeta Seguridad. Datos personales y Direcciones
  quedan para SCRUM-97, que reutiliza el layout y el menú de la cuenta.
- **«Cambiar contraseña»:** enlaza a `/recuperar-contrasena` (flujo por correo de SCRUM-96)
  y la fila no muestra «Cambiada hace…» (acordado con el usuario).
- **Confirmación de «Cerrar sesión en todos»:** `AlertDialog`. Figma no tiene diseño ni textos
  para este diálogo: «¿Cerrar sesión en todos tus dispositivos?» / «También en este. Para
  volver a usar tu cuenta, tendrás que ingresar de nuevo.» — revisar con diseño.

**Pendientes sugeridos (no aplicados):**

- Avisar a las otras pestañas del mismo navegador al cerrar sesión (`BroadcastChannel`): hoy
  siguen con su token en memoria hasta la próxima petición rechazada.
- Vaciar el caché de TanStack Query también cuando el servidor rechaza la sesión (hoy solo al
  cerrarla a mano).
- Los enlaces del menú de la cuenta a páginas de otras historias (pedidos, direcciones,
  facturación, verificación, ofertas) dan 404 hasta que esas historias existan.

**Para el backend:**

- No hay endpoint para cambiar la contraseña con la sesión iniciada (contraseña actual y
  nueva) ni un dato con la fecha del último cambio; Figma los muestra en la tarjeta Seguridad.
