import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  error,
  filaListado,
  iniciarSesion,
  listado,
  mostrar,
  simularBackend,
} from './apiDePrueba';
import { PantallaProductos } from './pantallaProductos';

// Cliente igual al de la app, con URL absoluta y el fetch simulado de cada prueba
vi.mock('@/compartido/api/cliente', async (original) => {
  const { middlewareDeSesion } =
    await original<typeof import('@/compartido/api/cliente')>();
  const { default: createClient } = await import('openapi-fetch');
  const api = createClient<paths>({
    baseUrl: 'http://tienda.test',
    fetch: (peticion) => globalThis.fetch(peticion),
  });
  api.use(middlewareDeSesion);
  return { api, middlewareDeSesion };
});

const FILAS = [
  filaListado({
    origenDescripcion: 'ia_editada',
    imagen: 'https://imagenes.test/7.jpg',
  }),
  filaListado({
    id: 8,
    nombre: 'Sérum de puntas',
    marca: { id: 2, nombre: 'Wella' },
    categoria: { id: 2, nombre: 'Shampoo' },
    formatos: 1,
    precioDesde: null,
    stockTotal: 0,
    stockBajo: true,
    activo: false,
    canalVenta: 'profesional',
  }),
];

/** La tabla de escritorio (en jsdom también se dibuja la lista de celular). */
const tabla = () => screen.getByRole('table');
const filaDe = (nombre: string) =>
  within(tabla()).getByText(nombre).closest('tr') as HTMLElement;
const listaDeProductos = () =>
  screen
    .getAllByRole('list')
    .find((lista) => lista.getAttribute('aria-label') === null) as HTMLElement;

beforeEach(iniciarSesion);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Productos (SCRUM-100)', () => {
  it('E3-H1 FE · listado: muestra foto, categoría, formatos, precio desde, stock, estado y origen de la descripción', async () => {
    simularBackend({
      'GET /api/catalogo/productos': () => Response.json(listado(FILAS)),
    });
    mostrar(<PantallaProductos />);

    const primera = await waitFor(() => filaDe('Shampoo reparador'));
    expect(primera.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('imagenes.test'),
    );
    expect(within(primera).getByText('Kérastase')).toBeInTheDocument();
    // La categoría con su ruta desde la raíz, del árbol de categorías
    expect(
      await within(primera).findByText('Shampoo › Reparación'),
    ).toBeInTheDocument();
    expect(within(primera).getByText('2')).toBeInTheDocument();
    expect(within(primera).getByText('$12.990')).toBeInTheDocument();
    expect(within(primera).getByText(/18/)).toBeInTheDocument();
    expect(within(primera).getByText('IA editada')).toBeInTheDocument();
    expect(within(primera).getByText('Activo')).toBeInTheDocument();
    expect(
      within(primera).getByRole('link', { name: 'Editar Shampoo reparador' }),
    ).toHaveAttribute('href', '/panel/productos/7');

    const segunda = filaDe('Sérum de puntas');
    expect(
      within(segunda).getByText('Wella · Exclusivo profesional'),
    ).toBeInTheDocument();
    // Sin precio en ningún formato: un guion, no $0
    expect(within(segunda).getByText('—')).toBeInTheDocument();
    expect(within(segunda).getByText('(stock bajo)')).toBeInTheDocument();
    expect(within(segunda).getByText('Manual')).toBeInTheDocument();
    expect(within(segunda).getByText('Inactivo')).toBeInTheDocument();
  });

  it('E3-H1 FE · listado: en celular cada producto abre su edición', async () => {
    simularBackend({
      'GET /api/catalogo/productos': () => Response.json(listado(FILAS)),
    });
    mostrar(<PantallaProductos />);

    await screen.findByRole('table');
    const enlaces = within(listaDeProductos()).getAllByRole('link');
    expect(enlaces[0]).toHaveAttribute('href', '/panel/productos/7');
    expect(enlaces[0]).toHaveTextContent('Kérastase · 2 formatos');
    expect(enlaces[1]).toHaveTextContent(
      'Wella · 1 formato · Exclusivo · Inactivo',
    );
  });

  it('E3-H1 FE · listado: filtra por exclusivos, stock bajo e inactivos con sus conteos', async () => {
    const { pedidas } = simularBackend({
      'GET /api/catalogo/productos': () => Response.json(listado(FILAS)),
    });
    mostrar(<PantallaProductos />);
    await screen.findByRole('table');

    const filtros = screen.getByRole('list', { name: 'Filtros' });
    expect(
      within(filtros).getByRole('button', { name: /Todos · 86/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(pedidas).toContain(
      'GET /api/catalogo/productos?incluirInactivos=true&pagina=1',
    );

    await userEvent.click(
      within(filtros).getByRole('button', {
        name: /Exclusivos profesionales · 9/,
      }),
    );
    await waitFor(() =>
      expect(pedidas).toContain(
        'GET /api/catalogo/productos?incluirInactivos=true&canalVenta=profesional&pagina=1',
      ),
    );
    await userEvent.click(
      within(filtros).getByRole('button', { name: /Con stock bajo · 4/ }),
    );
    await waitFor(() =>
      expect(pedidas).toContain(
        'GET /api/catalogo/productos?incluirInactivos=true&stockBajo=true&pagina=1',
      ),
    );
    await userEvent.click(
      within(filtros).getByRole('button', { name: /Inactivos · 3/ }),
    );
    await waitFor(() =>
      expect(pedidas).toContain(
        'GET /api/catalogo/productos?soloInactivos=true&pagina=1',
      ),
    );
    expect(
      within(filtros).getByRole('button', { name: /Inactivos · 3/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('E3-H1 FE · listado: busca por nombre y avisa si no hay coincidencias', async () => {
    const { pedidas } = simularBackend({
      'GET /api/catalogo/productos': (peticion) =>
        Response.json(
          listado(
            new URL(peticion.url).searchParams.has('buscar') ? [] : FILAS,
          ),
        ),
    });
    mostrar(<PantallaProductos />);
    await screen.findByRole('table');

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar productos' }),
      'tinte{Enter}',
    );

    expect(
      await screen.findByText('No encontramos productos con «tinte».'),
    ).toBeInTheDocument();
    expect(pedidas).toContain(
      'GET /api/catalogo/productos?incluirInactivos=true&buscar=tinte&pagina=1',
    );
  });

  it('E3-H1 FE · listado: pasa a la página siguiente', async () => {
    const { pedidas } = simularBackend({
      'GET /api/catalogo/productos': (peticion) => {
        const pagina = Number(new URL(peticion.url).searchParams.get('pagina'));
        return Response.json(
          listado(
            pagina === 1
              ? FILAS
              : [filaListado({ id: 9, nombre: 'Tinte permanente' })],
            {
              total: 3,
              limite: 2,
              pagina,
            },
          ),
        );
      },
    });
    mostrar(<PantallaProductos />);

    expect(await screen.findByText('Mostrando 2 de 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));

    expect(await screen.findByText('Mostrando 3 de 3')).toBeInTheDocument();
    expect(within(tabla()).getByText('Tinte permanente')).toBeInTheDocument();
    expect(pedidas).toContain(
      'GET /api/catalogo/productos?incluirInactivos=true&pagina=2',
    );
    expect(
      screen.queryByRole('button', { name: 'Siguiente →' }),
    ).not.toBeInTheDocument();
  });

  it('E3-H1 FE · listado: sin productos no promete nada más', async () => {
    simularBackend({
      'GET /api/catalogo/productos': () => Response.json(listado([])),
    });
    mostrar(<PantallaProductos />);

    expect(
      await screen.findByText('Aún no hay productos.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Producto nuevo/ }),
    ).toHaveAttribute('href', '/panel/productos/nuevo');
  });

  it('E3-H1 FE · listado: si el servidor falla, muestra un aviso sin detalles técnicos', async () => {
    simularBackend({
      'GET /api/catalogo/productos': () =>
        error(500, 'PrismaClientKnownRequestError: conexión rechazada'),
    });
    mostrar(<PantallaProductos />);

    expect(
      // La consulta reintenta dos veces los 5xx antes de mostrar el error
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
  }, 8000);

  it('E3-H4 FE · marcas: Productos lleva a Marcas y categorías', () => {
    simularBackend({
      'GET /api/catalogo/productos': () => Response.json(listado([])),
    });
    mostrar(<PantallaProductos />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Productos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Marcas y categorías' }),
    ).toHaveAttribute('href', '/panel/marcas-y-categorias');
  });
});
