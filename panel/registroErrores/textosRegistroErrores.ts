import type { OrigenError } from './consultasRegistroErrores';

/** Cómo se nombra cada origen en el panel (SCRUM-168, `ORIGENES_ERROR` del backend). */
export const NOMBRE_ORIGEN: Record<OrigenError, string> = {
  api: 'Backend',
  navegador: 'Navegador',
  servidor_web: 'Servidor de la tienda',
};
