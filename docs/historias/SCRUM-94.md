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

| Pantalla              | Escritorio | Celular   | Ruta                                                |
| --------------------- | ---------- | --------- | --------------------------------------------------- |
| 06 Ingreso y registro | 2018:1261  | 2018:2508 | `/ingresar` (el registro va aparte, en `/registro`) |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `POST /api/cuentas/sesion`, `POST /api/cuentas/sesion/renovar`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/4

- **Ingreso y registro son páginas separadas** (decisión del equipo): Figma los muestra juntos,
  pero `/ingresar` tiene solo la tarjeta «Iniciar sesión», centrada, y el registro va en
  `/registro` (SCRUM-93). Bajo el botón, «¿No tienes cuenta? Crear cuenta» enlaza al registro
  (404 hasta SCRUM-93).
- **Después de ingresar** (`tienda/cuenta/destinoIngreso.ts`): vendedor, bodeguero y
  administrador van a `/panel` (o a la página del panel de `?volver=`); cliente y profesional
  vuelven a `?volver=` o al inicio. `?volver=` solo acepta rutas internas (no `//` ni `/\`).
  `/panel` da 404 hasta SCRUM-99. Con la sesión ya iniciada, `/ingresar` redirige igual.
- **Errores:** se muestra el mensaje del backend como error general, sin marcar un campo
  (401 «Correo o contraseña incorrectos.», 403 correo sin confirmar o cuenta desactivada).
  El 429 («Demasiados intentos fallidos. Espera N minutos…») va como aviso. Un 5xx o la falta
  de conexión muestran el mensaje genérico. Lo escrito se conserva.
- **Seguridad:** `?volver=` se interpreta como URL y debe ser del mismo origen: el navegador
  borra tabuladores y saltos de línea, y `/\t/otro.cl` terminaría en otro dominio.
- **`compartido/ui/label.tsx`:** ahora trae `texto-etiqueta` de base. Antes, `font-medium` y
  `leading-none` le ganaban a `texto-etiqueta` en el CSS generado (peso 500 en vez de 600).
- **Endpoints:** solo reales (`POST /api/cuentas/sesion`). El Swagger no declara la respuesta;
  se usa `SesionIniciada` de `compartido/api/respuestas.ts`.
- **Pendiente:**
  - «¿Olvidaste tu contraseña?» enlaza a `/recuperar-contrasena` (SCRUM-96).
  - El enlace «Ingresar» del header todavía no envía `?volver=` con la página actual.
  - No se pudo revisar en el navegador (sin extensión de Chrome en la sesión).
- **Entorno:** con `core.autocrlf=true`, el checkout deja CRLF y `pnpm format:check` falla en
  archivos ajenos a la historia. Sugerencia: un `.gitattributes` con `* text=auto eol=lf`.
