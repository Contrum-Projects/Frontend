import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  EsqueletoRevision,
  RevisionVerificacion,
} from '@/panel/verificaciones/revisionVerificacion';

export const metadata: Metadata = { title: 'Revisar verificación' };

/** Como /panel/pedidos/facturas/[codigo]: el diseño del panel lee la ruta fuera de <Suspense>. */
export const instant = false;

/**
 * El código de la cuenta es dato de la petición: se lee dentro de <Suspense> (Cache Components).
 * `key`: al abrir otra solicitud la revisión empieza de cero (sin la confirmación anterior).
 */
export default function PaginaRevisionVerificacion({
  params,
}: PageProps<'/panel/verificaciones/[codigoPublico]'>) {
  return (
    <Suspense fallback={<EsqueletoRevision />}>
      {params.then(({ codigoPublico }) => (
        <RevisionVerificacion key={codigoPublico} codigo={codigoPublico} />
      ))}
    </Suspense>
  );
}
