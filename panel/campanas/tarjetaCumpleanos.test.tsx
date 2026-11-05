import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CambioSaludoCumpleanos,
  SaludoCumpleanos,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { TarjetaCumpleanos } from './tarjetaCumpleanos';

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

const RUTA = '/api/gestion/campanas/cumpleanos';

const SALUDO: SaludoCumpleanos = {
  activo: false,
  incluyeOferta: false,
  asunto: 'Feliz cumpleaños, {nombre}',
  programadosEsteMes: 87,
  porcentajeAperturaUltimoMes: 63,
};

type Manejador = (cambio: CambioSaludoCumpleanos) => Response;

/** GET responde `inicial`; PATCH, lo que diga `alCambiar` (por omisión, lo pedido aplicado). */
const simularBackend = (
  inicial: SaludoCumpleanos,
  alCambiar: Manejador = (cambio) => Response.json({ ...inicial, ...cambio }),
) => {
  const cambios: CambioSaludoCumpleanos[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const { pathname } = new URL(peticion.url);
      if (pathname !== RUTA)
        throw new Error(`Petición no simulada: ${pathname}`);
      if (peticion.method === 'GET') return Response.json(inicial);
      const cambio = (await peticion.json()) as CambioSaludoCumpleanos;
      cambios.push(cambio);
      return alCambiar(cambio);
    }),
  );
  return { cambios };
};

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <TarjetaCumpleanos />
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

describe('Saludo de cumpleaños (SCRUM-141)', () => {
  it('E12-H5 FE · CA1 activar: al activar el saludo lo guarda y la tarjeta muestra el estado activo', async () => {
    const usuario = userEvent.setup();
    const { cambios } = simularBackend(SALUDO);
    mostrar();

    const saludo = await screen.findByRole('switch', {
      name: 'Saludo de cumpleaños',
    });
    expect(saludo).not.toBeChecked();

    await usuario.click(saludo);

    expect(cambios).toEqual([{ activo: true }]);
    await waitFor(() => expect(saludo).toBeChecked());
    await waitFor(() => expect(saludo).not.toHaveAttribute('aria-disabled'));
    expect(saludo).toHaveFocus();
  });

  it('E12-H5 FE · CA1 activar: si el backend rechaza, vuelve al estado guardado y muestra su mensaje', async () => {
    const usuario = userEvent.setup();
    simularBackend(SALUDO, () =>
      Response.json(
        { statusCode: 403, message: 'No tienes permiso para esta acción.' },
        { status: 403 },
      ),
    );
    mostrar();

    const saludo = await screen.findByRole('switch', {
      name: 'Saludo de cumpleaños',
    });
    await usuario.click(saludo);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para esta acción.',
    );
    expect(saludo).not.toBeChecked();
  });

  it('E12-H5 FE · CA2 oferta opcional: con el saludo inactivo no se puede incluir la oferta', async () => {
    simularBackend(SALUDO);
    mostrar();

    expect(
      await screen.findByRole('switch', { name: 'Incluir oferta' }),
    ).toBeDisabled();
  });

  it('E12-H5 FE · CA2 oferta opcional: con el saludo activo, incluir y quitar la oferta lo guarda y la tarjeta lo refleja', async () => {
    const usuario = userEvent.setup();
    const { cambios } = simularBackend({ ...SALUDO, activo: true });
    mostrar();

    const oferta = await screen.findByRole('switch', {
      name: 'Incluir oferta',
    });
    expect(oferta).toBeEnabled();
    expect(oferta).not.toBeChecked();

    await usuario.click(oferta);
    await waitFor(() => expect(oferta).toBeChecked());

    // Terminó de guardar: el interruptor sigue enfocado y vuelve a aceptar cambios
    await waitFor(() => expect(oferta).not.toHaveAttribute('aria-disabled'));
    expect(oferta).toHaveFocus();
    await usuario.click(oferta);
    await waitFor(() => expect(oferta).not.toBeChecked());

    expect(cambios).toEqual([
      { incluyeOferta: true },
      { incluyeOferta: false },
    ]);
  });

  it('E12-H5 FE · cifras: muestra el asunto, los saludos del mes y la apertura que entrega el backend', async () => {
    simularBackend({ ...SALUDO, activo: true });
    mostrar();

    expect(
      await screen.findByText('Feliz cumpleaños, {nombre}'),
    ).toBeInTheDocument();
    expect(screen.getByText('87 saludos programados')).toBeInTheDocument();
    expect(screen.getByText(/63\s?% de apertura/)).toBeInTheDocument();
  });

  it('E12-H5 FE · cifras: sin envíos el mes anterior, la apertura se muestra como «—»', async () => {
    simularBackend({
      ...SALUDO,
      programadosEsteMes: 1,
      porcentajeAperturaUltimoMes: null,
    });
    mostrar();

    expect(await screen.findByText('1 saludo programado')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('E12-H5 FE · carga: si el backend no entrega el saludo, la tarjeta muestra su título y el mensaje', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { statusCode: 403, message: 'No tienes permiso para esta acción.' },
          { status: 403 },
        ),
      ),
    );
    mostrar();

    const tarjeta = await screen.findByRole('region', {
      name: 'Saludo de cumpleaños',
    });
    expect(tarjeta).toHaveTextContent('No tienes permiso para esta acción.');
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
