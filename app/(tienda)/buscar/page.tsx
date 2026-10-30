import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Catalogo, CatalogoEsqueleto } from '@/tienda/catalogo/catalogo';
import { leerParametrosCatalogo } from '@/tienda/catalogo/parametrosCatalogo';
import { hrefDe, urlCatalogo } from '@/tienda/diseno/enlaces';

export const metadata: Metadata = {
  title: 'Búsqueda',
  // Los resultados de cada búsqueda no se indexan: el catálogo ya tiene sus páginas
  robots: { index: false },
};

export default function PaginaBusqueda({ searchParams }: PageProps<'/buscar'>) {
  return (
    <Suspense fallback={<CatalogoEsqueleto />}>
      <BusquedaConParametros busqueda={searchParams} />
    </Suspense>
  );
}

async function BusquedaConParametros({
  busqueda,
}: {
  busqueda: PageProps<'/buscar'>['searchParams'];
}) {
  const parametros = leerParametrosCatalogo(await busqueda);
  if (!parametros) notFound();
  // Sin texto no hay nada que buscar: el catálogo, con los mismos filtros
  if (!parametros.buscar) {
    redirect(
      hrefDe(
        urlCatalogo({
          categoria: parametros.categoriaIds,
          marca: parametros.marcaIds,
          orden: parametros.orden,
        }),
      ),
    );
  }
  return <Catalogo parametros={parametros} />;
}
