import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  EsqueletoCampana,
  PantallaEditarCampana,
} from '@/panel/campanas/pantallaCampana';

export const metadata: Metadata = { title: 'Campaña' };

/** Como Editar pack: con un id dinámico la página depende de la sesión. */
export const instant = false;

/**
 * El id es dato de la petición: se lee dentro de <Suspense> (Cache Components). Las campañas se
 * identifican por id (decisión del 6 nov, SCRUM-150).
 */
export default function PaginaCampana({
  params,
}: PageProps<'/panel/campanas/[id]'>) {
  return (
    <Suspense fallback={<EsqueletoCampana />}>
      {params.then(({ id }) => (
        <PantallaEditarCampana id={id} />
      ))}
    </Suspense>
  );
}
