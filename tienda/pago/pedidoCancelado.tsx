import { ClockIcon } from 'lucide-react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { AccionesResultado, EnlaceResultado } from './accionesResultado';
import { EncabezadoResultado } from './encabezadoResultado';

/**
 * E6-H2, criterio 3 · «Tu pedido se canceló» (Figma › 09 Resultado del pago, celular
 * 2034:4725). El backend no dice por qué se canceló (venció el plazo o lo canceló la tienda,
 * E8-H3), así que el texto no nombra los 15 minutos (decisión del 03-11-2026).
 */
export const PedidoCancelado = ({
  pedido,
}: {
  pedido: DetallePedidoCuenta;
}) => (
  <div className="flex flex-col items-start gap-4 md:gap-6">
    <EncabezadoResultado
      tono="neutro"
      icono={<ClockIcon aria-hidden className="size-6.5" strokeWidth={1.75} />}
      titulo="Tu pedido se canceló"
    >
      El pedido {pedido.codigoPublico} se canceló porque el pago no se completó
      a tiempo. Si aún quieres los productos, puedes volver a comprarlos.
    </EncabezadoResultado>
    <AccionesResultado>
      <EnlaceResultado href={RUTAS.catalogo}>Ir al catálogo</EnlaceResultado>
      <EnlaceResultado href={RUTAS.misPedidos} contorno>
        Ver mis pedidos
      </EnlaceResultado>
    </AccionesResultado>
  </div>
);
