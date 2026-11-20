import type { Instrumentation } from 'next';

/**
 * Registro de los errores del servidor de Next (SCRUM-168). Solo en Node: el reporte usa el
 * cliente del servidor, que no corre en el runtime Edge.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  peticion,
  contexto,
) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { reportarErrorDelServidor } =
    await import('@/compartido/errores/reporteServidor');
  await reportarErrorDelServidor(error, peticion, contexto);
};
