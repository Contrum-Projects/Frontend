import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';

/**
 * Nombre de cada estado del pedido para las personas: los de `ETIQUETAS_ESTADO` del backend
 * (`src/modulos/pedidos/transiciones-estado-pedido.ts`), con mayúscula inicial.
 */
const ETIQUETAS: Record<string, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  despachado: 'Despachado',
  entregado: 'Entregado',
  listo_para_retiro: 'Listo para retiro',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
};

/** Un estado que el frontend aún no conoce se muestra tal como llega, sin guiones bajos. */
export const etiquetaEstado = (estado: string): string =>
  ETIQUETAS[estado] ?? estado.replaceAll('_', ' ');

/** Los que ya no avanzan van en hueso, como en Figma (Entregado, Cancelado). */
const TERMINADOS = new Set(['entregado', 'retirado', 'cancelado']);

const tonoEstado = (estado: string): string => {
  if (estado === 'pendiente_pago')
    return 'bg-estado-aviso-fondo text-estado-aviso-texto';
  if (TERMINADOS.has(estado))
    return 'bg-fondo-hueso-oscuro text-texto-principal';
  return 'bg-marca-acento-suave text-marca-profundo';
};

/** Insignia del estado (Figma › 07 Mis pedidos › Estado). */
export const EstadoPedido = ({
  estado,
  className,
}: {
  estado: string;
  className?: string;
}) => (
  <Badge
    className={cn('px-2.5 py-1 texto-leyenda', tonoEstado(estado), className)}
  >
    {etiquetaEstado(estado)}
  </Badge>
);
