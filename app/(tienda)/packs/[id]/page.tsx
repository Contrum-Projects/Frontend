import type { Metadata } from 'next';
import { Suspense } from 'react';
import { leerId, leerPack } from '@/tienda/ficha/consultas';
import { FichaPack } from '@/tienda/ficha/fichaPack';
import { EsqueletoFicha } from '@/tienda/ficha/partesFicha';

export async function generateMetadata({
  params,
}: PageProps<'/packs/[id]'>): Promise<Metadata> {
  const id = leerId((await params).id);
  // Si el backend falla, la página muestra el error; los metadatos no lo repiten
  const pack = id === null ? null : await leerPack(id).catch(() => null);
  if (!pack) return { title: 'Pack' };
  return {
    title: pack.nombre,
    description: pack.descripcion.slice(0, 160) || undefined,
  };
}

/** El id es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaPack({ params }: PageProps<'/packs/[id]'>) {
  return (
    <Suspense fallback={<EsqueletoFicha />}>
      {params.then(({ id }) => (
        <FichaPack id={id} />
      ))}
    </Suspense>
  );
}
