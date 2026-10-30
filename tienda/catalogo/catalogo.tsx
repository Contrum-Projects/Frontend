import { notFound } from 'next/navigation';
import { ErrorDeApi } from '@/compartido/api/errores';
import type {
  CategoriaTienda,
  ListadoTienda,
  MarcaTienda,
} from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { urlCatalogo } from '@/tienda/diseno/enlaces';
import {
  leerCategorias,
  leerFacetas,
  leerMarcas,
  leerProductos,
} from './consultas';
import { FiltrosActivos } from './filtrosActivos';
import { FiltrosCelular } from './filtrosCelular';
import { FiltrosEscritorio } from './filtrosEscritorio';
import { Migas, type Miga } from './migas';
import { opcionesCategorias, opcionesMarcas } from './opcionesFiltros';
import {
  POR_PAGINA,
  TITULOS_ORDEN,
  type ParametrosCatalogo,
} from './parametrosCatalogo';
import {
  GrillaResultados,
  GrillaResultadosEsqueleto,
} from './grillaResultados';
import {
  ResultadosSegunRol,
  TotalProductos,
  TotalSegunRol,
} from './resultadosSegunRol';
import { buscarCategoria } from './seleccionFiltros';
import { SinProductos } from './sinProductos';
import { SinResultados } from './sinResultados';
import { ResultadosPendientes, TransicionFiltros } from './transicionFiltros';

/**
 * Catálogo y búsqueda (SCRUM-106 y SCRUM-107, Figma › 02 Catálogo 2006:395 y 2005:374, y
 * 11 Búsqueda 2058:2736). Con `buscar` es la búsqueda; los filtros de categoría y marca se
 * combinan con ella. La categoría incluye sus subcategorías (lo resuelve el backend). Una
 * categoría o marca que no existe responde 404. Con una cuenta profesional, el total y los
 * resultados se vuelven a pedir con su token: suman los exclusivos y el mayorista (SCRUM-109).
 */
export async function Catalogo({
  parametros,
}: {
  parametros: ParametrosCatalogo;
}) {
  const { buscar, categoriaIds, marcaIds } = parametros;
  const [categorias, marcas] = await Promise.all([
    leerCategorias(),
    leerMarcas(),
  ]);
  const caminos = categoriaIds.map((id) => buscarCategoria(categorias, id));
  const elegidas = marcaIds.map((id) => marcas.find((item) => item.id === id));
  if (!definidos(caminos) || !definidos(elegidas)) notFound();

  const [resultado, facetas] = await Promise.all([
    leerPaginas(parametros),
    leerFacetas({ buscar, categoriaIds, marcaIds }),
  ]);
  const total = 'listado' in resultado ? resultado.listado.total : 0;
  const hayFiltros = categoriaIds.length + marcaIds.length > 0;
  const conFiltros = total > 0 || hayFiltros;
  const filtros = {
    categorias: opcionesCategorias(categorias, facetas, categoriaIds),
    marcas: opcionesMarcas(marcas, facetas, marcaIds),
    seleccion: { categoriaIds, marcaIds },
    buscar,
    orden: parametros.orden,
  };
  const encabezado = encabezar(parametros, caminos, elegidas, total);
  const vacio = buscar ? (
    <SinResultados buscar={buscar} categorias={categorias} />
  ) : (
    <SinProductos
      titulo={encabezado.vacio}
      categorias={categorias.filter((item) => item.id !== caminos[0]?.[0]?.id)}
    />
  );

  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16">
      <Migas migas={encabezado.migas} />
      <div className="mt-2 mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:mb-8">
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          {encabezado.titulo}
        </h1>
        <TotalSegunRol parametros={parametros}>
          {(total > 0 || buscar) && 'listado' in resultado && (
            <TotalProductos total={total} />
          )}
        </TotalSegunRol>
      </div>

      <TransicionFiltros>
        <div
          className={cn(
            conFiltros &&
              'lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-12',
          )}
        >
          {conFiltros && (
            <aside aria-label="Filtros" className="hidden lg:block">
              <FiltrosEscritorio {...filtros} />
            </aside>
          )}
          <div className="flex min-w-0 flex-col gap-6">
            {conFiltros && (
              <div className="lg:hidden">
                <FiltrosCelular {...filtros} />
              </div>
            )}
            <ResultadosPendientes>
              {hayFiltros && (
                <div className="hidden lg:block">
                  <FiltrosActivos
                    parametros={parametros}
                    filtros={[
                      ...caminos.map((camino) => ({
                        tipo: 'categoria' as const,
                        ...ultima(camino),
                      })),
                      ...elegidas.map((marca) => ({
                        tipo: 'marca' as const,
                        ...marca,
                      })),
                    ]}
                  />
                </div>
              )}
              <ResultadosSegunRol parametros={parametros} vacio={vacio}>
                {'error' in resultado ? (
                  <Alert variant="aviso">
                    <AlertDescription>{resultado.error}</AlertDescription>
                  </Alert>
                ) : resultado.listado.items.length > 0 ? (
                  <GrillaResultados
                    listado={resultado.listado}
                    parametros={parametros}
                  />
                ) : (
                  vacio
                )}
              </ResultadosSegunRol>
            </ResultadosPendientes>
          </div>
        </div>
      </TransicionFiltros>
    </main>
  );
}

const definidos = <T,>(lista: (T | null | undefined)[]): lista is T[] =>
  lista.every((item) => item !== null && item !== undefined);

const ultima = (camino: CategoriaTienda[]) => {
  const { id, nombre } = camino[camino.length - 1];
  return { id, nombre };
};

/** Título, migas y nombre para el estado vacío según lo que se abrió. */
function encabezar(
  { buscar, orden }: ParametrosCatalogo,
  caminos: CategoriaTienda[][],
  marcas: MarcaTienda[],
  total: number,
) {
  const inicio: Miga[] = [
    { texto: 'Inicio', href: '/' },
    { texto: 'Catálogo', href: urlCatalogo({}) },
  ];
  if (buscar) {
    return {
      titulo: total > 0 ? `Resultados para «${buscar}»` : 'Búsqueda',
      migas: [
        inicio[0],
        { texto: 'Búsqueda', href: urlCatalogo({ q: buscar }) },
      ],
      vacio: undefined,
    };
  }
  // Una sola categoría (con o sin marca) o una sola marca: su nombre; si no, el catálogo
  const camino = caminos.length === 1 ? caminos[0] : [];
  const categoria = camino.at(-1);
  const marca =
    caminos.length === 0 && marcas.length === 1 ? marcas[0] : undefined;
  const nombre = categoria?.nombre ?? marca?.nombre;
  return {
    titulo: nombre ?? (orden ? TITULOS_ORDEN[orden] : 'Catálogo'),
    migas: [
      ...inicio,
      ...camino.map((nodo) => ({
        texto: nodo.nombre,
        href: urlCatalogo({ categoria: nodo.id }),
      })),
      ...(marca
        ? [{ texto: marca.nombre, href: urlCatalogo({ marca: marca.id }) }]
        : []),
    ],
    vacio: caminos.length + marcas.length === 1 ? nombre : undefined,
  };
}

/**
 * Pide las páginas 1 a N en paralelo, así «Cargar más» es un enlace (funciona sin JavaScript y
 * cada página tiene su URL). En el catálogo, un 400 o 404 del backend (filtro inválido o marca
 * desactivada) es 404; en la búsqueda, un 400 es un texto que el backend no acepta (más de 5
 * palabras) y se muestra su mensaje.
 */
async function leerPaginas({
  buscar,
  categoriaIds,
  marcaIds,
  orden,
  paginas,
}: ParametrosCatalogo): Promise<
  { listado: ListadoTienda } | { error: string }
> {
  try {
    const listados = await Promise.all(
      Array.from({ length: paginas }, (_, i) =>
        leerProductos({
          buscar,
          categoriaIds,
          marcaIds,
          orden,
          pagina: i + 1,
          limite: POR_PAGINA,
        }),
      ),
    );
    return {
      listado: {
        ...listados[0],
        items: listados.flatMap((listado) => listado.items),
      },
    };
  } catch (error) {
    if (!(error instanceof ErrorDeApi)) throw error;
    if (buscar && error.estado === 400) return { error: error.message };
    if ([400, 404].includes(error.estado)) notFound();
    throw error;
  }
}

/** Misma estructura que el catálogo (sin migas reales): no salta al llegar los productos. */
export const CatalogoEsqueleto = () => (
  <main
    aria-busy
    className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16"
  >
    <Skeleton className="h-5 w-48" />
    <div className="mt-2 mb-6 flex items-baseline gap-4 md:mb-8">
      <Skeleton className="h-8 w-64 md:h-12" />
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div aria-hidden className="hidden flex-col gap-3 lg:flex">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-28 rounded-full lg:hidden" />
        <GrillaResultadosEsqueleto />
      </div>
    </div>
  </main>
);
