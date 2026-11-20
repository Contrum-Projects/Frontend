/**
 * Informa al backend un error de una pantalla (SCRUM-168): queda en `registro_error` con qué
 * pasó, cuándo y en qué pantalla. Si falla el reporte no pasa nada: nunca lanza.
 */
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi } from '@/compartido/api/errores';
import { datosDelError, rutaSinQuery } from './datosDelError';

export interface ReporteDeError {
  /** Dónde ocurrió: la pantalla (`pantalla /panel/pedidos`) o la pieza que falló. */
  componente: string;
  error: unknown;
  ruta?: string;
}

/** Devuelve el código con que quedó registrado, o `undefined` si no se pudo registrar. */
export const reportarError = async ({
  componente,
  error,
  ruta,
}: ReporteDeError): Promise<string | undefined> => {
  try {
    const { data } = await api.POST('/api/registros/errores-cliente', {
      body: {
        origen: 'navegador',
        componente: componente.slice(0, 150),
        ...datosDelError(error),
        ruta: ruta ? rutaSinQuery(ruta) : undefined,
        // Un 5xx de la API ya quedó registrado allá: se une con el mismo código
        codigoSeguimiento:
          error instanceof ErrorDeApi ? error.codigoSeguimiento : undefined,
      },
    });
    return data?.codigoSeguimiento;
  } catch {
    return undefined;
  }
};
