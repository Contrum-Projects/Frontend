'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from '@/compartido/ui/skeleton';
import { CuentaProtegida } from '@/tienda/cuenta/cuentaProtegida';
import { urlPedido } from '@/tienda/diseno/enlaces';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import {
  esperaConfirmacion,
  leerPagoId,
  resolverResultado,
  useRegresoPago,
  useSeguimientoPedido,
} from './consultasPago';
import { PagoAprobado } from './pagoAprobado';
import { PagoNoCompletado } from './pagoNoCompletado';
import { PagoPendiente } from './pagoPendiente';
import { PedidoCancelado } from './pedidoCancelado';

/**
 * /pedidos/[codigo]/pago (SCRUM-120 y SCRUM-121): adonde Mercado Pago devuelve al comprador, apruebe o no
 * (lo fija el backend con `URL_TIENDA`). Solo con sesión: sin ella lleva a ingresar y vuelve
 * aquí con el mismo id de pago. Lee la consulta en el navegador: va dentro de <Suspense>.
 */
export function PantallaRegresoPago({ codigo }: { codigo: string }) {
  const parametros = useSearchParams();
  // Se lee una vez: si la URL cambia después (otra navegación), el resultado ya se pidió
  const [pagoId] = useState(() => leerPagoId(parametros));
  const volver = `/pedidos/${encodeURIComponent(codigo)}/pago${pagoId ? `?payment_id=${pagoId}` : ''}`;

  return (
    <DisenoPago>
      <CuentaProtegida esqueleto={<EsqueletoPago />} volver={volver}>
        <Regreso codigo={codigo} pagoId={pagoId} />
      </CuentaProtegida>
    </DisenoPago>
  );
}

const Regreso = ({
  codigo,
  pagoId,
}: {
  codigo: string;
  pagoId: string | null;
}) => {
  const router = useRouter();
  const consulta = useRegresoPago(codigo, pagoId);
  const regreso = consulta.data;
  const seguimiento = useSeguimientoPedido(
    regreso && esperaConfirmacion(regreso) ? regreso.pedido : null,
  );
  const pedido = seguimiento.data ?? regreso?.pedido;
  const resultado = regreso
    ? resolverResultado(regreso, seguimiento.data)
    : null;

  // E6-H1, criterio 3 · El pedido ya estaba pagado (sin un pago en este regreso): al detalle
  useEffect(() => {
    if (resultado === 'detalle') router.replace(urlPedido(codigo));
  }, [resultado, codigo, router]);

  if (consulta.isPending || resultado === 'detalle') return <EsqueletoPago />;
  if (consulta.isError) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          Resultado del pago
        </h1>
        <ErrorProfesional
          mensaje={consulta.error.message}
          onReintentar={() => void consulta.refetch()}
        />
      </div>
    );
  }
  if (!pedido) return <EsqueletoPago />;
  // Cada resultado con su `key`: al cambiar, el título nuevo recibe el foco
  switch (resultado) {
    case 'aprobado':
      return <PagoAprobado key={resultado} pedido={pedido} />;
    case 'pendiente':
      return <PagoPendiente key={resultado} pedido={pedido} />;
    case 'cancelado':
      return <PedidoCancelado key={resultado} pedido={pedido} />;
    default:
      return (
        <PagoNoCompletado
          key={resultado}
          pedido={pedido}
          rechazado={consulta.data.estadoPago === 'rechazado'}
          aviso={consulta.data.aviso}
          onPedidoCambio={() => void consulta.refetch()}
        />
      );
  }
};

/** El contenido mide 720 px en escritorio (Figma › 09 Resultado del pago), más el gutter. */
export const DisenoPago = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto flex w-full max-w-184 flex-col px-4 pt-8 pb-12 md:pt-12 md:pb-16">
    {children}
  </main>
);

/**
 * Con la misma estructura que «El pago no se completó»: ícono, título y mensaje juntos, la
 * reserva (dos líneas a 360 px) y los botones, para que el pie no salte al cargar.
 */
export const EsqueletoPago = () => (
  <div aria-hidden className="flex flex-col gap-4 md:gap-6">
    <Skeleton className="size-14 rounded-full" />
    <div className="flex flex-col gap-4 md:gap-2">
      <Skeleton className="h-9 w-72 max-w-full md:h-12" />
      <Skeleton className="h-10 w-full md:h-6" />
    </div>
    <Skeleton className="h-16 w-full rounded-md md:h-12" />
    <div className="flex flex-col gap-4 md:flex-row md:gap-3">
      <Skeleton className="h-14 w-full rounded-full md:w-48" />
      <Skeleton className="h-14 w-full rounded-full md:w-48" />
    </div>
  </div>
);
