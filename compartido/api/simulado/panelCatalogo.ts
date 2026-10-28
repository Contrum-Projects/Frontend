/**
 * Rutas simuladas del catálogo del panel (docs/api-simulada.md).
 *
 * SCRUM-100 · `GET /catalogo/productos`: el listado del panel (Figma P3a) muestra foto,
 * formatos, precio desde, stock total y conteos, y filtra por exclusivos, stock bajo e
 * inactivos, pero el backend hoy entrega solo los datos del producto. Forma pedida a SCRUM-26
 * (anotada en docs/historias/SCRUM-100.md): el mismo listado con esos campos por fila,
 * `conteos` y los filtros `canalVenta`, `stockBajo` y `soloInactivos`.
 *
 * Mientras no exista, se piden al backend los productos reales (hasta 100, con los inactivos y
 * la búsqueda) y se completan con valores fijos: sin imagen, 0 formatos, sin precio y stock 0.
 * No se inventan precios ni stock; filtrar y paginar aquí solo sirve para probar la pantalla.
 *
 * SCRUM-104 · `GET` y `PUT /catalogo/articulos/:id/precios`: el backend real con los campos de
 * IVA pedidos a SCRUM-30 (ver `conCamposPedidos` y docs/historias/SCRUM-104.md).
 *
 * SCRUM-105 · `GET /catalogo/formatos?buscar=`: búsqueda de formatos para armar un pack, que el
 * backend no tiene. Se arma con los productos activos reales cuyo nombre coincide con la búsqueda
 * (el backend real buscará también por formato y SKU) y sus formatos activos, sin stock ni
 * precios: aquí no se calculan y la pantalla muestra «sin dato» (ver docs/historias/SCRUM-105.md).
 * Los packs van al backend real: los campos pedidos a SCRUM-31 faltan y se ven como «—».
 */
import 'server-only';
import type {
  FormatoPanel,
  FormatoParaPack,
  ListadoFormatosParaPack,
  ListadoProductosPanel,
  PreciosArticulo,
  ProductoListadoPanel,
  ProductoPanel,
} from '@/compartido/api/respuestas';
import { entornoServidor } from '@/compartido/config/entorno-servidor';
import { errorSimulado, type RutaSimulada } from './index';

const POR_PAGINA = 20;

/**
 * Pide al backend real con las mismas cabeceras que importan en el proxy: el token y la IP
 * (RNF-09). Un error vuelve con el cuerpo y el estado del backend, sin sus cabeceras (como el
 * proxy); sin conexión, un 502.
 */
const alBackend = async (
  peticion: Request,
  camino: string,
  init: { method?: string; body?: string } = {},
): Promise<Response> => {
  const cabeceras = new Headers();
  for (const nombre of ['authorization', 'x-forwarded-for', 'content-type']) {
    const valor = peticion.headers.get(nombre);
    if (valor) cabeceras.set(nombre, valor);
  }
  let respuesta: Response;
  try {
    respuesta = await fetch(`${entornoServidor().API_URL}${camino}`, {
      ...init,
      headers: cabeceras,
      cache: 'no-store',
    });
  } catch {
    return errorSimulado(
      502,
      'No pudimos conectarnos con el servidor. Intenta de nuevo en unos minutos.',
    );
  }
  if (!respuesta.ok) {
    return Response.json(await respuesta.json().catch(() => null), {
      status: respuesta.status,
    });
  }
  return respuesta;
};

/** Solo ids numéricos: «..» no debe llevar el reenvío a otra ruta del backend. */
const idValido = (id: string) => /^\d+$/.test(id);

/**
 * SCRUM-104 · los precios del backend real con los campos pedidos a SCRUM-30: `porcentajeIva`
 * fijo en 19 (el `IVA_PORCENTAJE` de ejemplo) para ver la referencia al escribir, y los precios
 * con IVA en `null`, porque aquí no se calculan.
 */
const conCamposPedidos = async (respuesta: Response) => {
  if (!respuesta.ok) return respuesta;
  const precios = (await respuesta.json()) as PreciosArticulo;
  return Response.json({
    ...precios,
    porcentajeIva: 19,
    precioMinoristaConIva: null,
    precioMayoristaConIva: null,
  } satisfies PreciosArticulo);
};

const completar = (producto: ProductoPanel): ProductoListadoPanel => ({
  ...producto,
  imagen: null,
  formatos: 0,
  precioDesde: null,
  stockTotal: 0,
  stockBajo: false,
});

export const rutasPanelCatalogo: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/catalogo/productos',
    historia: 'SCRUM-100',
    responder: async ({ peticion, url }) => {
      const consulta = new URLSearchParams({
        incluirInactivos: 'true',
        limite: '100',
      });
      const buscar = url.searchParams.get('buscar');
      if (buscar) consulta.set('buscar', buscar);
      const respuesta = await alBackend(
        peticion,
        `/api/catalogo/productos?${consulta}`,
      );
      if (!respuesta.ok) return respuesta;

      const { items } = (await respuesta.json()) as { items: ProductoPanel[] };
      const todos = items.map(completar);
      const parametros = url.searchParams;
      const filtrados = todos.filter(
        (producto) =>
          (parametros.get('canalVenta') === null ||
            producto.canalVenta === parametros.get('canalVenta')) &&
          (parametros.get('stockBajo') !== 'true' || producto.stockBajo) &&
          (parametros.get('soloInactivos') !== 'true' || !producto.activo) &&
          (parametros.get('incluirInactivos') === 'true' ||
            parametros.get('soloInactivos') === 'true' ||
            producto.activo),
      );
      const pagina = Number(parametros.get('pagina') ?? 1);
      const limite = Number(parametros.get('limite') ?? POR_PAGINA);
      const listado: ListadoProductosPanel = {
        items: filtrados.slice((pagina - 1) * limite, pagina * limite),
        total: filtrados.length,
        pagina,
        limite,
        conteos: {
          todos: todos.length,
          exclusivos: todos.filter((p) => p.canalVenta === 'profesional')
            .length,
          stockBajo: todos.filter((p) => p.stockBajo).length,
          inactivos: todos.filter((p) => !p.activo).length,
        },
      };
      return Response.json(listado);
    },
  },
  {
    metodo: 'GET',
    ruta: '/catalogo/articulos/:id/precios',
    historia: 'SCRUM-104',
    responder: async ({ peticion, params }) =>
      idValido(params.id)
        ? conCamposPedidos(
            await alBackend(
              peticion,
              `/api/catalogo/articulos/${params.id}/precios`,
            ),
          )
        : errorSimulado(404, 'El artículo no existe.'),
  },
  {
    metodo: 'PUT',
    ruta: '/catalogo/articulos/:id/precios',
    historia: 'SCRUM-104',
    responder: async ({ peticion, params }) =>
      idValido(params.id)
        ? conCamposPedidos(
            await alBackend(
              peticion,
              `/api/catalogo/articulos/${params.id}/precios`,
              { method: 'PUT', body: await peticion.text() },
            ),
          )
        : errorSimulado(404, 'El artículo no existe.'),
  },
  {
    metodo: 'GET',
    ruta: '/catalogo/formatos',
    historia: 'SCRUM-105',
    responder: async ({ peticion, url }) => {
      const consulta = new URLSearchParams({ limite: String(POR_PAGINA) });
      const buscar = url.searchParams.get('buscar');
      if (buscar) consulta.set('buscar', buscar);
      const respuesta = await alBackend(
        peticion,
        `/api/catalogo/productos?${consulta}`,
      );
      if (!respuesta.ok) return respuesta;

      const { items } = (await respuesta.json()) as { items: ProductoPanel[] };
      const respuestas = await Promise.all(
        items.map((producto) =>
          alBackend(
            peticion,
            `/api/catalogo/productos/${producto.id}/formatos`,
          ),
        ),
      );
      // Una sesión vencida o sin permiso vuelve tal cual, no como «sin resultados» (RNF-03)
      const rechazo = respuestas.find((respuesta) =>
        [401, 403].includes(respuesta.status),
      );
      if (rechazo) return rechazo;
      const porProducto = await Promise.all(
        items.map(async (producto, indice): Promise<FormatoParaPack[]> => {
          const formatos = respuestas[indice];
          if (!formatos.ok) return [];
          return ((await formatos.json()) as FormatoPanel[])
            .filter((formato) => formato.activo)
            .map((formato) => ({
              formatoId: formato.id,
              sku: formato.sku,
              nombreFormato: formato.nombreFormato,
              producto: { id: producto.id, nombre: producto.nombre },
              canalVenta: producto.canalVenta,
            }));
        }),
      );
      const todos = porProducto.flat();
      const listado: ListadoFormatosParaPack = {
        items: todos.slice(0, POR_PAGINA),
        total: todos.length,
        pagina: 1,
        limite: POR_PAGINA,
      };
      return Response.json(listado);
    },
  },
];
