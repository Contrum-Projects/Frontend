import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { categoria, pedidas, producto, simularTienda } from './apiDePrueba';
import { Catalogo } from './catalogo';

vi.mock('next/server', () => ({ connection: async () => {} }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const CATEGORIAS = [
  categoria(1, 'Shampoo', [categoria(2, 'Reparación')]),
  categoria(5, 'Coloración'),
  categoria(6, 'Styling'),
];
const MARCAS = [
  { id: 4, nombre: 'Marca A' },
  { id: 7, nombre: 'Marca B' },
];

describe('SCRUM-106 · Catálogo por categoría o marca', () => {
  it('E2-H1 FE · catálogo por categoría: muestra las tarjetas con foto, nombre, marca y precio', async () => {
    const api = simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [
        [
          producto(10, 'Shampoo reparador', { precio: 12990 }),
          producto(11, 'Shampoo hidratante', {
            precio: 11490,
            marca: { id: 7, nombre: 'Marca B' },
          }),
        ],
      ],
    });

    render(await Catalogo({ parametros: { categoriaId: 1, paginas: 1 } }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shampoo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 productos')).toBeInTheDocument();
    const tarjeta = screen.getAllByRole('article')[1];
    // La foto es decorativa (alt vacío): el nombre ya está en el enlace de la tarjeta
    const foto = tarjeta.querySelector('img');
    expect(foto).toHaveAttribute('alt', '');
    expect(decodeURIComponent(foto?.getAttribute('src') ?? '')).toContain(
      'https://imagenes.test/11.jpg',
    );
    expect(within(tarjeta).getByText('Marca B')).toBeInTheDocument();
    expect(within(tarjeta).getByText('$11.490')).toBeInTheDocument();
    expect(
      within(tarjeta).getByRole('link', { name: 'Shampoo hidratante' }),
    ).toHaveAttribute('href', '/productos/11');
    expect(pedidas(api)).toContain(
      '/api/tienda/productos?categoriaId=1&pagina=1&limite=12',
    );
  });

  it('E2-H1 FE · catálogo por categoría: una subcategoría muestra su camino en las migas', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [[producto(10, 'Shampoo reparador')]],
    });

    render(await Catalogo({ parametros: { categoriaId: 2, paginas: 1 } }));

    const migas = screen.getByRole('navigation', { name: 'Migas de pan' });
    expect(
      within(migas).getByRole('link', { name: 'Shampoo' }),
    ).toHaveAttribute('href', '/catalogo?categoria=1');
    expect(within(migas).getByText('Reparación')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('E2-H1 FE · catálogo por marca: lista solo esa marca y la nombra en el título', async () => {
    const api = simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [
        [
          producto(12, 'Tinte permanente', {
            marca: { id: 7, nombre: 'Marca B' },
          }),
        ],
      ],
    });

    render(await Catalogo({ parametros: { marcaId: 7, paginas: 1 } }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Marca B' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 producto')).toBeInTheDocument();
    expect(pedidas(api)).toContain(
      '/api/tienda/productos?marcaId=7&pagina=1&limite=12',
    );
  });

  it('E2-H1 FE · catálogo: «Cargar más productos» suma la página siguiente', async () => {
    const primera = Array.from({ length: 12 }, (_, i) =>
      producto(100 + i, `Producto ${i}`),
    );
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: [primera, [producto(200, 'Producto 12')]],
      total: 13,
    });

    const { unmount } = render(
      await Catalogo({ parametros: { categoriaId: 1, paginas: 1 } }),
    );
    expect(
      screen.getByText('Mostrando 12 de 13 productos'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Cargar más productos' }),
    ).toHaveAttribute('href', '/catalogo?categoria=1&pagina=2');
    unmount();

    render(await Catalogo({ parametros: { categoriaId: 1, paginas: 2 } }));
    expect(screen.getAllByRole('article')).toHaveLength(13);
    expect(
      screen.queryByRole('link', { name: 'Cargar más productos' }),
    ).not.toBeInTheDocument();
  });

  it('E2-H1 FE · sin productos: lo indica y ofrece explorar otras categorías', async () => {
    simularTienda({ categorias: CATEGORIAS, marcas: MARCAS, productos: [[]] });

    render(await Catalogo({ parametros: { categoriaId: 5, paginas: 1 } }));

    expect(
      screen.getByRole('heading', {
        name: 'Todavía no hay productos en Coloración',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Explora otras categorías:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shampoo' })).toHaveAttribute(
      'href',
      '/catalogo?categoria=1',
    );
    expect(screen.getByRole('link', { name: 'Styling' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Coloración' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('E2-H1 FE · categoría o marca que no existe: responde 404', async () => {
    simularTienda({ categorias: CATEGORIAS, marcas: MARCAS });

    await expect(
      Catalogo({ parametros: { categoriaId: 99, paginas: 1 } }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(
      Catalogo({ parametros: { marcaId: 99, paginas: 1 } }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('E2-H1 FE · si el backend rechaza el filtro (marca desactivada), responde 404', async () => {
    simularTienda({
      categorias: CATEGORIAS,
      marcas: MARCAS,
      productos: {
        estado: 404,
        cuerpo: { statusCode: 404, message: 'La marca no existe.' },
      },
    });

    await expect(
      Catalogo({ parametros: { marcaId: 4, paginas: 1 } }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
