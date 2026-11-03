'use client';

import { ClockIcon, XIcon } from 'lucide-react';
import { ErrorDeApi } from '@/compartido/api/errores';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { formatearHora } from '@/compartido/formato/fecha';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { AccionesResultado, EnlaceResultado } from './accionesResultado';
import { useReintentarPago } from './consultasPago';
import { EncabezadoResultado } from './encabezadoResultado';

/**
 * E6-H1, criterio 2 · «El pago no se completó» (Figma › 09 Resultado del pago, celular
 * 2034:4663): el pago fue rechazado o el comprador volvió sin pagar. Muestra la hora límite de la
 * reserva que entrega el backend y permite pagar otra vez el mismo pedido.
 */
export const PagoNoCompletado = ({
  pedido,
  rechazado,
  aviso,
  onPedidoCambio,
}: {
  pedido: DetallePedidoCuenta;
  /** Mercado Pago rechazó el pago (lo confirmó el backend): solo entonces no hubo cargo. */
  rechazado: boolean;
  /** Mensaje del backend cuando el pago no corresponde al pedido (400). */
  aviso?: string;
  /** El backend dijo que el pedido ya no se puede pagar (pagado, cancelado, vencido): se relee. */
  onPedidoCambio: () => void;
}) => {
  const reintento = useReintentarPago(pedido.codigoPublico);
  const error = reintento.error;
  // Tras el cobro se sale a Mercado Pago: el botón sigue deshabilitado hasta irse
  const yendoAPagar = reintento.isPending || reintento.isSuccess;

  const reintentar = () =>
    reintento.mutate(undefined, {
      onError: (falla) => {
        if (falla instanceof ErrorDeApi && falla.estado === 409)
          onPedidoCambio();
      },
    });

  return (
    <div className="flex flex-col items-start gap-4 md:gap-6">
      <EncabezadoResultado
        tono="aviso"
        icono={<XIcon aria-hidden className="size-6.5" />}
        titulo="El pago no se completó"
      >
        {rechazado
          ? `Mercado Pago no aprobó el pago del pedido ${pedido.codigoPublico}. No se hizo ningún cargo.`
          : `El pago del pedido ${pedido.codigoPublico} no se completó.`}
      </EncabezadoResultado>
      {aviso && (
        <Alert variant="aviso">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      {pedido.pagarHasta && (
        <Alert
          variant="info"
          role="note"
          className="rounded-md has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] [&>svg]:size-5"
        >
          <ClockIcon aria-hidden />
          <AlertDescription className="texto-pequeno">
            Tus productos siguen reservados hasta las{' '}
            <time dateTime={pedido.pagarHasta}>
              {formatearHora(pedido.pagarHasta)}
            </time>
            .
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="aviso" role="alert">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <AccionesResultado>
        <Button
          size="grande"
          className="w-full md:w-auto"
          disabled={yendoAPagar}
          aria-busy={yendoAPagar}
          onClick={reintentar}
        >
          Intentar de nuevo
          {yendoAPagar && <Spinner aria-hidden className="size-5" />}
        </Button>
        <EnlaceResultado href={RUTAS.catalogo} contorno>
          Seguir comprando
        </EnlaceResultado>
      </AccionesResultado>
    </div>
  );
};
