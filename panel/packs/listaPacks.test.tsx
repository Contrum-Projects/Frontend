import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { ListadoPacksPanel, PackPanel } from '@/compartido/api/respuestas';
import {
  error,
  iniciarSesion,
  mostrar,
  simularBackend,
} from '@/panel/productos/apiDePrueba';
import { PantallaPacks } from './pantallaPacks';

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

const pack = (extra: Partial<PackPanel> = {}): PackPanel => ({
  id: 40,
  sku: 'PK-REP-01',
  nombre: 'Pack reparación',
  descripcion: 'Shampoo y acondicionador juntos.',
  canalVenta: 'general',
  fechaInicioVigencia: '2026-11-01',
  fechaFinVigencia: '2026-11-30',
  vigente: true,
  activo: true,
  fechaCreacion: '2026-10-28T15:00:00.000Z',
  componentes: [
    {
      formatoId: 21,
      sku: 'SH-REP-300',
      nombreFormato: '300 ml',
      producto: { id: 7, nombre: 'Shampoo reparador' },
      cantidad: 2,
    },
  ],
  imagenes: [],
  ...extra,
});

const listado = (
  items: PackPanel[],
  extra: Partial<ListadoPacksPanel> = {},
): ListadoPacksPanel => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
  ...extra,
});

/** En jsdom se dibujan la tabla (escritorio) y la lista (celular): se usa la tabla. */
const tabla = async () => within(await screen.findByRole('table'));

beforeEach(() => {
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Listado de packs (SCRUM-105)', () => {
  it('E3-H6 FE · packs: muestra cada pack con su SKU, componentes, vigencia y estado', async () => {
    simularBackend({
      'GET /api/catalogo/packs': () =>
        Response.json(
          listado([
            pack(),
            pack({
              id: 41,
              sku: 'PK-PRO-01',
              nombre: 'Pack profesional',
              canalVenta: 'profesional',
              activo: false,
              vigente: false,
              fechaInicioVigencia: null,
              fechaFinVigencia: null,
            }),
          ]),
        ),
    });
    mostrar(<PantallaPacks />);

    const [, primera, segunda] = (await tabla())
      .getAllByRole('row')
      .map((fila) => within(fila));
    expect(primera.getByText('Pack reparación')).toBeInTheDocument();
    expect(primera.getByText('PK-REP-01')).toBeInTheDocument();
    expect(
      primera.getByText('Shampoo reparador · 300 ml ×2'),
    ).toBeInTheDocument();
    expect(primera.getByText('1 nov 2026 al 30 nov 2026')).toBeInTheDocument();
    expect(primera.getByText('Vigente')).toBeInTheDocument();
    expect(
      primera.getByRole('link', { name: 'Editar Pack reparación' }),
    ).toHaveAttribute('href', '/panel/packs/40');

    expect(segunda.getByText('Sin vigencia')).toBeInTheDocument();
    expect(segunda.getByText('Fuera de vigencia')).toBeInTheDocument();
    expect(segunda.getByText('Exclusivo')).toBeInTheDocument();
    expect(segunda.getByText('Inactivo')).toBeInTheDocument();
  });

  it('E3-H6 FE · packs: lleva a Pack nuevo', async () => {
    simularBackend({
      'GET /api/catalogo/packs': () => Response.json(listado([pack()])),
    });
    mostrar(<PantallaPacks />);

    expect(screen.getByRole('link', { name: /Pack nuevo/ })).toHaveAttribute(
      'href',
      '/panel/packs/nuevo',
    );
  });

  it('E3-H6 FE · packs: sin packs, lo dice', async () => {
    simularBackend({
      'GET /api/catalogo/packs': () => Response.json(listado([])),
    });
    mostrar(<PantallaPacks />);

    expect(await screen.findByText('Aún no hay packs.')).toBeInTheDocument();
  });

  it('E3-H6 FE · packs: pagina con el backend', async () => {
    const { pedidas } = simularBackend({
      'GET /api/catalogo/packs': (peticion) =>
        new URL(peticion.url).searchParams.get('pagina') === '2'
          ? Response.json(
              listado([pack({ id: 60, nombre: 'Pack verano' })], {
                pagina: 2,
                total: 21,
              }),
            )
          : Response.json(listado([pack()], { total: 21 })),
    });
    mostrar(<PantallaPacks />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Siguiente →' }),
    );

    expect(await (await tabla()).findByText('Pack verano')).toBeInTheDocument();
    await waitFor(() =>
      expect(pedidas).toContain('GET /api/catalogo/packs?pagina=2'),
    );
  });

  it('E3-H6 FE · packs: si el backend falla, muestra su mensaje', async () => {
    simularBackend({
      'GET /api/catalogo/packs': () =>
        error(403, 'No tienes permiso para gestionar el catálogo.'),
    });
    mostrar(<PantallaPacks />);

    expect(
      await screen.findByText('No tienes permiso para gestionar el catálogo.'),
    ).toBeInTheDocument();
  });
});
