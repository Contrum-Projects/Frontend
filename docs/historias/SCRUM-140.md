# SCRUM-140 · E12-H3 · Panel de campañas: redactar, segmentar y enviar

**Orden:** 48 de 53 · **Puntos:** 8 · **Historia backend:** SCRUM-70 · **API:** No

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-141](SCRUM-141.md)

Como Personal de tienda, necesito crear y enviar campañas desde el panel, con la finalidad de promocionar productos a quienes les interesan.

**Historia backend:** SCRUM-70 · **Figma:** P7 Campañas, P7a Nueva campaña, P7b Confirmar envío

## Criterios de aceptación

1. **Listado.** El personal abre «Campañas». Cuando carga. Ve la lista de contactos con consentimiento, las campañas con segmento, destinatarios, estado y apertura.
2. **Redactar.** El personal escribe asunto y mensaje y elige el segmento. Cuando usa la vista previa (al lado en escritorio, en pestañas en celular). Ve el correo con remitente y enlace de baja y el conteo de destinatarios con consentimiento.
3. **Confirmar envío.** La campaña está lista. Cuando el personal pulsa enviar. Una ventana pide confirmar con el número de destinatarios y avisa que se envía una sola vez.

## Pantalla y ruta

| Pantalla                                | Escritorio                        | Celular               | Ruta                                       |
| --------------------------------------- | --------------------------------- | --------------------- | ------------------------------------------ |
| P7 Campañas · P7a Nueva · P7b Confirmar | 2045:1569 · 2046:1646 · 2046:1846 | 2047:1225 · 2047:1323 | `/panel/campanas`, `/panel/campanas/nueva` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 4-11-2026: **No**. El backend no tiene campañas (no hay endpoint, ni rama de SCRUM-70;
`src/modulos/marketing/` solo tiene suscripciones). Se avanza con la **API simulada**
(`compartido/api/simulado/panelCampanas.ts`) y la forma de abajo, **propuesta a SCRUM-70**
(4-11-2026, por acordar con quien hace la historia backend). Tipos en `compartido/api/respuestas.ts`.
Todas piden `campanas.gestionar` (solo administrador): sin sesión 401, otro rol 403.

| Método y ruta                               | Cuerpo                         | Respuesta                                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/gestion/campanas`                 | —                              | `{ contactos: { aceptanPublicidad, cuentasVerificadas, suscriptoresSinCuenta, conRebote }, campanas: [{ codigo, asunto, segmento (texto), destinatarios, estado, fechaEdicion, fechaEnvio, porcentajeApertura }] }` |
| `GET /api/gestion/campanas/segmentos`       | —                              | `{ tipos: [{ valor, texto, criterios: [{ clave, texto, opciones: [{ valor, texto }] }] }] }`                                                                                                                        |
| `POST /api/gestion/campanas/vista-previa`   | `{ asunto, cuerpo, segmento }` | `{ remitente, asunto, parrafos[], pie, textoBaja, destinatarios, segmento (texto) }`                                                                                                                                |
| `POST /api/gestion/campanas`                | `{ asunto, cuerpo, segmento }` | 201 `{ codigo, asunto, cuerpo, segmento, estado: 'borrador', fechaEdicion, fechaEnvio: null }`; 400 con un mensaje por campo                                                                                        |
| `GET /api/gestion/campanas/{codigo}`        | —                              | La campaña como en POST; 404 si no existe                                                                                                                                                                           |
| `PUT /api/gestion/campanas/{codigo}`        | `{ asunto, cuerpo, segmento }` | Igual que POST (200); 409 si ya se envió                                                                                                                                                                            |
| `POST /api/gestion/campanas/{codigo}/envio` | —                              | 202 `{ codigo, estado: 'enviada', destinatarios, fechaEnvio }`; 409 si ya se envió                                                                                                                                  |

- `segmento` = `{ tipo, criterios: [{ clave, valor }] }`, con un valor por criterio como máximo.
- `estado`: `borrador` | `enviada` (Figma solo dibuja esos dos). `porcentajeApertura` 0 a 100,
  `null` en un borrador. `codigo` no correlativo (va en la URL).
- `cuerpo` es **texto simple**: párrafos separados por una línea en blanco y `{nombre}`. El backend
  arma la vista previa (reemplaza `{nombre}` por un nombre de ejemplo) y el correo real.
- El backend cuenta los destinatarios con consentimiento (cuenta activa con correo verificado o
  suscriptor confirmado) y vuelve a revisarlo al enviar; la campaña sale una vez y llega una vez a
  cada dirección. Remitente y texto del enlace de baja salen de él (RNF-26).

## Notas de trabajo

**4-11-2026 (rama `SCRUM-140-panel-campanas`).**

- Pantallas: `/panel/campanas` (P7), `/panel/campanas/nueva` (P7a) y `/panel/campanas/[codigo]`
  para seguir editando un borrador (la fila de un borrador lo abre; una enviada no tiene detalle,
  Figma no dibuja esa pantalla). Confirmar envío (P7b) es un `AlertDialog`.
- Decisiones con el usuario: API simulada con la forma de arriba; los segmentos vienen del
  backend (la simulación usa Todos / Clientes / Profesionales y especialidad con la propuesta del
  4-11-2026, por validar); cuerpo en texto simple, **sin la barra de formato** de Figma (B, I,
  Título, Enlace, Imagen, Producto, Botón), que necesitaría un editor enriquecido; «Guardar
  borrador» incluido.
- «Revisar y enviar» guarda el borrador (POST o PUT) y abre la confirmación con el número que
  devuelve la vista previa para esos datos exactos. Con 0 destinatarios no deja enviar. Un 409 al
  enviar avisa y vuelve al listado.
- La vista previa se pide al backend 400 ms después de dejar de escribir y se muestra como texto
  (sin HTML crudo). El ancho Escritorio/Celular de la vista previa solo cambia el ancho del marco.
- Celular: pestañas «Editar / Vista previa» (las dos quedan montadas, no se pierde lo escrito);
  los contadores de contactos también se muestran (el criterio 1 los pide; Figma celular no los
  dibuja). «Guardar borrador» también en celular.
- La tarjeta «Saludo de cumpleaños» de P7 queda para SCRUM-141.

- Revisiones (4-11-2026): seguridad sin hallazgos que bloqueen; criterios cumplidos; diseño
  revisado solo contra el código (el revisor no tuvo acceso a Figma). Se corrigieron: aviso de
  envío único con `Alert` de aviso, orden de foco de los botones en celular, área táctil de
  «quitar criterio», radios con tokens y esqueletos con las medidas del contenido.
- Enter en un campo no envía ni abre la confirmación: enviar siempre pasa por el botón.

**Pendientes / para el backend (SCRUM-70):**

- El backend garantiza que la campaña sale una sola vez (atómico e idempotente) y vuelve a
  revisar el consentimiento al enviar, sin confiar en el número de la vista previa.
- Exigir `campanas.gestionar` en las 7 rutas, también `segmentos` y `vista-previa`.
- Ojalá un campo o código en los errores 400 (hoy el frontend ubica el mensaje por sus palabras).

- Acordar la forma de la API de arriba y los largos máximos de asunto y cuerpo (el frontend solo
  exige que no estén vacíos y muestra el 400 del backend junto al campo).
- Definir los segmentos (qué tipos y criterios) y si un criterio admite varios valores; está
  pendiente en `docs/diseno.md`.
- Si se quiere el formato enriquecido de Figma, definir un formato estructurado (no HTML) y su
  validación en el backend; sería otra historia o un cambio a esta.
- Hecha solo cuando se pruebe con el backend real y se borren las rutas simuladas.
