import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  DisenoPago,
  EsqueletoPago,
  PantallaRegresoPago,
} from '@/tienda/pago/pantallaRegresoPago';

export const metadata: Metadata = {
  title: 'Resultado del pago',
  // Mercado Pago agrega a la URL el id del pago: que no salga en el Referer ni se indexe
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

/**
 * Regreso desde Mercado Pago (SCRUM-120). El código del pedido y la consulta son datos de la
 * petición: se leen dentro de <Suspense> (Cache Components).
 */
export default function PaginaRegresoPago({
  params,
}: PageProps<'/pedidos/[codigo]/pago'>) {
  return (
    <Suspense
      fallback={
        <DisenoPago>
          <EsqueletoPago />
        </DisenoPago>
      }
    >
      {params.then(({ codigo }) => (
        <PantallaRegresoPago codigo={codigo} />
      ))}
    </Suspense>
  );
}
