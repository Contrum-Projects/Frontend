import Link from 'next/link';
import { leerCategorias, leerMarcas } from '@/tienda/catalogo/consultas';
import { RUTAS, urlCatalogo } from './enlaces';
import { MenuMarcas } from './menuMarcas';

const CLASE_ENLACE =
  'shrink-0 rounded-md texto-etiqueta text-texto-principal hover:text-marca-profundo hover:underline';

/**
 * Fila de categorías del header de escritorio: las categorías raíz, «Packs» y «Marcas».
 * Si la API no responde, la fila queda solo con «Packs»: la tienda sigue navegable.
 */
export async function NavegacionCategorias() {
  const [categorias, marcas] = await Promise.all([
    leerCategorias().catch(() => []),
    leerMarcas().catch(() => []),
  ]);

  return (
    <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-8 gap-y-2">
      {categorias.map((categoria) => (
        <li key={categoria.id}>
          <Link
            href={urlCatalogo({ categoria: categoria.id })}
            className={CLASE_ENLACE}
          >
            {categoria.nombre}
          </Link>
        </li>
      ))}
      <li>
        <Link href={RUTAS.packs} className={CLASE_ENLACE}>
          Packs
        </Link>
      </li>
      {marcas.length > 0 && (
        <li>
          <MenuMarcas marcas={marcas} />
        </li>
      )}
    </ul>
  );
}
