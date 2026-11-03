'use client';

import { ClockIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ErrorDeApi } from '@/compartido/api/errores';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { formatearHora } from '@/compartido/formato/fecha';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button, buttonVariants } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useReintentarPago } from './consultasPago';

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
  const encabezado = useRef<HTMLHeadingElement>(null);
  const error = reintento.error;
  // Tras el cobro se sale a Mercado Pago: el botón sigue deshabilitado hasta irse
  const yendoAPagar = reintento.isPending || reintento.isSuccess;

  useEffect(() => {
    encabezado.current?.focus();
  }, []);

  const reintentar = () =>
    reintento.mutate(undefined, {
      onError: (falla) => {
        if (falla instanceof ErrorDeApi && falla.estado === 409)
          onPedidoCambio();
      },
    });

  return (
    <div className="flex flex-col items-start gap-4 md:gap-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-estado-aviso-fondo text-estado-aviso-texto">
        <XIcon aria-hidden className="size-6.5" />
      </div>
      <div className="flex flex-col gap-4 md:gap-2">
        <h1
          ref={encabezado}
          tabIndex={-1}
          className="titulo-h2 text-texto-principal outline-none md:titulo-h1"
        >
          El pago no se completó
        </h1>
        <p className="texto-pequeno text-texto-secundario md:texto-cuerpo">
          {rechazado
            ? `Mercado Pago no aprobó el pago del pedido ${pedido.codigoPublico}. No se hizo ningún cargo.`
            : `El pago del pedido ${pedido.codigoPublico} no se completó.`}
        </p>
      </div>
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
      <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:gap-3">
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
        <Link
          href={RUTAS.catalogo}
          className={buttonVariants({
            variant: 'contorno',
            size: 'grande',
            className: 'w-full md:w-auto',
          })}
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
};
