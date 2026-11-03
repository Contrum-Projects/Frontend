import { ClockIcon } from 'lucide-react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { AccionesResultado, EnlaceResultado } from './accionesResultado';
import { EncabezadoResultado } from './encabezadoResultado';

/**
 * E6-H2, criterio 2 · Mercado Pago aún no confirma el pago (sin diseño en Figma; texto acordado
 * el 03-11-2026). La pantalla relee el pedido y cambia sola cuando llega la confirmación. No
 * ofrece pagar de nuevo: el pago en proceso podría aprobarse y sería un segundo cargo.
 */
export const PagoPendiente = ({ pedido }: { pedido: DetallePedidoCuenta }) => (
  <div className="flex flex-col items-start gap-4 md:gap-6">
    <EncabezadoResultado
      tono="neutro"
      icono={<ClockIcon aria-hidden className="size-6.5" strokeWidth={1.75} />}
      titulo="Estamos confirmando tu pago"
    >
      Mercado Pago aún no confirma el pago del pedido {pedido.codigoPublico}.
      Esta pantalla se actualiza sola cuando llegue.
    </EncabezadoResultado>
    <AccionesResultado>
      <EnlaceResultado href={RUTAS.misPedidos}>Ver mis pedidos</EnlaceResultado>
      <EnlaceResultado href={RUTAS.catalogo} contorno>
        Seguir comprando
      </EnlaceResultado>
    </AccionesResultado>
  </div>
);
