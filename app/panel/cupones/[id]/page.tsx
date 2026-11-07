import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  EsqueletoCupon,
  PantallaEditarCupon,
} from '@/panel/cupones/pantallaCupon';

export const metadata: Metadata = { title: 'Cupón' };

/** Como Campaña: con un id dinámico la página depende de la sesión. */
export const instant = false;

/** El id es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaCupon({
  params,
}: PageProps<'/panel/cupones/[id]'>) {
  return (
    <Suspense fallback={<EsqueletoCupon />}>
      {params.then(({ id }) => (
        <PantallaEditarCupon id={id} />
      ))}
    </Suspense>
  );
}
