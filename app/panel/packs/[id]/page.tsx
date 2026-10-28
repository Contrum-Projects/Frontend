import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EsqueletoPack, PantallaEditarPack } from '@/panel/packs/pantallaPack';

export const metadata: Metadata = { title: 'Pack' };

/**
 * Como Editar producto: el diseño del panel lee la ruta fuera de <Suspense> y con un id dinámico
 * eso bloquea el prerender; la página depende de la sesión, así que la navegación espera.
 */
export const instant = false;

/** El id es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaPack({ params }: PageProps<'/panel/packs/[id]'>) {
  return (
    <Suspense fallback={<EsqueletoPack />}>
      {params.then(({ id }) => (
        <PantallaEditarPack id={id} />
      ))}
    </Suspense>
  );
}
