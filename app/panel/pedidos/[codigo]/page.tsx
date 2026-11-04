import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  DetallePedidoPanel,
  EsqueletoDetallePanel,
} from '@/panel/pedidos/detallePedido';

export const metadata: Metadata = { title: 'Detalle del pedido' };

/**
 * El diseño del panel lee la ruta (usePathname) fuera de <Suspense>, y con un código dinámico eso
 * bloquea el prerender. El detalle depende de la sesión, así que se permite que la navegación
 * espere (route segment config `instant`), como en /panel/productos/[id].
 */
export const instant = false;

/** El código del pedido es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaDetallePedidoPanel({
  params,
}: PageProps<'/panel/pedidos/[codigo]'>) {
  return (
    <Suspense fallback={<EsqueletoDetallePanel />}>
      {params.then(({ codigo }) => (
        <DetallePedidoPanel codigo={codigo} />
      ))}
    </Suspense>
  );
}
