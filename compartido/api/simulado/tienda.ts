/**
 * Rutas simuladas de la tienda (docs/api-simulada.md).
 *
 * SCRUM-106 · `GET /tienda/productos?orden=mas-vendidos|novedades`: el inicio muestra filas de
 * «Más vendidos» y «Novedades», pero el backend solo ordena por nombre y rechaza `orden` (400).
 * Forma propuesta al backend (anotada en docs/historias/SCRUM-106.md): el mismo listado de
 * `/tienda/productos`, con `orden` opcional. Mientras no exista, se devuelve el listado real
 * sin `orden` (por nombre): no se inventa qué se vende más ni qué es nuevo.
 *
 * SCRUM-107 · varias categorías y marcas en `/tienda/productos` (`categoriaId` y `marcaId`
 * repetidos) y `GET /tienda/facetas` (forma acordada en docs/historias/SCRUM-107.md). No se
 * inventan datos: se piden al backend real los listados de cada categoría y marca, y se juntan.
 * Son varias llamadas por página; se borran cuando el backend lo tenga.
 */
import 'server-only';
import type {
  CategoriaTienda,
  FacetasTienda,
  ListadoTienda,
  MarcaTienda,
  ProductoTienda,
} from '@/compartido/api/respuestas';
import { entornoServidor } from '@/compartido/config/entorno-servidor';
import { json, type RutaSimulada } from './index';

/** El máximo que acepta el backend en `limite`. */
const LIMITE_BACKEND = 100;

interface Filtro {
  buscar: string | null;
  categoriaIds: string[];
  marcaIds: string[];
}

const leerFiltro = (url: URL): Filtro => ({
  buscar: url.searchParams.get('buscar'),
  categoriaIds: url.searchParams.getAll('categoriaId'),
  marcaIds: url.searchParams.getAll('marcaId'),
});

/** Pide al backend real, con el token de la persona si lo trae. */
const backend = (
  peticion: Request,
  camino: string,
  consulta?: URLSearchParams,
) => {
  const cabeceras = new Headers();
  const autorizacion = peticion.headers.get('authorization');
  if (autorizacion) cabeceras.set('authorization', autorizacion);
  return fetch(
    `${entornoServidor().API_URL}/api${camino}${consulta ? `?${consulta}` : ''}`,
    { headers: cabeceras, cache: 'no-store' },
  );
};

/** Un error del backend se devuelve tal cual (p. ej. el 400 de una búsqueda muy larga). */
class RespuestaDelBackend extends Error {
  constructor(readonly respuesta: Response) {
    super('Error del backend');
  }
}

const pedirJson = async <T>(
  peticion: Request,
  camino: string,
  consulta?: URLSearchParams,
): Promise<T> => {
  const respuesta = await backend(peticion, camino, consulta);
  if (!respuesta.ok) throw new RespuestaDelBackend(respuesta);
  return respuesta.json() as Promise<T>;
};

/** Todos los productos de una categoría y una marca (o ninguna), página por página. */
async function todasLasPaginas(
  peticion: Request,
  buscar: string | null,
  categoriaId?: string,
  marcaId?: string,
): Promise<ProductoTienda[]> {
  const items: ProductoTienda[] = [];
  for (let pagina = 1; ; pagina++) {
    const consulta = new URLSearchParams({
      pagina: String(pagina),
      limite: String(LIMITE_BACKEND),
    });
    if (buscar) consulta.set('buscar', buscar);
    if (categoriaId) consulta.set('categoriaId', categoriaId);
    if (marcaId) consulta.set('marcaId', marcaId);
    const listado = await pedirJson<ListadoTienda>(
      peticion,
      '/tienda/productos',
      consulta,
    );
    items.push(...listado.items);
    if (items.length >= listado.total || listado.items.length === 0) {
      return items;
    }
  }
}

/** Productos de cualquiera de las categorías y de cualquiera de las marcas, por nombre. */
async function juntar(peticion: Request, filtro: Filtro) {
  const categorias = filtro.categoriaIds.length ? filtro.categoriaIds : [''];
  const marcas = filtro.marcaIds.length ? filtro.marcaIds : [''];
  const listas = await Promise.all(
    categorias.flatMap((categoriaId) =>
      marcas.map((marcaId) =>
        todasLasPaginas(
          peticion,
          filtro.buscar,
          categoriaId || undefined,
          marcaId || undefined,
        ),
      ),
    ),
  );
  const porId = new Map(listas.flat().map((item) => [item.id, item]));
  return [...porId.values()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  );
}

const conErrorDelBackend = async (
  responder: () => Promise<Response>,
): Promise<Response> => {
  try {
    return await responder();
  } catch (error) {
    if (error instanceof RespuestaDelBackend) return error.respuesta;
    throw error;
  }
};

const idsDelArbol = (arbol: CategoriaTienda[]): number[] =>
  arbol.flatMap((nodo) => [nodo.id, ...idsDelArbol(nodo.subcategorias)]);

export const rutasTienda: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/tienda/productos',
    historia: 'SCRUM-107',
    responder: ({ peticion, url }) => {
      const filtro = leerFiltro(url);
      // Con una categoría y una marca como máximo, el backend ya responde
      if (filtro.categoriaIds.length <= 1 && filtro.marcaIds.length <= 1) {
        return null;
      }
      return conErrorDelBackend(async () => {
        const items = await juntar(peticion, filtro);
        const pagina = Number(url.searchParams.get('pagina') ?? 1);
        const limite = Number(url.searchParams.get('limite') ?? 20);
        return json({
          items: items.slice((pagina - 1) * limite, pagina * limite),
          total: items.length,
          pagina,
          limite,
        } satisfies ListadoTienda);
      });
    },
  },
  {
    metodo: 'GET',
    ruta: '/tienda/productos',
    historia: 'SCRUM-106',
    responder: ({ peticion, url }) => {
      // Sin `orden`, la petición sigue al backend como siempre
      if (!url.searchParams.has('orden')) return null;
      const consulta = new URLSearchParams(url.searchParams);
      consulta.delete('orden');
      return backend(peticion, '/tienda/productos', consulta);
    },
  },
  {
    metodo: 'GET',
    ruta: '/tienda/facetas',
    historia: 'SCRUM-107',
    responder: ({ peticion, url }) =>
      conErrorDelBackend(async () => {
        const filtro = leerFiltro(url);
        const [arbol, marcas] = await Promise.all([
          pedirJson<CategoriaTienda[]>(peticion, '/tienda/categorias'),
          pedirJson<MarcaTienda[]>(peticion, '/tienda/marcas'),
        ]);
        // Cada grupo se cuenta con los filtros del otro grupo, no con los suyos
        const contar = async (parcial: Partial<Filtro>) =>
          (await juntar(peticion, { ...filtro, ...parcial })).length;
        const [categorias, totalesMarcas] = await Promise.all([
          Promise.all(
            idsDelArbol(arbol).map(async (id) => ({
              id,
              total: await contar({ categoriaIds: [String(id)] }),
            })),
          ),
          Promise.all(
            marcas.map(async ({ id }) => ({
              id,
              total: await contar({ marcaIds: [String(id)] }),
            })),
          ),
        ]);
        return json({
          categorias: categorias.filter(({ total }) => total > 0),
          marcas: totalesMarcas.filter(({ total }) => total > 0),
        } satisfies FacetasTienda);
      }),
  },
];
