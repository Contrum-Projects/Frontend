# SCRUM-168 · Registro de errores: qué pasó, cuándo y en qué componente

**Orden:** 58 de 58 · **Puntos:** sin estimar · **Historia backend:** SCRUM-168 (la misma) · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** ninguna

Observación de la presentación del proyecto (19-11-2026): además de avisar a la persona que una
acción falló, el sistema debe dejar un registro de errores con qué pasó, cuándo y en qué componente.

## Criterios de aceptación (frontend)

3. **Errores de la pantalla.** Un error de una pantalla se registra en el backend con origen
   «navegador» y la ruta de la pantalla (sin la query). Los errores del servidor de Next se
   registran con origen «servidor_web» y su `digest`, y no se reportan dos veces.
4. **Código de seguimiento.** La pantalla de error y los mensajes de un 5xx muestran el código
   corto (8 caracteres) para que la persona lo informe. Nunca muestran el detalle técnico.
5. **Panel.** El administrador ve el registro en `/panel/registro-errores`: cuándo, dónde, qué
   pasó, el origen y el código. Puede buscar por código, componente o mensaje, filtrar por origen
   y fechas, y abrir el detalle con la ruta, la cuenta y la traza.

Los criterios 1, 2, 4 y 5 son del backend (ver Jira).

## API

Estado al 20-11-2026 (`pnpm api:tipos` contra la rama `SCRUM-168-registro-errores` del backend):
**Sí**. `POST /api/registros/errores-cliente` (pública, 30/min por IP) y `GET /api/registros/errores`
(permiso `registro_errores.ver`). Los 5xx traen `codigoSeguimiento` en el cuerpo y todas las
respuestas, la cabecera `x-request-id`.

## Notas de trabajo

- 20-11-2026: rama `SCRUM-168-registro-errores`, sin Figma (patrón de Clientes e Inventario). PR
  del backend: https://github.com/Contrum-Projects/Backend/pull/91 (se integra primero).
