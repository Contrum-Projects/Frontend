# SCRUM-138 · E12-H1 · Formulario de suscripción a ofertas

**Orden:** 46 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-68 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** ninguna

Como un Visitante, necesito suscribirme a las ofertas desde el sitio, con la finalidad de enterarme de las promociones.

**Historia backend:** SCRUM-68 · **Figma:** footer de la tienda

## Criterios de aceptación

1. **Suscribirse.** El visitante ingresa su correo. Cuando envía. La pantalla indica que debe confirmar desde el correo.
2. **Confirmación.** El visitante abre el enlace del correo. Cuando se carga. La pantalla confirma la suscripción.
3. **Exceso de solicitudes.** El servidor rechaza por límite. Cuando el visitante intenta otra vez. La pantalla pide esperar un momento.

## Pantalla y ruta

| Pantalla              | Escritorio     | Celular | Ruta                  |
| --------------------- | -------------- | ------- | --------------------- |
| Suscripción a ofertas | (en el footer) | —       | componente del footer |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 4-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. Sin rutas simuladas.

- `POST /api/marketing/suscripciones` `{ email }` → 202 `{ mensaje }` (el mismo para todo
  correo válido). 400 correo inválido, 429 más de 5 por minuto por IP.
- `POST /api/marketing/suscripciones/confirmar` `{ token }` → 200 `{ mensaje }`. 400 enlace
  inválido, vencido o anterior a una baja; 429 igual que arriba.
- El correo de confirmación enlaza a `/suscripcion/confirmar?token=` (backend:
  `src/modulos/marketing/firma-suscripcion.ts`).

## Notas de trabajo

PR: https://github.com/Contrum-Projects/Frontend/pull/61

**4-11-2026**

- **Ruta de confirmación:** `/suscripcion/confirmar?token=`, la que propuso el backend
  (confirmado con el equipo). El backend puede quitar el «PROPUESTA por confirmar» del
  comentario en `firma-suscripcion.ts`.
- **Footer:** el bloque «Newsletter» (Figma 6:153 y 6:204) en `tienda/ofertas/suscripcionOfertas.tsx`.
  Al enviar, el formulario se reemplaza por el mensaje del backend. El 400 va junto al campo y
  el 429 se muestra como aviso, sin perder lo escrito. La etiqueta «Correo electrónico» es
  `sr-only` porque Figma solo muestra el placeholder. En escritorio la fila usa `flex-wrap`:
  si no cabe, la suscripción baja.
- **Huecos del footer:** a 1440 la suscripción no cabía junto a los enlaces con huecos de 64.
  Se bajaron a 48 (`md:gap-12`; Figma usa 56, que no está en la escala). Con `md:min-w-64` y
  `md:max-w-md`, si baja de fila en pantallas angostas no se estira a todo el ancho.
- **Foco:** al enviar desaparece el botón, así que el foco pasa al mensaje. El botón acento
  usa un anillo `marca/logo` con separación, porque el anillo acento no se veía.
- **Contraste:** sobre `marca/profundo` el rojo de error no se lee, así que el error del campo
  usa texto claro con ícono `marca/logo`. El texto del campo queda en 16 px, aunque Figma usa
  14, para que iOS no haga zoom.
- **Página de confirmación:** no tiene diseño en Figma. Reusa la tarjeta de «Correo
  confirmado» con los textos acordados: «Suscripción confirmada» / «Ver el catálogo», «El
  enlace venció» / «Volver a la tienda», «No pudimos confirmar tu suscripción» / «Intentar de
  nuevo». Sin token muestra «El enlace venció». El token se envía una vez y se quita de la URL;
  la página va con `no-referrer` y `noindex`.
- **Para el backend (SCRUM-68):** el Swagger no declara el cuerpo `{ mensaje }` del 202 ni del 200. Mientras tanto se usa `MensajeApi` con `TODO(SCRUM-68)`.
- Probado contra el backend local: 400, 202 y 400 del enlace. El 429 está cubierto solo por
  las pruebas.
