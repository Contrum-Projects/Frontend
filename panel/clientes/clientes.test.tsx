import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import type {
  ClienteDetalle,
  ClienteListado,
  ListadoClientes,
} from './consultasClientes';
import { DetalleCliente } from './detalleCliente';
import { PantallaClientes } from './pantallaClientes';

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

const CODIGO = '3f2b8c1e-6d4a-4f7e-9a10-5b6c7d8e9f01';

const CLIENTA: ClienteListado = {
  codigoPublico: 'a1b2c3d4-0000-4000-8000-000000000001',
  nombre: 'Daniela',
  apellido: 'Fuentes',
  email: 'daniela.fuentes@correo.cl',
  rut: null,
  rol: 'cliente',
  activo: true,
  fechaRegistro: '2026-10-02T14:20:00.000Z',
  correoConfirmado: true,
};
const PELUQUERA: ClienteListado = {
  codigoPublico: CODIGO,
  nombre: 'Macarena',
  apellido: 'Villagrán',
  email: 'maca.salon@correo.cl',
  rut: '15432876-9',
  rol: 'profesional',
  activo: true,
  fechaRegistro: '2026-09-18T11:05:00.000Z',
  correoConfirmado: true,
};

const listado = (
  items: ClienteListado[],
  cambios: Partial<ListadoClientes> = {},
): ListadoClientes => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
  conteos: { todos: 2, clientes: 1, profesionales: 1, desactivados: 0 },
  ...cambios,
});

const detalle = (cambios: Partial<ClienteDetalle> = {}): ClienteDetalle => ({
  ...PELUQUERA,
  telefono: '+56987654321',
  aceptaMarketingEmail: true,
  perfilProfesional: {
    anosExperiencia: 7,
    modalidad: 'salon_propio',
    especialidades: ['corte_dama', 'mechas_balayage'],
    nombreLugarTrabajo: 'Salón Maca',
    redSocial: null,
    comuna: 'Ñuñoa',
  },
  verificacion: {
    estado: 'aprobada',
    fechaSolicitud: '2026-09-20T10:00:00.000Z',
    fechaResolucion: '2026-09-21T10:00:00.000Z',
  },
  pedidos: 4,
  historialRol: [
    {
      rolAnterior: 'cliente',
      rolNuevo: 'profesional',
      motivo: null,
      fechaCambio: '2026-09-21T10:00:00.000Z',
      responsable: 'Violeta Ramírez',
    },
  ],
  ...cambios,
});

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde cada petición por «MÉTODO /ruta»; guarda las peticiones para revisarlas. */
const simularBackend = (rutas: Record<string, Manejador>) => {
  const peticiones: Request[] = [];
  const fetch = vi.fn(async (peticion: Request) => {
    peticiones.push(peticion.clone());
    const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
    const manejador = rutas[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return { peticiones };
};

const error = (status: number, message: string) =>
  Response.json({ statusCode: status, message }, { status });

const mostrar = (contenido: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {contenido}
      <Toaster />
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

describe('Pantalla Clientes (SCRUM-155)', () => {
  it('E13-H4 FE · listado: la tabla muestra rol, estado y registro, con los conteos en los filtros', async () => {
    simularBackend({
      'GET /api/clientes': () => Response.json(listado([CLIENTA, PELUQUERA])),
    });
    mostrar(<PantallaClientes />);

    const tabla = await screen.findByRole('table');
    const fila = within(tabla)
      .getByText('Macarena Villagrán')
      .closest('tr') as HTMLElement;
    expect(within(fila).getByText('Profesional')).toBeVisible();
    expect(within(fila).getByText('Activa')).toBeVisible();
    expect(
      within(fila).getByRole('link', { name: 'Macarena Villagrán' }),
    ).toHaveAttribute('href', `/panel/clientes/${CODIGO}`);
    expect(
      screen.getByRole('button', { name: 'Profesionales · 1' }),
    ).toBeVisible();
  });

  it('E13-H4 FE · listado: filtrar y buscar piden al backend el rol y el texto', async () => {
    const { peticiones } = simularBackend({
      'GET /api/clientes': () => Response.json(listado([PELUQUERA])),
    });
    mostrar(<PantallaClientes />);
    await screen.findByRole('table');

    await userEvent.click(
      screen.getByRole('button', { name: /^Profesionales/ }),
    );
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar clientes' }),
      '15.432.876-9',
    );

    await waitFor(() => {
      const url = new URL(peticiones.at(-1)!.url);
      expect(url.searchParams.get('rol')).toBe('profesional');
      expect(url.searchParams.get('buscar')).toBe('15.432.876-9');
      expect(url.searchParams.get('pagina')).toBe('1');
    });
  });

  it('E13-H4 FE · listado: sin resultados, el estado vacío lo dice', async () => {
    simularBackend({
      'GET /api/clientes': () => Response.json(listado([])),
    });
    mostrar(<PantallaClientes />);

    expect(
      await screen.findByText('Aún no hay cuentas de clientes.'),
    ).toBeVisible();
  });
});

describe('Detalle de un cliente (SCRUM-155)', () => {
  it('E13-H4 FE · detalle: muestra sus datos, el perfil profesional, la verificación y el historial de rol', async () => {
    simularBackend({
      [`GET /api/clientes/${CODIGO}`]: () => Response.json(detalle()),
    });
    mostrar(<DetalleCliente codigo={CODIGO} />);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Macarena Villagrán',
      }),
    ).toBeVisible();
    expect(screen.getByText('15.432.876-9')).toBeVisible();
    expect(screen.getByText('Salón propio')).toBeVisible();
    expect(screen.getByText('Ñuñoa')).toBeVisible();
    expect(screen.getByText('Aprobada')).toBeVisible();
    expect(screen.getByText('Cliente a Profesional')).toBeVisible();
    expect(screen.getByText(/por Violeta Ramírez/)).toBeVisible();
  });

  it('E13-H4 FE · detalle: una cuenta que no existe o es del personal muestra que no se encontró', async () => {
    simularBackend({
      [`GET /api/clientes/${CODIGO}`]: () =>
        error(404, 'No existe esa cuenta de cliente o profesional.'),
    });
    mostrar(<DetalleCliente codigo={CODIGO} />);

    expect(
      await screen.findByRole('heading', {
        name: 'No encontramos esta cuenta',
      }),
    ).toBeVisible();
  });

  it('E13-H4 FE · quitar rol profesional: no deja guardar sin motivo y envía el cambio con él', async () => {
    let cuenta = detalle();
    const { peticiones } = simularBackend({
      [`GET /api/clientes/${CODIGO}`]: () => Response.json(cuenta),
      [`PATCH /api/cuentas/${CODIGO}/rol`]: () => {
        cuenta = detalle({ rol: 'cliente' });
        return Response.json({});
      },
    });
    mostrar(<DetalleCliente codigo={CODIGO} />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Pasar a cliente' }),
    );
    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByText(/Rige de inmediato/)).toBeVisible();

    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Pasar a cliente' }),
    );
    expect(
      await within(dialogo).findByText(
        'El motivo es obligatorio al quitar el rol profesional.',
      ),
    ).toBeVisible();
    expect(peticiones.some((p) => p.method === 'PATCH')).toBe(false);

    await userEvent.type(
      within(dialogo).getByRole('textbox', { name: /Motivo/ }),
      '  Dejó de ejercer según nos informó.  ',
    );
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Pasar a cliente' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    const cambio = peticiones.find((p) => p.method === 'PATCH')!;
    expect(await cambio.json()).toEqual({
      rol: 'cliente',
      motivo: 'Dejó de ejercer según nos informó.',
    });
    expect(
      await screen.findByText(
        'Macarena Villagrán ahora tiene una cuenta de cliente.',
      ),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Pasar a cliente' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('E13-H4 FE · desactivar: pide confirmación y muestra la cuenta como desactivada', async () => {
    let cuenta = detalle();
    const { peticiones } = simularBackend({
      [`GET /api/clientes/${CODIGO}`]: () => Response.json(cuenta),
      [`POST /api/clientes/${CODIGO}/desactivar`]: () => {
        cuenta = detalle({ activo: false });
        return new Response(null, { status: 204 });
      },
    });
    mostrar(<DetalleCliente codigo={CODIGO} />);

    await userEvent.click(
      await screen.findByRole('switch', { name: 'Cuenta activa' }),
    );
    const dialogo = await screen.findByRole('alertdialog');
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Desactivar' }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: 'Cuenta activa' }),
      ).not.toBeChecked(),
    );
    expect(
      screen.getByText('No puede iniciar sesión. Sus pedidos se mantienen.'),
    ).toBeVisible();
    expect(peticiones.some((p) => p.method === 'POST')).toBe(true);
  });

  it('E13-H4 FE · reactivar: una cuenta desactivada se reactiva con confirmación', async () => {
    let cuenta = detalle({ activo: false });
    simularBackend({
      [`GET /api/clientes/${CODIGO}`]: () => Response.json(cuenta),
      [`POST /api/clientes/${CODIGO}/reactivar`]: () => {
        cuenta = detalle();
        return new Response(null, { status: 204 });
      },
    });
    mostrar(<DetalleCliente codigo={CODIGO} />);

    // Desactivada: no se ofrece pasar a cliente (el backend responde 409)
    await screen.findByRole('switch', { name: 'Cuenta activa' });
    expect(
      screen.queryByRole('button', { name: 'Pasar a cliente' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('switch', { name: 'Cuenta activa' }),
    );
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Reactivar',
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: 'Cuenta activa' }),
      ).toBeChecked(),
    );
  });

  it('E13-H4 FE · errores: el servidor rechaza el cambio, se muestra su mensaje y la cuenta conserva su estado', async () => {
    simularBackend({
      [`GET /api/clientes/${CODIGO}`]: () => Response.json(detalle()),
      [`POST /api/clientes/${CODIGO}/desactivar`]: () =>
        error(403, 'Tu cuenta ya no tiene acceso al panel.'),
    });
    mostrar(<DetalleCliente codigo={CODIGO} />);

    await userEvent.click(
      await screen.findByRole('switch', { name: 'Cuenta activa' }),
    );
    const dialogo = await screen.findByRole('alertdialog');
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Desactivar' }),
    );

    expect(
      await within(dialogo).findByText(
        'Tu cuenta ya no tiene acceso al panel.',
      ),
    ).toBeVisible();
    // Al cerrar el diálogo, la cuenta sigue activa
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Cancelar' }),
    );
    expect(
      await screen.findByRole('switch', { name: 'Cuenta activa' }),
    ).toBeChecked();
  });
});
