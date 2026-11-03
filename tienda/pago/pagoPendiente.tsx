import { ClockIcon } from 'lucide-react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { AccionesResultado, EnlaceResultado } from './accionesResultado';
import { EncabezadoResultado } from './encabezadoResultado';

/**
 * E6-H2, criterio 2 · El pago aún no se confirma (sin diseño en Figma; texto acordado el
 * 03-11-2026, sin nombrar a Mercado Pago como pide docs/diseno.md). La pantalla relee el pedido y cambia sola cuando llega la confirmación. No
 * ofrece pagar de nuevo: el pago en proceso podría aprobarse y sería un segundo cargo. Si leer
 * el pedido falla, muestra el mensaje del backend y «Reintentar».
 */
export const PagoPendiente = ({
  pedido,
  error,
  onReintentar,
}: {
  pedido: DetallePedidoCuenta;
  /** Mensaje del backend si falló la lectura del pedido: el seguimiento se detuvo. */
  error?: string;
  onReintentar: () => void;
}) => (
  <div className="flex flex-col items-start gap-4 md:gap-6">
    <EncabezadoResultado
      tono="neutro"
      icono={<ClockIcon aria-hidden className="size-6.5" strokeWidth={1.75} />}
      titulo="Estamos confirmando tu pago"
    >
      Aún no se confirma el pago del pedido {pedido.codigoPublico}.
      {/* Con el seguimiento detenido por un error, ya no se actualiza sola */}
      {!error && ' Esta pantalla se actualiza sola cuando llegue.'}
    </EncabezadoResultado>
    {error && <ErrorProfesional mensaje={error} onReintentar={onReintentar} />}
    <AccionesResultado>
      <EnlaceResultado href={RUTAS.misPedidos}>Ver mis pedidos</EnlaceResultado>
      <EnlaceResultado href={RUTAS.catalogo} contorno>
        Seguir comprando
      </EnlaceResultado>
    </AccionesResultado>
  </div>
);
