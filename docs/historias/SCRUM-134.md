# SCRUM-134 · E10-H1 · Formulario y estados de la verificación profesional

**Orden:** 42 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-62 · **API:** No

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** [SCRUM-136](SCRUM-136.md)

Como un Cliente, necesito solicitar mi verificación y ver su estado, con la finalidad de acceder al precio mayorista.

**Historia backend:** SCRUM-62 (también muestra el resultado de SCRUM-63) · **Figma:** 08 Verificación profesional

## Criterios de aceptación

1. **Formulario.** El cliente abre «Verificación profesional». Cuando ingresa su RUT y adjunta uno o más documentos. Se envía la solicitud y la pantalla muestra «En revisión».
2. **Sin RUT.** La cuenta no tiene RUT. Cuando intenta enviar. La pantalla le pide registrarlo.
3. **Rechazada.** La solicitud fue rechazada. Cuando el cliente abre la pantalla. Ve el motivo y puede enviar una nueva solicitud.
4. **Archivos.** El cliente envía documentos. Cuando la pantalla los pide. Informa que los archivos se borran a los 30 días de resuelta la solicitud.

## Pantalla y ruta

| Pantalla                    | Escritorio                      | Celular                         | Ruta                   |
| --------------------------- | ------------------------------- | ------------------------------- | ---------------------- |
| 08 Verificación profesional | 2020:1666 · rechazada 2038:2518 | 2020:3006 · rechazada 2038:5337 | `/cuenta/verificacion` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026: **Sí**. Integrado en el backend (SCRUM-62, SCRUM-63 y SCRUM-65), sin rutas
simuladas:

- `GET /api/verificaciones/yo`: la solicitud más reciente; 404 si la cuenta nunca solicitó.
- `POST /api/verificaciones` (sin cuerpo): consulta en el SII el RUT **de la cuenta**. Con el giro
  960200 queda `aprobada` y la cuenta pasa a profesional; si no, `pendiente` con
  `requiereDocumentos`. 409 sin RUT, ya profesional o con una solicitud abierta.
- `POST /api/verificaciones/yo/documentos` (multipart): 1 a 5 `archivos` (PDF, JPG o PNG de hasta
  5 MB) y un `tipos` por archivo (`titulo`, `certificado`, `otro`). Pasa a `revision_manual`.
- Tras la aprobación, `POST /api/cuentas/sesion/renovar` entrega el token con el rol profesional.

El Swagger no declara las respuestas: `SolicitudVerificacionCuenta` está en
`compartido/api/respuestas.ts`, copiada de `solicitud-verificacion.service.ts`.

## Notas de trabajo

**Decisiones (04-11-2026, con el usuario):**

- **Un botón, dos llamadas.** La pantalla se ve como en Figma (RUT + documentos + «Enviar
  solicitud»). Al enviar, primero `POST /verificaciones`. Si el SII aprueba, los documentos no se
  suben, se renueva la sesión y se muestra la cuenta profesional; si queda `pendiente`, se adjuntan
  los documentos. Si la subida falla, la solicitud queda `pendiente`: la pantalla lo informa, no
  pierde los archivos y el siguiente envío solo adjunta los documentos.
- **Tipo de cada documento:** un Select por archivo («Título», «Certificado o curso», «Otro»), que
  Figma no tiene y el backend exige.
- **RUT:** no se escribe en esta pantalla. La tarjeta «RUT de tu cuenta» enlaza a Mis datos («Editar»
  o «Registrar RUT»); con la solicitud abierta no tiene enlace, porque el backend no deja cambiarlo.
- **Aprobada** (sin Figma): «Tu cuenta profesional está activa» (asunto del correo de E10-H4),
  «Ya ves los precios profesionales en la tienda.» y «Ver precios profesionales» → `/catalogo`.
- **Pendiente de documentos** (sin Figma): aviso «No pudimos verificarte con el SII. Sube tus
  documentos y el equipo de la tienda revisará tu solicitud.».
- **En revisión:** «La recibimos el … El equipo de la tienda revisará tus documentos y aquí verás el
  resultado.». No se promete aviso por correo, como en Figma, porque el backend solo avisa la
  aprobación. Los documentos enviados muestran su tipo en vez del tamaño (la API no lo entrega).
- **Rechazada:** se omite la tarjeta «Solicitudes anteriores» de Figma: la API solo entrega la
  solicitud más reciente.

**Para el backend (SCRUM-62/63):** declarar en el Swagger la respuesta `SolicitudVerificacionCuenta`
de las tres rutas. Si el equipo quiere el historial de Figma, haría falta una ruta con las
solicitudes anteriores.
