import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  EsqueletoProducto,
  PantallaEditarProducto,
} from '@/panel/productos/pantallaProducto';

export const metadata: Metadata = { title: 'Editar producto' };

/**
 * El diseño del panel lee la ruta (usePathname) fuera de <Suspense>, y con un id dinámico eso
 * bloquea el prerender. Esta página no tiene contenido estático que mostrar antes (depende de
 * la sesión), así que se permite que la navegación espere (route segment config `instant`).
 */
export const instant = false;

/** El id es dato de la petición: se lee dentro de <Suspense> (Cache Components). */
export default function PaginaProducto({
  params,
}: PageProps<'/panel/productos/[id]'>) {
  return (
    <Suspense fallback={<EsqueletoProducto />}>
      {params.then(({ id }) => (
        <PantallaEditarProducto id={id} />
      ))}
    </Suspense>
  );
}
