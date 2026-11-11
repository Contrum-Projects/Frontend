import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  DetalleCliente,
  EsqueletoDetalle,
} from '@/panel/clientes/detalleCliente';

export const metadata: Metadata = { title: 'Cliente' };

/** Como /panel/verificaciones/[codigoPublico]: el diseño del panel lee la ruta fuera de <Suspense>. */
export const instant = false;

/** El código de la cuenta es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaCliente({
  params,
}: PageProps<'/panel/clientes/[codigoPublico]'>) {
  return (
    <Suspense fallback={<EsqueletoDetalle />}>
      {params.then(({ codigoPublico }) => (
        <DetalleCliente key={codigoPublico} codigo={codigoPublico} />
      ))}
    </Suspense>
  );
}
