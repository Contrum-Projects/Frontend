import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type {
  ListadoRegistroErrores,
  RegistroError,
} from './consultasRegistroErrores';
import { PantallaRegistroErrores } from './pantallaRegistroErrores';

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

const ERROR_API: RegistroError = {
  codigoSeguimiento: '3f1c2b9e-8a7d-4e0b-9a51-2c4d6e8f0a1b',
  fechaHora: '2026-11-20T17:02:40.000Z',
  origen: 'api',
  componente: 'GenerarOtService.generar',
  metodo: 'PATCH',
  ruta: '/api/pedidos/BB50C63834F3/estado',
  estadoHttp: 503,
  tipoError: 'ServiceUnavailableException',
  mensaje: 'Chilexpress no respondió.',
  traza: 'at GenerarOtService.generar (file:///app/dist/x.js:1:1)',
  cuenta: {
    codigoPublico: 'a1b2c3d4-0000-4000-8000-000000000001',
    nombre: 'Violeta Ramírez',
    email: 'violeta@correo.cl',
  },
};
const ERROR_NAVEGADOR: RegistroError = {
  ...ERROR_API,
  codigoSeguimiento: '7d0e4a21-1111-4000-8000-000000000002',
  origen: 'navegador',
  componente: 'pantalla /carrito',
  metodo: null,
  ruta: '/carrito',
  estadoHttp: null,
  tipoError: 'TypeError',
  mensaje: 'x is undefined',
  traza: null,
  cuenta: null,
};

const listado = (
  items: RegistroError[],
  cambios: Partial<ListadoRegistroErrores> = {},
): ListadoRegistroErrores => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
  conteos: { todos: 2, api: 1, navegador: 1, servidorWeb: 0 },
  diasRetencion: 90,
  ...cambios,
});

const simularBackend = (responder: (url: URL) => Response) => {
  const urls: URL[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const url = new URL(peticion.url);
      urls.push(url);
      return responder(url);
    }),
  );
  return { urls };
};

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaRegistroErrores />
    </QueryClientProvider>,
  );

beforeEach(() => {
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'admin-1',
        nombre: 'Violeta',
        apellido: 'Ramírez',
        rol: 'administrador',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Registro de errores (SCRUM-168)', () => {
  it('SCRUM-168 FE · muestra qué pasó, cuándo, en qué componente, el origen y el código corto', async () => {
    simularBackend(() => Response.json(listado([ERROR_API, ERROR_NAVEGADOR])));
    mostrar();

    const tabla = await screen.findByRole('table');
    const fila = within(tabla)
      .getByRole('button', { name: 'GenerarOtService.generar' })
      .closest('tr') as HTMLElement;
    expect(
      within(fila).getByText(
        'ServiceUnavailableException: Chilexpress no respondió.',
      ),
    ).toBeVisible();
    expect(within(fila).getByText('Backend')).toBeVisible();
    expect(within(fila).getByText('3F1C2B9E')).toBeVisible();
    expect(within(fila).getByText(/20 nov 2026/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Navegador · 1' })).toBeVisible();
    expect(screen.getByText(/se guarda 90 días/)).toBeVisible();
  });

  it('SCRUM-168 FE · el detalle trae la ruta, la cuenta y la traza', async () => {
    simularBackend(() => Response.json(listado([ERROR_API])));
    const usuario = userEvent.setup();
    mostrar();

    const tabla = await screen.findByRole('table');
    await usuario.click(
      within(tabla).getByRole('button', { name: 'GenerarOtService.generar' }),
    );

    const dialogo = await screen.findByRole('dialog');
    expect(
      within(dialogo).getByText('PATCH /api/pedidos/BB50C63834F3/estado'),
    ).toBeVisible();
    expect(
      within(dialogo).getByRole('link', {
        name: 'Violeta Ramírez · violeta@correo.cl',
      }),
    ).toBeVisible();
    expect(within(dialogo).getByText(/at GenerarOtService/)).toBeVisible();
  });

  it('SCRUM-168 FE · buscar por código y filtrar por origen se piden al backend', async () => {
    const { urls } = simularBackend(() => Response.json(listado([ERROR_API])));
    const usuario = userEvent.setup();
    mostrar();
    await screen.findByRole('table');

    await usuario.click(screen.getByRole('button', { name: 'Navegador · 1' }));
    await usuario.type(
      screen.getByRole('searchbox', {
        name: 'Buscar errores por código, componente o mensaje',
      }),
      '3F1C2B9E',
    );

    await waitFor(() => {
      const ultima = urls.at(-1);
      expect(ultima?.pathname).toBe('/api/registros/errores');
      expect(ultima?.searchParams.get('origen')).toBe('navegador');
      expect(ultima?.searchParams.get('buscar')).toBe('3F1C2B9E');
    });
  });

  it('SCRUM-168 FE · sin errores muestra el estado vacío', async () => {
    simularBackend(() =>
      Response.json(
        listado([], {
          conteos: { todos: 0, api: 0, navegador: 0, servidorWeb: 0 },
        }),
      ),
    );
    mostrar();

    expect(
      await screen.findByText('No hay errores registrados.'),
    ).toBeVisible();
  });

  it('SCRUM-168 FE · sin permiso muestra el mensaje del backend', async () => {
    simularBackend(() =>
      Response.json(
        { statusCode: 403, message: 'No tienes permiso para hacer esto.' },
        { status: 403 },
      ),
    );
    mostrar();

    expect(
      await screen.findByText('No tienes permiso para hacer esto.'),
    ).toBeVisible();
  });
});
