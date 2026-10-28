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
 */
import 'server-only';
import type {
  ListadoProductosPanel,
  ProductoListadoPanel,
  ProductoPanel,
} from '@/compartido/api/respuestas';
import { entornoServidor } from '@/compartido/config/entorno-servidor';
import { errorSimulado, type RutaSimulada } from './index';

const POR_PAGINA = 20;

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
      // Las mismas cabeceras que importan en el proxy: el token y la IP (RNF-09)
      const cabeceras = new Headers();
      for (const nombre of ['authorization', 'x-forwarded-for']) {
        const valor = peticion.headers.get(nombre);
        if (valor) cabeceras.set(nombre, valor);
      }
      let respuesta: Response;
      try {
        respuesta = await fetch(
          `${entornoServidor().API_URL}/api/catalogo/productos?${consulta}`,
          { headers: cabeceras, cache: 'no-store' },
        );
      } catch {
        return errorSimulado(
          502,
          'No pudimos conectarnos con el servidor. Intenta de nuevo en unos minutos.',
        );
      }
      // 401, 403 o 400: el cuerpo y el estado del backend, sin sus cabeceras (como el proxy)
      if (!respuesta.ok) {
        return Response.json(await respuesta.json().catch(() => null), {
          status: respuesta.status,
        });
      }

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
];
