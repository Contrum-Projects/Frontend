# SCRUM-96 · E1-H4 · Pantallas de recuperación de contraseña

**Orden:** 4 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-22 · **API:** Sí

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

Estado al 27-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. Sin rutas simuladas.

- `POST /api/cuentas/recuperar-contrasena` `{ email }` → 200 `{ mensaje }` siempre igual, tenga o
  no cuenta el correo; 400 correo inválido; 429 más de 5 en 15 min por IP.
- `POST /api/cuentas/restablecer-contrasena` `{ token, contrasena, confirmacionContrasena }` →
  200 `{ mensaje }`; 400 contraseña inválida o distinta, o «El enlace de recuperación no es
  válido, ya se usó o venció. Solicita uno nuevo.»; 429.
- El Swagger no declara el cuerpo `{ mensaje }` del 200: se usa `MensajeApi` de `respuestas.ts`.

## Notas de trabajo

- **Enlace vencido al abrirlo (criterio 3):** el backend no tiene una ruta para validar el token
  sin cambiar la contraseña, así que el enlace vencido o usado se detecta al enviar la nueva
  contraseña, no al abrir el enlace. Sin token en la URL se muestra el aviso directamente.
  Pendiente para el backend: una ruta como `GET /api/cuentas/restablecer-contrasena/:token`
  permitiría avisarlo al abrir (decisión del 27-10-2026).
- **Error del enlace vs. de la contraseña:** los dos son 400 sin código; se distinguen porque el
  mensaje empieza con «El enlace» o «El token» (`esquemaRecuperacion.ts`). Si el backend agrega un
  código de error, se reemplaza.
- **Textos sin Figma** (aprobados el 27-10-2026): «Nueva contraseña», el texto con las reglas,
  «Repite tu contraseña», «Guardar contraseña», «Contraseña actualizada», «El enlace venció» y
  «Pedir un enlace nuevo». Figma solo tiene el formulario de solicitud en celular (2034:4783);
  en escritorio se usa la tarjeta centrada de `/ingresar`.
- **«Reenviar correo»** (Figma 2034:4841) vuelve a llamar al mismo endpoint con el mismo correo;
  el aviso «Te enviamos el correo de nuevo.» no está en Figma.
- El token se lee una vez y se quita de la URL: si la persona recarga la página, ve «El enlace
  venció» aunque siga vigente y debe abrir de nuevo el enlace del correo. Las páginas van con `noindex` y
  `referrer: no-referrer`.
- Reglas de la contraseña compartidas con el registro en `esquemaContrasena.ts`; el aviso de
  resultado de `/confirmar-correo` pasó a `resultadoCuenta.tsx` para reusarlo.
- Pendiente para el backend: declarar en el Swagger la respuesta `{ mensaje }` de ambas rutas.
