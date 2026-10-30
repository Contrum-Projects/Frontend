import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  categoria,
  pedidas,
  producto,
  renderizar,
  simularTienda,
} from './apiDePrueba';
import { Catalogo } from './catalogo';
import type { ParametrosCatalogo } from './parametrosCatalogo';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

// El cliente del navegador con URL absoluta (Node no resuelve rutas relativas) y el fetch simulado
vi.mock('@/compartido/api/cliente', async () => {
  const { default: createClient } = await import('openapi-fetch');
  return {
    apiPublica: createClient({
      baseUrl: 'http://tienda.test',
      fetch: (peticion) => globalThis.fetch(peticion),
    }),
  };
});

vi.mock('next/server', () => ({ connection: async () => {} }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const CATEGORIAS = [
  categoria(1, 'Shampoo', [
    categoria(2, 'Reparación'),
    categoria(3, 'Hidratación'),
  ]),
  categoria(5, 'Acondicionador'),
  categoria(6, 'Styling'),
];
const MARCAS = [
  { id: 4, nombre: 'Marca A' },
  { id: 7, nombre: 'Marca B' },
  { id: 8, nombre: 'Marca C' },
];
const FACETAS = {
  categorias: [
    { id: 1, total: 3 },
    { id: 2, total: 2 },
    { id: 5, total: 1 },
  ],
  marcas: [
    { id: 4, total: 3 },
    { id: 7, total: 1 },
  ],
};
const RESULTADOS = [
  producto(10, 'Shampoo reparador'),
  producto(11, 'Shampoo reparador sin sulfatos'),
  producto(12, 'Mascarilla reparadora'),
  producto(13, 'Acondicionador reparador'),
];

const buscar = (extra: Partial<ParametrosCatalogo> = {}) =>
  Catalogo({
    parametros: {
      buscar: 'reparador',
      categoriaIds: [],
      marcaIds: [],
      paginas: 1,
      ...extra,
    },
  });

const filtrosEscritorio = () =>
  screen.getByRole('complementary', { name: 'Filtros' });

describe('SCRUM-107 · Búsqueda y filtros del catálogo', () => {
  it('E2-H2 FE · resultados: busca el texto y muestra los productos con su total', async () => {
    const api = simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });

    renderizar(await buscar());

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Resultados para «reparador»',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('4 productos')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(pedidas(api)).toContain(
      '/api/tienda/productos?buscar=reparador&pagina=1&limite=12',
    );
    expect(pedidas(api)).toContain('/api/tienda/facetas?buscar=reparador');
    const migas = screen.getByRole('navigation', { name: 'Migas de pan' });
    expect(within(migas).getByText('Búsqueda')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('E2-H2 FE · resultados: filtra por categoría, subcategoría y marca con cuántos productos hay', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });

    renderizar(await buscar());

    const filtros = filtrosEscritorio();
    const categorias = within(filtros).getByRole('list', { name: 'Categoría' });
    // En la búsqueda se ven también las subcategorías con resultados
    expect(
      within(categorias).getByRole('checkbox', { name: 'Shampoo 3 productos' }),
    ).not.toBeChecked();
    expect(
      within(categorias).getByRole('checkbox', {
        name: 'Reparación 2 productos',
      }),
    ).toBeInTheDocument();
    expect(
      within(categorias).getByRole('checkbox', {
        name: 'Acondicionador 1 producto',
      }),
    ).toBeInTheDocument();
    // Las que no tienen resultados no se ofrecen
    expect(
      within(categorias).queryByRole('checkbox', { name: /Hidratación/ }),
    ).not.toBeInTheDocument();
    expect(
      within(categorias).queryByRole('checkbox', { name: /Styling/ }),
    ).not.toBeInTheDocument();
    const marcas = within(filtros).getByRole('list', { name: 'Marca' });
    expect(within(marcas).getAllByRole('checkbox')).toHaveLength(2);
    expect(
      within(marcas).queryByRole('checkbox', { name: /Marca C/ }),
    ).not.toBeInTheDocument();
  });

  it('E2-H2 FE · resultados: marcar una categoría y una marca actualiza la URL de la búsqueda', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });
    const usuario = userEvent.setup();

    renderizar(await buscar({ marcaIds: [4] }));

    await usuario.click(
      within(filtrosEscritorio()).getByRole('checkbox', {
        name: 'Shampoo 3 productos',
      }),
    );
    expect(push).toHaveBeenCalledWith(
      '/buscar?q=reparador&categoria=1&marca=4',
      { scroll: false },
    );
  });

  it('E2-H2 FE · resultados: marcar una subcategoría reemplaza a su categoría', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });
    const usuario = userEvent.setup();

    renderizar(await buscar({ categoriaIds: [1, 5] }));

    await usuario.click(
      within(filtrosEscritorio()).getByRole('checkbox', {
        name: 'Reparación 2 productos',
      }),
    );
    expect(push).toHaveBeenCalledWith(
      '/buscar?q=reparador&categoria=5&categoria=2',
      { scroll: false },
    );
  });

  it('E2-H2 FE · resultados: varias categorías y marcas se piden juntas y se pueden quitar desde «Filtrando por»', async () => {
    const api = simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });

    renderizar(await buscar({ categoriaIds: [1, 5], marcaIds: [4] }));

    expect(pedidas(api)).toContain(
      '/api/tienda/productos?buscar=reparador&categoriaId=1&categoriaId=5&marcaId=4&pagina=1&limite=12',
    );
    expect(screen.getByText('Filtrando por:')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Shampoo (quitar filtro)' }),
    ).toHaveAttribute('href', '/buscar?q=reparador&categoria=5&marca=4');
    expect(
      screen.getByRole('link', { name: 'Marca A (quitar filtro)' }),
    ).toHaveAttribute('href', '/buscar?q=reparador&categoria=1&categoria=5');
    expect(
      within(filtrosEscritorio()).getByRole('button', {
        name: 'Limpiar filtros',
      }),
    ).toBeInTheDocument();
  });

  it('E2-H2 FE · resultados: «Cargar más» conserva la búsqueda y los filtros', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      total: 20,
      facetas: FACETAS,
    });

    renderizar(await buscar({ marcaIds: [4] }));

    expect(
      screen.getByRole('link', { name: 'Cargar más productos' }),
    ).toHaveAttribute('href', '/buscar?q=reparador&marca=4&pagina=2');
  });

  it('E2-H2 FE · resultados: si el backend no entrega los conteos, los filtros se muestran igual', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
    });

    renderizar(await buscar());

    expect(
      within(filtrosEscritorio()).getByRole('checkbox', { name: 'Styling' }),
    ).toBeInTheDocument();
    expect(
      within(filtrosEscritorio()).getByRole('checkbox', { name: 'Marca C' }),
    ).toBeInTheDocument();
  });

  it('E2-H2 FE · sin resultados: lo indica y propone categorías para seguir', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [[]],
      facetas: { categorias: [], marcas: [] },
    });

    renderizar(await buscar({ buscar: 'ampollas' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Búsqueda' }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 productos')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'No encontramos productos para «ampollas»',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Revisa cómo lo escribiste o busca por nombre, marca o categoría.',
      ),
    ).toBeInTheDocument();
    const explora = screen.getByRole('region', {
      name: 'Explora por categoría',
    });
    expect(
      within(explora).getByRole('link', { name: 'Shampoo' }),
    ).toHaveAttribute('href', '/catalogo?categoria=1');
    expect(within(explora).getAllByRole('link')).toHaveLength(3);
    // Sin resultados ni filtros marcados, no hay nada que filtrar
    expect(
      screen.queryByRole('complementary', { name: 'Filtros' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('E2-H2 FE · búsqueda que el backend rechaza: muestra su mensaje', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: {
        estado: 400,
        cuerpo: {
          statusCode: 400,
          message: ['La búsqueda admite hasta 5 palabras.'],
        },
      },
    });

    renderizar(await buscar({ buscar: 'uno dos tres cuatro cinco seis' }));

    expect(
      screen.getByText('La búsqueda admite hasta 5 palabras.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('E2-H2 FE · filtros en celular: el panel muestra cuántos productos habrá y aplica al tocar «Ver»', async () => {
    const api = simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      total: 4,
      facetas: FACETAS,
    });
    const usuario = userEvent.setup();

    renderizar(await buscar({ categoriaIds: [1] }));

    await usuario.click(screen.getByRole('button', { name: 'Filtros (1)' }));
    const panel = screen.getByRole('dialog', { name: 'Filtros' });
    expect(
      within(panel).getByRole('checkbox', { name: 'Shampoo 3 productos' }),
    ).toBeChecked();
    expect(
      await within(panel).findByRole('button', { name: 'Ver 4 productos' }),
    ).toBeInTheDocument();

    await usuario.click(
      within(panel).getByRole('checkbox', { name: 'Marca B 1 producto' }),
    );
    // Marcar no aplica todavía: el backend cuenta con lo marcado
    expect(push).not.toHaveBeenCalled();
    expect(pedidas(api)).toContain(
      '/api/tienda/productos?buscar=reparador&categoriaId=1&marcaId=7&limite=1',
    );

    await usuario.click(within(panel).getByRole('button', { name: /^Ver / }));
    expect(push).toHaveBeenCalledWith(
      '/buscar?q=reparador&categoria=1&marca=7',
      { scroll: false },
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('E2-H2 FE · filtros en celular: «Limpiar» desmarca todo y cerrar descarta lo no aplicado', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });
    const usuario = userEvent.setup();

    renderizar(await buscar({ categoriaIds: [1], marcaIds: [4] }));

    await usuario.click(screen.getByRole('button', { name: 'Filtros (2)' }));
    let panel = screen.getByRole('dialog', { name: 'Filtros' });
    await usuario.click(within(panel).getByRole('button', { name: 'Limpiar' }));
    expect(within(panel).queryAllByRole('checkbox', { checked: true })).toEqual(
      [],
    );

    await usuario.click(within(panel).getByRole('button', { name: 'Cerrar' }));
    expect(push).not.toHaveBeenCalled();
    await usuario.click(screen.getByRole('button', { name: 'Filtros (2)' }));
    panel = screen.getByRole('dialog', { name: 'Filtros' });
    expect(
      within(panel).getAllByRole('checkbox', { checked: true }),
    ).toHaveLength(2);
  });

  it('E2-H2 FE · filtros en celular: si el backend no cuenta, el botón dice «Ver productos» y aplica igual', async () => {
    const api = simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });
    const usuario = userEvent.setup();

    renderizar(await buscar());
    // Desde aquí, el conteo del navegador falla
    const pedirOriginal = api.getMockImplementation();
    api.mockImplementation(async (entrada) => {
      const url = new URL(entrada instanceof Request ? entrada.url : entrada);
      if (url.searchParams.get('limite') === '1') {
        return new Response('{}', { status: 500 });
      }
      return pedirOriginal!(entrada);
    });

    await usuario.click(screen.getByRole('button', { name: 'Filtros' }));
    const panel = screen.getByRole('dialog', { name: 'Filtros' });
    await usuario.click(
      within(panel).getByRole('checkbox', { name: 'Marca B 1 producto' }),
    );
    await usuario.click(
      await within(panel).findByRole('button', { name: 'Ver productos' }),
    );
    expect(push).toHaveBeenCalledWith('/buscar?q=reparador&marca=7', {
      scroll: false,
    });
  });

  it('E2-H2 FE · catálogo con filtros: muestra las subcategorías solo de la categoría marcada', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [RESULTADOS],
      facetas: FACETAS,
    });

    renderizar(await buscar({ buscar: undefined, categoriaIds: [5] }));

    const categorias = within(filtrosEscritorio()).getByRole('list', {
      name: 'Categoría',
    });
    expect(
      within(categorias).getByRole('checkbox', { name: /Acondicionador/ }),
    ).toBeChecked();
    expect(
      within(categorias).queryByRole('checkbox', { name: /Reparación/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Acondicionador' }),
    ).toBeInTheDocument();
  });
});
