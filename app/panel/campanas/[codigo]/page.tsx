import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  EsqueletoCampana,
  PantallaEditarCampana,
} from '@/panel/campanas/pantallaCampana';

export const metadata: Metadata = { title: 'Campaña' };

/** Como Editar pack: con un código dinámico la página depende de la sesión. */
export const instant = false;

/** El código es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaCampana({
  params,
}: PageProps<'/panel/campanas/[codigo]'>) {
  return (
    <Suspense fallback={<EsqueletoCampana />}>
      {params.then(({ codigo }) => (
        <PantallaEditarCampana codigo={codigo} />
      ))}
    </Suspense>
  );
}
