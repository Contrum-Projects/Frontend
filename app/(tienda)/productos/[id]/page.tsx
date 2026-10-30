import type { Metadata } from 'next';
import { Suspense } from 'react';
import { leerId, leerProducto } from '@/tienda/ficha/consultas';
import { FichaProducto } from '@/tienda/ficha/fichaProducto';
import { EsqueletoFicha } from '@/tienda/ficha/partesFicha';

export async function generateMetadata({
  params,
}: PageProps<'/productos/[id]'>): Promise<Metadata> {
  const id = leerId((await params).id);
  // Si el backend falla, la página muestra el error; los metadatos no lo repiten
  const producto =
    id === null ? null : await leerProducto(id).catch(() => null);
  if (!producto) return { title: 'Producto' };
  return {
    title: producto.marca
      ? `${producto.nombre} · ${producto.marca.nombre}`
      : producto.nombre,
    description: producto.descripcion.slice(0, 160) || undefined,
  };
}

/** El id es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaProducto({
  params,
}: PageProps<'/productos/[id]'>) {
  return (
    <Suspense fallback={<EsqueletoFicha />}>
      {params.then(({ id }) => (
        <FichaProducto id={id} />
      ))}
    </Suspense>
  );
}
