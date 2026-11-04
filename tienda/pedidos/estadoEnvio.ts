/**
 * Nombre de cada estado del envío para las personas (E7-H3): los de `ESTADOS_ENVIO` del backend
 * (`src/common/dominio/valores.ts`), con mayúscula inicial.
 */
const ETIQUETAS_ENVIO: Record<string, string> = {
  pendiente: 'Pendiente',
  en_transito: 'En tránsito',
  en_reparto: 'En reparto',
  entregado: 'Entregado',
  con_problema: 'Con problema',
};

/** Un estado que el frontend aún no conoce se muestra tal como llega, sin guiones bajos. */
export const etiquetaEnvio = (estado: string): string =>
  ETIQUETAS_ENVIO[estado] ?? estado.replaceAll('_', ' ');
