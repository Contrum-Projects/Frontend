import { notFound } from 'next/navigation';
import { Migas } from '@/tienda/catalogo/migas';
import { RUTAS, urlCatalogo, urlProducto } from '@/tienda/diseno/enlaces';
import { leerId, leerProducto } from './consultas';
import { InfoProducto } from './infoProducto';

/**
 * Ficha de producto (SCRUM-108, Figma › 03 Ficha 2007:635, agotado 2058:3096, celular
 * 2007:1706). Se arma en el servidor como visitante, para buscadores; un producto que no existe,
 * no está a la venta o es exclusivo responde 404.
 */
export async function FichaProducto({ id }: { id: string }) {
  const numero = leerId(id);
  const producto = numero === null ? null : await leerProducto(numero);
  if (!producto || producto.formatos.length === 0) notFound();

  return (
    <InfoProducto
      producto={producto}
      migas={
        <Migas
          migas={[
            { texto: 'Inicio', href: RUTAS.inicio },
            {
              texto: producto.categoria.nombre,
              href: urlCatalogo({ categoria: producto.categoria.id }),
            },
            { texto: producto.nombre, href: urlProducto(producto.id) },
          ]}
        />
      }
    />
  );
}
