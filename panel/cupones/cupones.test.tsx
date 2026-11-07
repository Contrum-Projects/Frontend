import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { CuponPanel, DatosCupon } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { puedeAbrir } from '@/panel/diseno/secciones';
import { PantallaCuponNuevo, PantallaEditarCupon } from './pantallaCupon';
import { PantallaCupones } from './pantallaCupones';

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
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/panel/cupones',
}));

const RUTA = '/api/marketing/cupones';
const MARCAS = [{ id: 5, nombre: 'Loreal', activa: true }];
const CATEGORIAS = [
  {
    id: 3,
    nombre: 'Coloración',
    descripcion: null,
    padreId: null,
    subcategorias: [],
  },
];

const cupon = (cambios: Partial<CuponPanel> = {}): CuponPanel => ({
  id: 7,
  codigo: 'LOREAL20',
  descripcion: '20 % en Loreal',
  tipoDescuento: 'porcentaje',
  valor: 20,
  topeDescuento: 10000,
  alcance: 'categorias_marcas',
  articulos: [],
  categorias: [],
  marcas: [{ id: 5, nombre: 'Loreal' }],
  compraMinima: null,
  fechaInicio: null,
  fechaFin: null,
  usosMaximos: 100,
  usosPorCuenta: 1,
  incluyeProfesionales: false,
  activo: true,
  campana: null,
  usos: 18,
  descontado: 54000,
  fechaCreacion: '2026-11-07T12:00:00.000Z',
  ...cambios,
});

type Manejador = (peticion: Request) => Response | Promise<Response>;

const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: { clave: string; cuerpo: unknown }[] = [];
  const base: Record<string, Manejador> = {
    [`GET ${RUTA}`]: () => Response.json([cupon()]),
    'GET /api/catalogo/marcas': () => Response.json(MARCAS),
    'GET /api/catalogo/categorias': () => Response.json(CATEGORIAS),
    'GET /api/catalogo/packs': () =>
      Response.json({ items: [], total: 0, pagina: 1, limite: 100 }),
    'GET /api/marketing/campanas': () =>
      Response.json({
        contactos: {
          aceptanPublicidad: 0,
          cuentasVerificadas: 0,
          suscriptoresSinCuenta: 0,
          conRebote: 0,
        },
        items: [
          {
            id: 12,
            asunto: 'Novedades Loreal',
            enviada: true,
          },
        ],
        total: 1,
        pagina: 1,
        limite: 100,
      }),
    [`POST ${RUTA}`]: async (peticion) =>
      Response.json(
        cupon({
          ...((await peticion.json()) as object),
          id: 41,
        } as Partial<CuponPanel>),
        { status: 201 },
      ),
    ...rutas,
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
      const cuerpo =
        peticion.method === 'GET'
          ? undefined
          : await peticion
              .clone()
              .json()
              .catch(() => undefined);
      pedidas.push({ clave, cuerpo });
      const manejador = base[clave];
      if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
      return manejador(peticion);
    }),
  );
  return (clave: string) =>
    pedidas.filter((p) => p.clave === clave).map((p) => p.cuerpo);
};

const mostrar = (pantalla: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {pantalla}
    </QueryClientProvider>,
  );

beforeEach(() => {
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Marcela',
        apellido: 'Díaz',
        rol: 'administrador',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Cupones del panel (SCRUM-150)', () => {
  it('SCRUM-150 · listado: cada cupón con su descuento, a qué aplica, usos y lo descontado del backend', async () => {
    simularBackend({
      [`GET ${RUTA}`]: () =>
        Response.json([
          cupon(),
          cupon({
            id: 8,
            codigo: 'VIEJO10',
            activo: false,
            tipoDescuento: 'monto_fijo',
            valor: 5000,
            topeDescuento: null,
            alcance: 'pedido',
            marcas: [],
            usosMaximos: null,
            usos: 0,
            descontado: 0,
            campana: { id: 12, asunto: 'Novedades', enviada: true },
          }),
        ]),
    });
    mostrar(<PantallaCupones />);

    const tabla = await screen.findByRole('table', { name: 'Cupones' });
    const [primera, segunda] = within(tabla).getAllByRole('row').slice(1);
    expect(primera).toHaveTextContent('LOREAL20');
    expect(primera).toHaveTextContent('20 % (hasta $10.000)');
    expect(primera).toHaveTextContent('Loreal');
    expect(primera).toHaveTextContent('18 de 100');
    expect(primera).toHaveTextContent('$54.000');
    expect(primera).toHaveTextContent('Activo');
    expect(
      within(primera!).getByRole('link', { name: 'LOREAL20' }),
    ).toHaveAttribute('href', '/panel/cupones/7');
    expect(segunda).toHaveTextContent('$5.000');
    expect(segunda).toHaveTextContent('Todo el pedido');
    expect(segunda).toHaveTextContent('Campaña «Novedades»');
    expect(segunda).toHaveTextContent('Inactivo');
  });

  it('SCRUM-150 · listado vacío: lo dice', async () => {
    simularBackend({ [`GET ${RUTA}`]: () => Response.json([]) });
    mostrar(<PantallaCupones />);
    expect(await screen.findByText(/Aún no hay cupones/)).toBeInTheDocument();
  });

  it('SCRUM-150 · crear: por marca, con tope, solo para una campaña; envía lo elegido al backend', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend();
    mostrar(<PantallaCuponNuevo />);

    await usuario.type(screen.getByLabelText(/Código/), 'loreal20');
    await usuario.type(
      screen.getByLabelText('Descripción para el cliente'),
      '20 % en Loreal',
    );
    await usuario.type(screen.getByLabelText('Porcentaje de descuento'), '20');
    await usuario.type(
      screen.getByLabelText('Tope del descuento (opcional)'),
      '10000',
    );
    await usuario.click(
      screen.getByRole('radio', { name: 'Categorías y marcas' }),
    );
    await usuario.click(await screen.findByRole('button', { name: 'Marca' }));
    await usuario.click(
      await screen.findByRole('menuitemcheckbox', { name: 'Loreal' }),
    );
    await usuario.keyboard('{Escape}');
    await usuario.selectOptions(
      await screen.findByLabelText('Campaña'),
      'Solo quienes recibieron «Novedades Loreal»',
    );
    await usuario.click(screen.getByRole('button', { name: 'Guardar cupón' }));

    expect(await screen.findByText('Cupón guardado.')).toBeInTheDocument();
    const [cuerpo] = pedidas(`POST ${RUTA}`) as DatosCupon[];
    expect(cuerpo).toMatchObject({
      codigo: 'loreal20',
      descripcion: '20 % en Loreal',
      tipoDescuento: 'porcentaje',
      valor: 20,
      topeDescuento: 10000,
      alcance: 'categorias_marcas',
      marcas: [5],
      categorias: [],
      articulos: [],
      campanaId: 12,
      usosPorCuenta: 1,
      activo: true,
    });
    expect(
      screen.getByRole('heading', { name: 'Editar cupón' }),
    ).toBeInTheDocument();
  });

  it('SCRUM-150 · crear: sin código ni valor avisa junto a cada campo y no llama al backend', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend();
    mostrar(<PantallaCuponNuevo />);

    await usuario.click(screen.getByRole('button', { name: 'Guardar cupón' }));

    expect(
      await screen.findByText('Escribe el código del cupón.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Indica el valor del descuento.'),
    ).toBeInTheDocument();
    expect(pedidas(`POST ${RUTA}`)).toHaveLength(0);
  });

  it('SCRUM-150 · crear: el rechazo del backend queda junto al campo que indica', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      [`POST ${RUTA}`]: () =>
        Response.json(
          {
            statusCode: 409,
            message: 'Ya existe un cupón con ese código.',
            errores: [
              {
                campo: 'codigo',
                mensaje: 'Ya existe un cupón con ese código.',
              },
            ],
          },
          { status: 409 },
        ),
    });
    mostrar(<PantallaCuponNuevo />);

    await usuario.type(screen.getByLabelText(/Código/), 'REPETIDO');
    await usuario.type(screen.getByLabelText('Porcentaje de descuento'), '10');
    await usuario.click(screen.getByRole('button', { name: 'Guardar cupón' }));

    const mensaje = await screen.findByText(
      'Ya existe un cupón con ese código.',
    );
    expect(screen.getByLabelText(/Código/)).toHaveAttribute(
      'aria-describedby',
      mensaje.id,
    );
    expect(screen.getByLabelText(/Código/)).toHaveValue('REPETIDO');
  });

  it('SCRUM-150 · editar: abre lo guardado, avisa que ya se usó y guarda con PATCH', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend({
      [`GET ${RUTA}/7`]: () => Response.json(cupon()),
      [`PATCH ${RUTA}/7`]: () => Response.json(cupon({ activo: false })),
    });
    mostrar(<PantallaEditarCupon id="7" />);

    expect(await screen.findByLabelText(/Código/)).toHaveValue('LOREAL20');
    expect(screen.getByText(/Ya se usó en 18 pedidos/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('switch'));
    await usuario.click(screen.getByRole('button', { name: 'Guardar cupón' }));

    await waitFor(() =>
      expect(pedidas(`PATCH ${RUTA}/7`)[0]).toMatchObject({
        activo: false,
        marcas: [5],
      }),
    );
  });

  it('SCRUM-150 · solo quien gestiona campañas abre Cupones', () => {
    expect(puedeAbrir('administrador', '/panel/cupones')).toBe(true);
    expect(puedeAbrir('vendedor', '/panel/cupones')).toBe(false);
    expect(puedeAbrir('bodeguero', '/panel/cupones/7')).toBe(false);
  });
});
