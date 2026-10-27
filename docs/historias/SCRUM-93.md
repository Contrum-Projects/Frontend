# SCRUM-93 · E1-H1 · Pantallas de registro y confirmación del correo

**Orden:** 3 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-19 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** ninguna

Como un Visitante, necesito un formulario de registro y las pantallas de confirmación del correo, con la finalidad de crear mi cuenta desde la tienda.

**Historia backend:** SCRUM-19 · **Figma:** 06 Ingreso y registro

## Criterios de aceptación

1. **Formulario de registro.** El visitante abre «Crear cuenta». Cuando completa el formulario. La pantalla pide nombre, apellido, correo y contraseña; teléfono, RUT, fecha de nacimiento y género son opcionales, y la casilla de ofertas aparece desmarcada.
2. **Errores del servidor.** El correo o el RUT ya existen, o las contraseñas no coinciden. Cuando se envía el formulario. La pantalla muestra cada error junto a su campo, sin perder lo escrito.
3. **Confirmación del correo.** El registro fue exitoso. Cuando la persona vuelve a la tienda o abre el enlace del correo. La pantalla indica «Revisa tu correo» y, con el enlace, confirma la cuenta o avisa que el enlace venció.
4. **Celular.** La pantalla se abre en un celular. Cuando el visitante alterna entre «Ingresar» y «Crear cuenta». Las pestañas funcionan sin desplazamiento horizontal.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular                    | Ruta                                       |
| ---------------------- | ---------- | -------------------------- | ------------------------------------------ |
| 06 Ingreso y registro  | 2018:1261  | 2018:2508                  | `/registro` (página aparte de `/ingresar`) |
| Confirmación de correo | —          | revisa tu correo 2034:4841 | `/confirmar-correo?token=`                 |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `POST /api/cuentas/registro`, `POST /api/cuentas/confirmar-correo`.

Comprobado contra el backend local (26-10-2026): registro 201 `{ mensaje }`, 400 con `message`
como lista (validación) o texto («Las contraseñas no coinciden.»), 409 «El correo ya está
registrado.» / «El RUT ya está registrado.» / «El correo y el RUT ya están registrados.»;
confirmación 200 `{ mensaje }` o 400 «El enlace de confirmación no es válido o ya venció.». Las dos
rutas: 5/min por IP (429). Solo endpoints reales, sin rutas simuladas.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

- **Decidido en SCRUM-94:** el registro es una página aparte, `/registro`, aunque Figma muestre
  «Crear cuenta» junto a «Iniciar sesión». `/ingresar` ya enlaza aquí con «¿No tienes cuenta?
  Crear cuenta»; el registro debe enlazar de vuelta («¿Ya tienes cuenta? Ingresar»). Quita el
  `as Route` de `RUTAS.registro` en `tienda/diseno/enlaces.ts`. El criterio 4 (pestañas en el
  celular) queda en ver con el equipo: sin pestañas, se cubre con esos enlaces.

- **Decisiones (26-10-2026, con el usuario):**
  - **Casilla de ofertas:** se muestra desmarcada, pero no se envía: el DTO del registro no tiene
    el campo y el backend rechaza campos desconocidos (`forbidNonWhitelisted`).
  - **Género:** selector con Femenino, Masculino, Otro y Prefiero no decir (más «Seleccionar»
    vacío). Se envía el texto (el backend acepta texto libre de hasta 30).
  - **«Repite tu contraseña»:** campo agregado bajo «Contraseña» (Figma tiene uno solo; el DTO
    exige `confirmacionContrasena`).
  - **Celular (criterio 4):** pestañas-enlace «Ingresar | Crear cuenta» (`pestanasCuenta.tsx`)
    en `/ingresar` y `/registro`, solo bajo `md`; ahí el `h1` queda solo para lectores de
    pantalla. En escritorio se enlazan bajo el botón.
  - **Revisa tu correo:** reemplaza al formulario en `/registro` con el correo escrito (no va en
    la URL); el formulario queda montado para que «¿No es tu correo? Cambiarlo» vuelva con lo
    escrito. «Reenviar correo» no se muestra: no hay endpoint.
  - **`/confirmar-correo`:** envía el token una sola vez (un `useRef` evita el doble envío del
    modo estricto, que gastaría el enlace). Estados: confirmado (enlace a Ingresar, o al catálogo
    con sesión), «El enlace venció» (400) y «No pudimos confirmar tu correo» con reintento (429,
    5xx, sin conexión). Sin token, «Revisa tu correo» sin la dirección. `referrer: no-referrer` y
    `noindex` para que el token no salga de la página.
  - **«Datos opcionales»:** parte cerrado; se abre solo si el backend marca uno de esos campos.
  - Con sesión iniciada, `/registro` lleva a donde corresponde según el rol.
- **Errores junto a su campo:** el backend no dice a qué campo pertenece cada mensaje; se
  reconocen por cómo empiezan (`tienda/cuenta/erroresRegistro.ts`). Lo que no se reconoce va como
  aviso general.
- **Cambios compartidos:**
  - `compartido/ui/native-select.tsx` y `checkbox.tsx` adaptados al Campo y a la Casilla de
    Figma (51 px, borde de 1,5 px, texto cuerpo; casilla de 20 px con foco marca/profundo). Solo
    los usa el registro. `NativeSelect` acepta `contenedorClassName` (traía `w-fit` fijo).
  - `compartido/api/errores.ts`: un 429 con el texto por defecto de Nest («ThrottlerException:
    Too Many Requests», que da el `ThrottlerGuard` del registro y la confirmación) muestra el
    mensaje del estado en español. El 429 propio del inicio de sesión no cambia.
  - `vitest.setup.ts` simula `ResizeObserver` (lo usa el Checkbox de Radix y jsdom no lo trae);
    `MensajeApi` en `compartido/api/respuestas.ts`.
- **Seguridad (auditoría):** `/confirmar-correo` quita el token de la URL con `replaceState` en
  cuanto lo envía; al crear la cuenta se vacían las contraseñas del formulario oculto; la mutación
  del registro no queda en caché (`gcTime: 0`).
- **Preguntas abiertas para el equipo:**
  - Criterio 3, «cuando la persona vuelve a la tienda»: hoy no hay aviso si vuelve sin confirmar
    (no hay sesión hasta confirmar, y el inicio de sesión ya responde 403 con su mensaje).
  - Título «El enlace venció» para cualquier 400 (también enlace usado o inválido): no está en
    Figma; el detalle lo da el mensaje del backend.
- **Para el backend (SCRUM-19):**
  - Mensaje en español para el 429 del registro y la confirmación (hoy el de Nest, en inglés).
  - Agregar el consentimiento de ofertas al registro (p. ej. `aceptaOfertas: boolean`).
  - Ruta para reenviar el correo de confirmación (la pantalla tiene «Reenviar correo»).
  - Incluir el campo en los errores de validación y de 409, para no depender del texto.
  - Declarar `type: String` en los opcionales del DTO (en el Swagger salen como
    `Record<string, never>`) y las respuestas `{ mensaje }` (`@ApiCreatedResponse({ type })`).
- **Pendiente:** revisar en el navegador a 1440 y 360 px (sin navegador en la sesión). El
  formato (`pnpm format:check`) sigue fallando en archivos ajenos por los CRLF de
  `core.autocrlf=true` (ver SCRUM-94); los archivos de esta historia pasan.
