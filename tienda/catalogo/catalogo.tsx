import { notFound } from 'next/navigation';
import { ErrorDeApi } from '@/compartido/api/errores';
import type {
  CategoriaTienda,
  ListadoTienda,
  MarcaTienda,
} from '@/compartido/api/respuestas';
import { Skeleton } from '@/compartido/ui/skeleton';
import { urlCatalogo } from '@/tienda/diseno/enlaces';
import { BotonCargarMas } from './botonCargarMas';
import {
  buscarCategoria,
  leerCategorias,
  leerMarcas,
  leerProductos,
} from './consultas';
import { Migas, type Miga } from './migas';
import {
  MAXIMO_PAGINAS,
  POR_PAGINA,
  TITULOS_ORDEN,
  type ParametrosCatalogo,
} from './parametrosCatalogo';
import { SinProductos } from './sinProductos';
import {
  TAMANOS_FOTO,
  TarjetaProducto,
  TarjetaProductoEsqueleto,
} from './tarjetaProducto';

/**
 * Catálogo por categoría o marca (SCRUM-106, Figma › 02 Catálogo 2006:395 y 2005:374). La
 * categoría incluye sus subcategorías (lo resuelve el backend). Los filtros laterales llegan con
 * SCRUM-107. Una categoría o marca que no existe responde 404.
 */
export async function Catalogo({
  parametros,
}: {
  parametros: ParametrosCatalogo;
}) {
  const { categoriaId, marcaId, orden, paginas } = parametros;
  const [categorias, marcas] = await Promise.all([
    leerCategorias(),
    leerMarcas(),
  ]);
  const camino =
    categoriaId === undefined ? [] : buscarCategoria(categorias, categoriaId);
  const marca = marcas.find((item) => item.id === marcaId);
  if (!camino || (marcaId !== undefined && !marca)) notFound();

  const listado = await leerPaginas(parametros);
  const categoria = camino.at(-1);
  const titulo =
    categoria?.nombre ??
    marca?.nombre ??
    (orden ? TITULOS_ORDEN[orden] : 'Catálogo');

  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16">
      <Migas migas={migas(camino, categoria ? undefined : marca)} />
      <div className="mt-2 mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:mb-8">
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          {titulo}
        </h1>
        {listado.total > 0 && (
          <p className="text-texto-secundario">
            {listado.total === 1 ? '1 producto' : `${listado.total} productos`}
          </p>
        )}
      </div>

      {listado.items.length === 0 ? (
        <SinProductos
          titulo={categoria?.nombre ?? marca?.nombre}
          categorias={categorias.filter((item) => item.id !== camino[0]?.id)}
        />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {listado.items.map((producto, i) => (
              <li key={producto.id}>
                <TarjetaProducto
                  producto={producto}
                  tamanos={TAMANOS_FOTO.catalogo}
                  prioridad={i < 4}
                />
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-center gap-3 md:mt-12">
            <p className="texto-pequeno text-texto-secundario">
              Mostrando {listado.items.length} de {listado.total} productos
            </p>
            {listado.items.length < listado.total &&
              paginas < MAXIMO_PAGINAS && (
                <BotonCargarMas
                  href={urlCatalogo({
                    categoria: categoriaId,
                    marca: marcaId,
                    orden,
                    pagina: paginas + 1,
                  })}
                />
              )}
          </div>
        </>
      )}
    </main>
  );
}

/**
 * Pide las páginas 1 a N en paralelo, así «Cargar más» es un enlace (funciona sin JavaScript y
 * cada página tiene su URL). Un 400 o 404 del backend (filtro inválido o marca desactivada) es 404.
 */
async function leerPaginas({
  categoriaId,
  marcaId,
  orden,
  paginas,
}: ParametrosCatalogo): Promise<ListadoTienda> {
  try {
    const listados = await Promise.all(
      Array.from({ length: paginas }, (_, i) =>
        leerProductos({
          categoriaId,
          marcaId,
          orden,
          pagina: i + 1,
          limite: POR_PAGINA,
        }),
      ),
    );
    return {
      ...listados[0],
      items: listados.flatMap((listado) => listado.items),
    };
  } catch (error) {
    if (error instanceof ErrorDeApi && [400, 404].includes(error.estado)) {
      notFound();
    }
    throw error;
  }
}

const migas = (camino: CategoriaTienda[], marca?: MarcaTienda): Miga[] => [
  { texto: 'Inicio', href: '/' },
  { texto: 'Catálogo', href: urlCatalogo({}) },
  ...camino.map((nodo) => ({
    texto: nodo.nombre,
    href: urlCatalogo({ categoria: nodo.id }),
  })),
  ...(marca
    ? [{ texto: marca.nombre, href: urlCatalogo({ marca: marca.id }) }]
    : []),
];

/** Misma estructura que el catálogo (sin migas reales): no salta al llegar los productos. */
export const CatalogoEsqueleto = () => (
  <main
    aria-busy
    className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16"
  >
    <Skeleton className="h-5 w-48" />
    <Skeleton className="mt-2 mb-6 h-8 w-64 md:mb-8 md:h-12" />
    <ul
      aria-hidden
      className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i}>
          <TarjetaProductoEsqueleto />
        </li>
      ))}
    </ul>
  </main>
);
