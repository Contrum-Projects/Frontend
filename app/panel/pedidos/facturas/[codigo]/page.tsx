import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  DetalleFacturaPanel,
  EsqueletoDetalleFactura,
} from '@/panel/facturas/detalleFactura';

export const metadata: Metadata = { title: 'Registrar factura' };

/** Como /panel/pedidos/[codigo]: el diseño del panel lee la ruta fuera de <Suspense>. */
export const instant = false;

/** El código del pedido es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaFacturaPedido({
  params,
}: PageProps<'/panel/pedidos/facturas/[codigo]'>) {
  return (
    <Suspense fallback={<EsqueletoDetalleFactura />}>
      {params.then(({ codigo }) => (
        <DetalleFacturaPanel codigo={codigo} />
      ))}
    </Suspense>
  );
}
