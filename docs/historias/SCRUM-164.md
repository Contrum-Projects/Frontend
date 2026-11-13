# SCRUM-164 · Panel: motivo «el nombre no calza con el SII» en la revisión de verificaciones

**Orden:** 56 de 56 · **Puntos:** sin estimar · **Historia backend:** SCRUM-163 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-135](SCRUM-135.md)  
**La necesitan después:** ninguna

Viene de la auditoría de seguridad del 12-11-2026. La aprobación automática solo revisaba que el RUT
tuviera el giro 960200 en el SII. Así, un cliente con el RUT de un peluquero real quedaba como
profesional. Con SCRUM-163, el nombre del contribuyente que entrega el SII también debe calzar con
el de la cuenta. Si no calza, la solicitud va a revisión con el motivo nuevo `nombre_no_coincide`.

## Criterios de aceptación

1. `MotivoRevisionVerificacion` incluye `nombre_no_coincide`.
2. **Revisión.** El detalle dice: «El SII muestra el giro de peluquería, pero el nombre del
   contribuyente no coincide con el de la cuenta. Revisa los documentos.»
3. **Pendientes.** La lista muestra el texto corto «Nombre no coincide».
4. **Mis datos.** El 403 al cambiar el nombre o el apellido (cuenta profesional o con una
   verificación en curso) se muestra con el mensaje del backend, sin perder lo escrito.

## API

Estado al 12-11-2026: **Sí** (SCRUM-163, rama `SCRUM-163-nombre-sii-verificacion` del backend). No
hay rutas nuevas: cambia el valor de `motivoRevision` en `GET /api/verificaciones/revision-manual`
y `GET /api/verificaciones/{codigoPublico}`, y `PATCH /api/mi-cuenta` puede responder 403 por el
nombre.
