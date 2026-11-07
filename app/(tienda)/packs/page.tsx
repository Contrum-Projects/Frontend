import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  ListaPacks,
  ListaPacksEsqueleto,
  leerPaginas,
} from '@/tienda/packs/listaPacks';

export const metadata: Metadata = {
  title: 'Packs',
  description: 'Packs de productos capilares de Cabello Perfecto.',
};

/** La página es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaPacks({ searchParams }: PageProps<'/packs'>) {
  return (
    <Suspense fallback={<ListaPacksEsqueleto />}>
      {searchParams.then((busqueda) => (
        <ListaPacks paginas={leerPaginas(busqueda.pagina)} />
      ))}
    </Suspense>
  );
}
