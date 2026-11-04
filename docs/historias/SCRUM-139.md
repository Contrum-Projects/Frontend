# SCRUM-139 · E12-H2 · Pantalla Ofertas por correo y baja

**Orden:** 47 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-69 · **API:** No

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito elegir si recibo publicidad y darme de baja, con la finalidad de controlar lo que la tienda me envía.

**Historia backend:** SCRUM-69 · **Figma:** 10c Ofertas por correo

## Criterios de aceptación

1. **Interruptor.** El cliente abre «Ofertas por correo». Cuando activa o desactiva la opción. La pantalla muestra el estado con la fecha del consentimiento y qué incluye (campañas, cumpleaños, recordatorios de carrito).
2. **Correo sin verificar.** La cuenta no verificó su correo. Cuando abre la pantalla. Se explica que debe verificarlo para recibir ofertas.
3. **Baja desde un correo.** La persona abre el enlace de baja. Cuando se carga. La pantalla confirma que no recibirá más publicidad en esa dirección.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                                                            |
| ---------------------- | ---------- | --------- | --------------------------------------------------------------- |
| 10c Ofertas por correo | 2066:3690  | 2070:2703 | `/cuenta/ofertas`; baja desde el correo: `/ofertas/baja?token=` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 4-11-2026 (`compartido/api/esquema.d.ts` regenerado desde el backend local): **No**.
SCRUM-69 no tiene endpoints ni rama en el backend. Se trabaja con la **API simulada**
(`compartido/api/simulado/ofertas.ts`). Esta forma es una propuesta para quien haga SCRUM-69
(aprobada por el usuario el 4-11-2026, falta confirmarla con el backend):

- `GET /api/cuentas/yo/ofertas` → 200 `PreferenciaOfertas`
  `{ activa: boolean, fechaConsentimiento: string | null, email: string, correoVerificado: boolean }`
  (sale de `Usuario.aceptaMarketingEmail`, `fechaConsentimientoMarketing` y
  `fechaVerificacionCorreo`). 401 sin sesión, 403 personal de tienda.
- `PUT /api/cuentas/yo/ofertas` `{ activa: boolean }` → 200 `PreferenciaOfertas`, con la fecha
  del consentimiento que fija el backend. 400 cuerpo inválido; 409 `{ message }` si se intenta
  activar sin el correo verificado.
- `POST /api/marketing/bajas` `{ token }` → 200 `{ mensaje }`. Es pública y el token va firmado
  (RNF-08). Da de baja la **dirección** (LEAD y la cuenta con ese correo). 400 si el enlace no es
  válido; 429 por límite.
- Los correos de ofertas enlazan a `/ofertas/baja?token=`.

## Notas de trabajo

**4-11-2026**

- **Pantalla `/cuenta/ofertas`** (Figma 2066:3690 y 2070:2703) en `tienda/ofertas/pantallaOfertasCorreo.tsx`
  y `tarjetaOfertas.tsx`. El interruptor guarda al tocarlo porque Figma no tiene botón «Guardar».
  Mientras guarda, muestra lo pedido; si el backend rechaza el cambio, vuelve a lo guardado y
  muestra el mensaje. La fecha «Activado el …» viene del backend, el frontend no la calcula.
- **Textos sin diseño** (aprobados por el usuario): desactivado «No recibes ofertas por correo.»;
  sin verificar, el aviso «Verifica tu correo para recibir ofertas. Te enviamos un enlace cuando
  creaste tu cuenta.» con el interruptor deshabilitado. Si ya estaba activa, se puede desactivar.
- **Correo sin verificar (criterio 2):** hoy el backend no deja iniciar sesión sin el correo
  confirmado (`sesion.service.ts`), así que ese estado no se da con sesión. Se implementa según
  `correoVerificado` y está cubierto por las pruebas.
- **Baja `/ofertas/baja?token=`:** sin diseño en Figma. Reusa la tarjeta de la confirmación de
  la suscripción (SCRUM-138): «Te diste de baja» / mensaje del backend / «Volver a la tienda»;
  400 «El enlace no es válido»; otros errores «No pudimos darte de baja» / «Intentar de nuevo».
  El token se envía una vez y se quita de la URL; la página va con `no-referrer` y `noindex`.
- **API simulada:** en el navegador siempre responde «activa y verificada». El token `invalido`
  responde 400. El PUT devuelve lo pedido sin guardarlo. Los estados sin verificar y los errores
  solo se ven en las pruebas.
- **Para el backend (SCRUM-69):** implementar los tres endpoints con la forma de arriba,
  declarar sus respuestas en el Swagger y usar el enlace `/ofertas/baja?token=` en los correos.
  Luego, borrar `compartido/api/simulado/ofertas.ts`, el tipo `PreferenciaOfertas` y los casts
  `TODO(SCRUM-69)` de `consultasOfertas.ts`.
- **Revisión (diseño, criterios y seguridad):**
  - El interruptor describe el aviso y el error. El aviso fijo va con `role="note"`. Mientras
    guarda, el estado dice «Guardando…».
  - El esqueleto reserva el alto de la tarjeta a 360 px.
  - `Referrer-Policy: no-referrer` se envía como cabecera HTTP en `/ofertas/baja` y en
    `/suscripcion/confirmar` (`next.config.ts`).
  - La ruta simulada responde 401 sin sesión y 409 si se activa sin el correo verificado.
- **Preguntas abiertas:**
  - La baja se envía sola al cargar, como pide el criterio 3. Los analizadores de enlaces del
    correo (Safe Links y similares) podrían dar de baja a alguien sin que lo pida. ¿Se deja así,
    se agrega un botón «Confirmar baja» o el backend agrega la baja en un clic (RFC 8058)?
  - En celular el menú del header no enlaza «Ofertas por correo» (tampoco Facturación ni
    Verificación; ya pasaba antes). Queda fuera de esta historia.
