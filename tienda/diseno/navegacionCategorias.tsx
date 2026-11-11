import Link from 'next/link';
import { leerCategorias, leerMarcas } from '@/tienda/catalogo/consultas';
import { RUTAS, urlCatalogo } from './enlaces';
import { CLASE_ENLACE_HEADER } from './estilosHeader';
import { MenuEnlaces } from './menuEnlaces';

/** Categorías raíz a la vista; las demás van en «Más» para que la fila no pase a dos líneas. */
const CATEGORIAS_EN_LINEA = 4;

/**
 * Categorías del header de escritorio, en la misma fila que el logo: las primeras categorías
 * raíz, «Más» con el resto, «Packs» y «Marcas». Si la API no responde, queda solo «Packs»:
 * la tienda sigue navegable.
 */
export async function NavegacionCategorias() {
  const [categorias, marcas] = await Promise.all([
    leerCategorias().catch(() => []),
    leerMarcas().catch(() => []),
  ]);
  const visibles = categorias.slice(0, CATEGORIAS_EN_LINEA);
  const resto = categorias.slice(CATEGORIAS_EN_LINEA);

  return (
    <ul className="flex min-w-0 items-center gap-1">
      {visibles.map((categoria) => (
        <li key={categoria.id}>
          <Link
            href={urlCatalogo({ categoria: categoria.id })}
            className={CLASE_ENLACE_HEADER}
          >
            {categoria.nombre}
          </Link>
        </li>
      ))}
      {resto.length > 0 && (
        <li>
          <MenuEnlaces
            titulo="Más"
            enlaces={resto.map((categoria) => ({
              clave: categoria.id,
              texto: categoria.nombre,
              href: urlCatalogo({ categoria: categoria.id }),
            }))}
          />
        </li>
      )}
      <li>
        <Link href={RUTAS.packs} className={CLASE_ENLACE_HEADER}>
          Packs
        </Link>
      </li>
      {marcas.length > 0 && (
        <li>
          <MenuEnlaces
            titulo="Marcas"
            enlaces={marcas.map((marca) => ({
              clave: marca.id,
              texto: marca.nombre,
              href: urlCatalogo({ marca: marca.id }),
            }))}
          />
        </li>
      )}
    </ul>
  );
}
