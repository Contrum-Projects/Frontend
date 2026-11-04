# SCRUM-135 · E10-H3 · Panel de verificaciones: revisión manual

**Orden:** 43 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-64 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito revisar solicitudes desde el panel, con la finalidad de decidir quién accede al precio mayorista.

**Historia backend:** SCRUM-64 · **Figma:** P4 Verificación

## Criterios de aceptación

1. **Pendientes.** El personal abre «Verificaciones». Cuando carga. Ve la lista de pendientes y la revisión al lado (escritorio) o en una pantalla aparte (celular).
2. **Revisión.** El personal abre una solicitud. Cuando la revisa. Ve el motivo de revisión manual, los documentos con el texto leído y el puntaje frente al umbral.
   _Ajuste del 4-11-2026: el backend ya no tiene OCR ni puntaje (cambio del 2 nov). La revisión
   muestra el motivo, la consulta al SII (fecha y giros) y los documentos para abrir. Falta
   llevarlo a Jira._
3. **Resolver.** El personal decide. Cuando aprueba, o rechaza con un motivo obligatorio. La solicitud sale de la lista y la pantalla confirma la resolución.

## Pantalla y ruta

| Pantalla          | Escritorio | Celular  | Ruta                    |
| ----------------- | ---------- | -------- | ----------------------- |
| P4 Verificaciones | 2029:872   | 2025:481 | `/panel/verificaciones` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí** (SCRUM-64 y E10-H7). El
Swagger no declara las respuestas: los tipos están en `compartido/api/respuestas.ts`, copiados de
`consulta-verificacion.service.ts` y `revision-verificacion.service.ts` del backend.

| Uso                 | Endpoint                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Lista de pendientes | `GET /api/verificaciones/revision-manual?pagina=1&limite=100` → `{ items, total, pagina, limite }`                |
| Revisión            | `GET /api/verificaciones/{codigoPublico}` → cliente, solicitud (motivo, consulta al SII, documentos) y anteriores |
| Abrir documento     | `GET /api/verificaciones/{codigoPublico}/documentos/{numero}` → enlace firmado de 60 s; 410 si se eliminó         |
| Aprobar             | `POST /api/verificaciones/{codigoPublico}/aprobar` (sin cuerpo)                                                   |
| Rechazar            | `POST /api/verificaciones/{codigoPublico}/rechazar` con `{ motivo }` de 10 a 1000 caracteres                      |

Los dos `POST` responden 409 si la solicitud ya no está en revisión manual. Todo exige
`verificacion.gestionar` (solo administrador).

## Notas de trabajo

**Decisiones (4-11-2026, con el usuario):**

- **El criterio 2 cambió con el backend.** Desde el 2 nov ya no hay OCR ni puntaje de confianza
  (reglas de negocio, E10): la solicitud va a revisión manual porque la consulta al SII no la
  aprobó. La revisión muestra el motivo, la consulta al SII (fecha y giros) y los documentos con
  «Abrir». No hay «texto leído» ni barra de puntaje, aunque Figma (2029:872 y 2025:481) todavía
  los dibuja. Tampoco la vista previa de cada documento: el archivo solo se abre con un enlace que
  vence.
- **Textos del motivo:** `sin_inicio_actividades` «El SII no muestra inicio de actividades para
  este RUT.», `otro_giro` «El SII no muestra el giro de peluquería (960200) para este RUT.»,
  `no_disponible` «No se pudo consultar al SII. Revisa los documentos.» y sin consulta «Esta
  solicitud no se consultó al SII.» (`panel/verificaciones/textosVerificacion.ts`).
- **Lista:** bajo el nombre va «fecha · motivo», porque la lista del backend no trae cuántos
  documentos tiene cada solicitud (Figma dice «· 2 documentos»).
- **Resolver:** aprobar no pide confirmación (como Figma). Al resolver, el formulario se cambia
  por un aviso («Aprobaste la solicitud de… Ya tiene la cuenta profesional.» / «Rechazaste la
  solicitud de… Verá tu motivo en su cuenta.») y la lista se vuelve a pedir. Un 409 (otra persona
  la resolvió) se avisa con un toast y la revisión muestra quién la resolvió.
- **Documentos:** la pestaña se abre en el mismo clic y recibe el enlace cuando llega (si se
  abriera después, el navegador la bloquearía); se le quita `opener`. Si el backend no da el
  enlace, se cierra y se muestra su mensaje.
- Las solicitudes anteriores de la cuenta (`solicitudesAnteriores`) no se muestran: ni la historia
  ni Figma las piden.

**Para el backend (SCRUM-64 / E10-H7):**

- Declarar en el Swagger las respuestas de los cinco endpoints (hoy `content?: never`).
- Si el equipo quiere el conteo de Figma en la lista, agregar la cantidad de documentos a
  `SolicitudEnRevision`.

**Para Figma:** actualizar P4 Verificaciones al flujo con el SII (sin texto leído ni puntaje).

**Pregunta abierta:** la lista pide los primeros 100 (máximo del backend). Con más, avisa «Se
muestran 100 de N solicitudes». ¿Basta o hace falta paginar?

**Pendiente:** probar la pantalla con el backend real (cuenta de administrador y una solicitud en
revisión manual) a 1440 y 360 px.
