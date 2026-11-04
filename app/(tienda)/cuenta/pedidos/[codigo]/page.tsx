import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  EsqueletoDetalle,
  PantallaDetallePedido,
} from '@/tienda/pedidos/pantallaDetallePedido';

export const metadata: Metadata = {
  title: 'Detalle del pedido',
  robots: { index: false, follow: false },
};

/** El código del pedido es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaDetallePedido({
  params,
}: PageProps<'/cuenta/pedidos/[codigo]'>) {
  return (
    <Suspense fallback={<EsqueletoDetalle />}>
      {params.then(({ codigo }) => (
        <PantallaDetallePedido codigo={codigo} />
      ))}
    </Suspense>
  );
}
