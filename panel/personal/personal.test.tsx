import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { CuentaPersonal } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { PantallaPersonal } from './pantallaPersonal';

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

const ADMIN: CuentaPersonal = {
  codigoPublico: 'admin-1',
  nombre: 'Violeta',
  apellido: 'Ramírez',
  email: 'violeta@cabelloperfecto.cl',
  rol: 'administrador',
  activo: true,
  invitacionPendiente: false,
};
const VENDEDORA: CuentaPersonal = {
  codigoPublico: 'vend-1',
  nombre: 'Marcela',
  apellido: 'Díaz',
  email: 'marcela@cabelloperfecto.cl',
  rol: 'vendedor',
  activo: true,
  invitacionPendiente: false,
};
const BODEGUERO_INVITADO: CuentaPersonal = {
  codigoPublico: 'bod-1',
  nombre: 'Jorge',
  apellido: 'Pino',
  email: 'jorge@cabelloperfecto.cl',
  rol: 'bodeguero',
  activo: true,
  invitacionPendiente: true,
};
const DESACTIVADA: CuentaPersonal = {
  codigoPublico: 'vend-2',
  nombre: 'Carla',
  apellido: 'Soto',
  email: 'carla@cabelloperfecto.cl',
  rol: 'vendedor',
  activo: false,
  invitacionPendiente: false,
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/**
 * Backend simulado: la lista se lee de `cuentas` en cada GET, así una acción que la cambia se
 * ve al volver a pedirla. `rutas` responde las demás peticiones por «MÉTODO /ruta».
 */
const simularBackend = (
  inicial: CuentaPersonal[],
  rutas: Record<string, Manejador> = {},
) => {
  const estado = { cuentas: inicial };
  const fetch = vi.fn(async (peticion: Request) => {
    const ruta = new URL(peticion.url).pathname;
    const clave = `${peticion.method} ${ruta}`;
    if (clave === 'GET /api/personal') return Response.json(estado.cuentas);
    const manejador = rutas[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return { estado, fetch };
};

const error = (status: number, message: string) =>
  Response.json({ statusCode: status, message }, { status });

const mostrarPantalla = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaPersonal />
      <Toaster />
    </QueryClientProvider>,
  );

/** La tabla de escritorio y la lista de celular están las dos en el DOM (las oculta el CSS). */
const tabla = () => screen.getByRole('table');
const listaCelular = () => screen.getAllByRole('list')[0];
const filaDe = (nombre: string) =>
  within(tabla()).getByText(nombre).closest('tr') as HTMLElement;

beforeEach(() => {
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: ADMIN.codigoPublico,
        nombre: ADMIN.nombre,
        apellido: ADMIN.apellido,
        rol: 'administrador',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Pantalla Personal (SCRUM-98)', () => {
  it('E13-H1 FE · listado: en escritorio, la tabla muestra rol y estado de cada cuenta', async () => {
    simularBackend([ADMIN, VENDEDORA, BODEGUERO_INVITADO, DESACTIVADA]);
    mostrarPantalla();

    await within(await screen.findByRole('table')).findByText(
      'Violeta Ramírez',
    );
    expect(
      within(tabla())
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual(['Persona', 'Rol', 'Estado', 'Acciones']);
    expect(within(filaDe('Marcela Díaz')).getByText('Vendedor')).toBeVisible();
    expect(within(filaDe('Marcela Díaz')).getByText('Activa')).toBeVisible();
    expect(
      within(filaDe('Jorge Pino')).getByText('Invitación pendiente'),
    ).toBeVisible();
    expect(within(filaDe('Carla Soto')).getByText('Desactivada')).toBeVisible();
    expect(
      within(filaDe('Marcela Díaz')).getByText('marcela@cabelloperfecto.cl'),
    ).toBeVisible();
  });

  it('E13-H1 FE · listado: en celular, la lista muestra rol, estado y un interruptor por cuenta', async () => {
    simularBackend([VENDEDORA, DESACTIVADA]);
    mostrarPantalla();
    await screen.findByRole('table');
    const lista = listaCelular();

    expect(within(lista).getByText('Vendedor')).toBeVisible();
    expect(within(lista).getByText('Vendedor · desactivada')).toBeVisible();
    expect(
      within(lista).getByRole('switch', {
        name: 'Cuenta de Marcela Díaz activa',
      }),
    ).toBeChecked();
    expect(
      within(lista).getByRole('switch', {
        name: 'Cuenta de Carla Soto activa',
      }),
    ).not.toBeChecked();
  });

  it('E13-H1 FE · listado: si la API falla, muestra el error sin detalles técnicos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => error(500, 'PrismaError: boom')),
    );
    mostrarPantalla();

    // Un 5xx se reintenta dos veces antes de mostrarse
    expect(
      await screen.findByRole('alert', {}, { timeout: 6000 }),
    ).toHaveTextContent(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
  }, 10_000);

  it('E13-H1 FE · nueva cuenta: crea la cuenta con el rol elegido y avisa del correo para crear la contraseña', async () => {
    const nueva: CuentaPersonal = {
      codigoPublico: 'nueva-1',
      nombre: 'Diego',
      apellido: 'Fuentes',
      email: 'diego@cabelloperfecto.cl',
      rol: 'bodeguero',
      activo: true,
      invitacionPendiente: true,
    };
    const { estado, fetch } = simularBackend([ADMIN], {
      'POST /api/personal': () => {
        estado.cuentas = [ADMIN, nueva];
        return Response.json(nueva, { status: 201 });
      },
    });
    mostrarPantalla();
    await screen.findByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /Nueva/ }));
    const formulario = await screen.findByRole('form', {
      name: 'Nueva cuenta de personal',
    });
    await userEvent.type(within(formulario).getByLabelText('Nombre'), 'Diego');
    await userEvent.type(
      within(formulario).getByLabelText('Apellido'),
      'Fuentes',
    );
    await userEvent.type(
      within(formulario).getByLabelText('Correo electrónico'),
      'diego@cabelloperfecto.cl',
    );
    await userEvent.click(
      within(formulario).getByRole('radio', { name: /Bodeguero/ }),
    );
    await userEvent.click(
      within(formulario).getByRole('button', { name: 'Crear cuenta' }),
    );

    expect(
      await screen.findByText(
        'Creamos la cuenta de Diego Fuentes. Le enviamos un correo a diego@cabelloperfecto.cl para que cree su contraseña.',
      ),
    ).toBeInTheDocument();
    const creacion = fetch.mock.calls
      .map(([peticion]) => peticion)
      .find((peticion) => peticion.method === 'POST');
    expect(await creacion?.json()).toEqual({
      nombre: 'Diego',
      apellido: 'Fuentes',
      email: 'diego@cabelloperfecto.cl',
      rol: 'bodeguero',
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('form', { name: 'Nueva cuenta de personal' }),
      ).not.toBeInTheDocument(),
    );
    expect(await within(tabla()).findByText('Diego Fuentes')).toBeVisible();
  });

  it('E13-H1 FE · nueva cuenta: sin rol ni datos, marca cada campo y no llama al backend', async () => {
    const { fetch } = simularBackend([ADMIN]);
    mostrarPantalla();
    await screen.findByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /Nueva/ }));
    const formulario = await screen.findByRole('form', {
      name: 'Nueva cuenta de personal',
    });
    await userEvent.click(
      within(formulario).getByRole('button', { name: 'Crear cuenta' }),
    );

    expect(
      await within(formulario).findByText('Escribe el nombre.'),
    ).toBeVisible();
    expect(within(formulario).getByText('Escribe el apellido.')).toBeVisible();
    expect(within(formulario).getByText('Escribe el correo.')).toBeVisible();
    expect(within(formulario).getByText('Elige un rol.')).toBeVisible();
    expect(
      fetch.mock.calls.filter(([peticion]) => peticion.method === 'POST'),
    ).toHaveLength(0);
  });

  it('E13-H1 FE · nueva cuenta: correo ya registrado, muestra el error junto al campo sin perder lo escrito', async () => {
    simularBackend([ADMIN], {
      'POST /api/personal': () => error(409, 'El correo ya está registrado.'),
    });
    mostrarPantalla();
    await screen.findByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /Nueva/ }));
    const formulario = await screen.findByRole('form', {
      name: 'Nueva cuenta de personal',
    });
    await userEvent.type(within(formulario).getByLabelText('Nombre'), 'Diego');
    await userEvent.type(
      within(formulario).getByLabelText('Apellido'),
      'Fuentes',
    );
    const correo = within(formulario).getByLabelText('Correo electrónico');
    await userEvent.type(correo, 'marcela@cabelloperfecto.cl');
    await userEvent.click(
      within(formulario).getByRole('radio', { name: /Vendedor/ }),
    );
    await userEvent.click(
      within(formulario).getByRole('button', { name: 'Crear cuenta' }),
    );

    expect(
      await within(formulario).findByText('El correo ya está registrado.'),
    ).toBeVisible();
    expect(correo).toHaveAttribute('aria-invalid', 'true');
    expect(correo).toHaveValue('marcela@cabelloperfecto.cl');
    expect(within(formulario).getByLabelText('Nombre')).toHaveValue('Diego');
  });

  it('E13-H1 FE · desactivar: en escritorio, pide confirmación y deja la cuenta como desactivada', async () => {
    const { estado } = simularBackend([ADMIN, VENDEDORA], {
      'POST /api/personal/vend-1/desactivar': () => {
        estado.cuentas = [ADMIN, { ...VENDEDORA, activo: false }];
        return new Response(null, { status: 204 });
      },
    });
    mostrarPantalla();
    await screen.findByRole('table');

    await userEvent.click(
      screen.getByRole('button', { name: 'Acciones de Marcela Díaz' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Desactivar cuenta' }),
    );
    const confirmacion = await screen.findByRole('alertdialog', {
      name: '¿Desactivar la cuenta de Marcela Díaz?',
    });
    expect(confirmacion).toHaveTextContent('La cuenta no se borra');
    await userEvent.click(
      within(confirmacion).getByRole('button', { name: 'Desactivar' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    expect(
      await within(filaDe('Marcela Díaz')).findByText('Desactivada'),
    ).toBeVisible();
  });

  it('E13-H1 FE · desactivar: en celular, apagar el interruptor pide confirmación y cancelar no cambia nada', async () => {
    const { fetch } = simularBackend([ADMIN, VENDEDORA]);
    mostrarPantalla();
    await screen.findByRole('table');
    const interruptor = within(listaCelular()).getByRole('switch', {
      name: 'Cuenta de Marcela Díaz activa',
    });

    await userEvent.click(interruptor);
    const confirmacion = await screen.findByRole('alertdialog', {
      name: '¿Desactivar la cuenta de Marcela Díaz?',
    });
    await userEvent.click(
      within(confirmacion).getByRole('button', { name: 'Cancelar' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    expect(interruptor).toBeChecked();
    expect(
      fetch.mock.calls.filter(([peticion]) => peticion.method === 'POST'),
    ).toHaveLength(0);
  });

  it('E13-H1 FE · desactivar: la propia cuenta no se puede desactivar', async () => {
    simularBackend([ADMIN, VENDEDORA]);
    mostrarPantalla();
    await screen.findByRole('table');

    expect(
      within(listaCelular()).getByRole('switch', {
        name: 'Cuenta de Violeta Ramírez activa',
      }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Acciones de Violeta Ramírez' }),
    ).not.toBeInTheDocument();
  });

  it('E13-H1 FE · desactivar: si el backend rechaza, muestra su mensaje en la confirmación', async () => {
    simularBackend([ADMIN, VENDEDORA], {
      'POST /api/personal/vend-1/desactivar': () =>
        error(409, 'No puedes desactivar tu propia cuenta.'),
    });
    mostrarPantalla();
    await screen.findByRole('table');

    await userEvent.click(
      screen.getByRole('button', { name: 'Acciones de Marcela Díaz' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Desactivar cuenta' }),
    );
    const confirmacion = await screen.findByRole('alertdialog');
    await userEvent.click(
      within(confirmacion).getByRole('button', { name: 'Desactivar' }),
    );

    expect(await within(confirmacion).findByRole('alert')).toHaveTextContent(
      'No puedes desactivar tu propia cuenta.',
    );
  });

  it('E13-H1 FE · nueva cuenta: reenviar la invitación pendiente avisa a qué correo se envió', async () => {
    simularBackend([ADMIN, BODEGUERO_INVITADO], {
      'POST /api/personal/bod-1/invitacion': () =>
        new Response(null, { status: 204 }),
    });
    mostrarPantalla();
    await screen.findByRole('table');

    await userEvent.click(
      screen.getByRole('button', { name: 'Acciones de Jorge Pino' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Reenviar invitación' }),
    );

    expect(
      await screen.findByText(
        'Le enviamos una invitación nueva a jorge@cabelloperfecto.cl.',
      ),
    ).toBeInTheDocument();
  });
});
