/**
 * Errores del servidor de Next (render de Server Components, route handlers y acciones), que
 * llegan por `onRequestError` de `instrumentation.ts` (SCRUM-168). Quedan en el log del servidor
 * y en `registro_error` del backend, con el `digest` como código: el mismo que ve la persona en
 * la pantalla de error.
 */
import 'server-only';
import type { Instrumentation } from 'next';
import { apiServidor } from '@/compartido/api/servidor';
import {
  codigoValido,
  datosDelError,
  digestDe,
  rutaSinQuery,
} from './datosDelError';

type Parametros = Parameters<Instrumentation.onRequestError>;

export async function reportarErrorDelServidor(
  error: Parametros[0],
  peticion: Parametros[1],
  contexto: Parametros[2],
): Promise<void> {
  const datos = datosDelError(error);
  const ruta = rutaSinQuery(peticion.path);
  const componente = `${contexto.routeType} ${contexto.routePath}`;
  const encabezado = peticion.headers['x-request-id'];
  const codigoSeguimiento =
    digestDe(error) ??
    codigoValido(Array.isArray(encabezado) ? encabezado[0] : encabezado);

  console.error(
    JSON.stringify({
      nivel: 'error',
      registro: 'servidor_web',
      codigoSeguimiento,
      componente,
      metodo: peticion.method,
      ruta,
      tipoError: datos.tipoError,
      mensaje: datos.mensaje,
    }),
  );

  try {
    await apiServidor().POST('/api/registros/errores-cliente', {
      body: {
        origen: 'servidor_web',
        componente: componente.slice(0, 150),
        ruta,
        ...datos,
        codigoSeguimiento,
      },
    });
  } catch {
    // Sin backend no hay dónde guardarlo: ya quedó en el log del servidor
  }
}
