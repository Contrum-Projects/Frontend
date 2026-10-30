/**
 * Solo para las pruebas: simula el backend en el borde (`fetch`) respondiendo por ruta, como
 * pide CLAUDE.md. Devuelve el mock para revisar qué se pidió.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createElement, type ReactElement, type ReactNode } from 'react';
import { vi } from 'vitest';
import type {
  CategoriaTienda,
  FacetasTienda,
  MarcaTienda,
  PackTienda,
  ProductoTienda,
} from '@/compartido/api/respuestas';

export const categoria = (
  id: number,
  nombre: string,
  subcategorias: CategoriaTienda[] = [],
): CategoriaTienda => ({
  id,
  nombre,
  descripcion: null,
  padreId: null,
  subcategorias: subcategorias.map((sub) => ({ ...sub, padreId: id })),
});

export const producto = (
  id: number,
  nombre: string,
  extra: Partial<ProductoTienda> = {},
): ProductoTienda => ({
  id,
  nombre,
  marca: { id: 1, nombre: 'Marca A' },
  categoria: { id: 1, nombre: 'Shampoo' },
  precio: 12990,
  imagen: `https://imagenes.test/${id}.jpg`,
  ...extra,
});

export const pack = (
  id: number,
  extra: Partial<PackTienda> = {},
): PackTienda => ({
  id,
  nombre: `Pack ${id}`,
  descripcion: '',
  precio: 24990,
  imagen: `https://imagenes.test/pack-${id}.jpg`,
  vigenteHasta: null,
  componentes: [],
  ...extra,
});

interface Respuestas {
  categorias?: CategoriaTienda[];
  marcas?: MarcaTienda[];
  /** Por número de página; o una respuesta fija con su estado. */
  productos?: ProductoTienda[][] | { estado: number; cuerpo: unknown };
  total?: number;
  packs?: PackTienda[] | { estado: number; cuerpo: unknown };
  /** Sin facetas, el backend responde 404 (como hoy, sin la API simulada). */
  facetas?: FacetasTienda;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export function simularTienda(respuestas: Respuestas) {
  const mock = vi.fn(async (entrada: Request | string | URL) => {
    const url = new URL(entrada instanceof Request ? entrada.url : entrada);
    switch (url.pathname) {
      case '/api/tienda/categorias':
        return json(respuestas.categorias ?? []);
      case '/api/tienda/marcas':
        return json(respuestas.marcas ?? []);
      case '/api/tienda/packs': {
        const packs = respuestas.packs ?? [];
        if (!Array.isArray(packs)) return json(packs.cuerpo, packs.estado);
        return json({
          items: packs,
          total: packs.length,
          pagina: 1,
          limite: 10,
        });
      }
      case '/api/tienda/facetas':
        return respuestas.facetas
          ? json(respuestas.facetas)
          : json({ statusCode: 404, message: 'No existe.' }, 404);
      case '/api/tienda/productos': {
        const productos = respuestas.productos ?? [[]];
        if (!Array.isArray(productos)) {
          return json(productos.cuerpo, productos.estado);
        }
        const pagina = Number(url.searchParams.get('pagina') ?? 1);
        const items = productos[pagina - 1] ?? [];
        return json({
          items,
          total: respuestas.total ?? productos.flat().length,
          pagina,
          limite: Number(url.searchParams.get('limite') ?? 20),
        });
      }
      default:
        return json({ statusCode: 404, message: 'No existe.' }, 404);
    }
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

/** Rutas y consultas que se pidieron al backend, para revisar los filtros. */
export const pedidas = (mock: ReturnType<typeof simularTienda>) =>
  mock.mock.calls.map(([entrada]) => {
    const url = new URL(entrada instanceof Request ? entrada.url : entrada);
    return `${url.pathname}${url.search}`;
  });

/** Renderiza con TanStack Query (los filtros del celular cuentan los productos en el navegador). */
export const renderizar = (ui: ReactElement) => {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: cliente }, children),
  });
};
