import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Catalogo, CatalogoEsqueleto } from '@/tienda/catalogo/catalogo';
import { leerParametrosCatalogo } from '@/tienda/catalogo/parametrosCatalogo';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Productos capilares de Cabello Perfecto por categoría y marca.',
};

export default function PaginaCatalogo({
  searchParams,
}: PageProps<'/catalogo'>) {
  return (
    <Suspense fallback={<CatalogoEsqueleto />}>
      <CatalogoConParametros busqueda={searchParams} />
    </Suspense>
  );
}

async function CatalogoConParametros({
  busqueda,
}: {
  busqueda: PageProps<'/catalogo'>['searchParams'];
}) {
  const parametros = leerParametrosCatalogo(await busqueda);
  if (!parametros) notFound();
  return <Catalogo parametros={parametros} />;
}
