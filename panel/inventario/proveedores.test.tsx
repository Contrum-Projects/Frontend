import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { Proveedor } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { Toaster } from '@/compartido/ui/sonner';
import { PantallaProveedores } from './pantallaProveedores';

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

vi.mock('next/navigation', () => ({
  usePathname: () => '/panel/inventario/proveedores',
}));

const DISTRIBUIDORA: Proveedor = {
  id: 1,
  rut: '76086428-5',
  razonSocial: 'Distribuidora Capilar SpA',
  nombreContacto: 'Marcela Soto',
  telefono: '+56412345678',
  email: 'ventas@distribuidora.cl',
  activo: true,
  cantidadEntradas: 3,
};
const SIN_CONTACTO: Proveedor = {
  id: 2,
  rut: '77111222-6',
  razonSocial: 'Insumos del Sur Ltda.',
  nombreContacto: null,
  telefono: null,
  email: null,
  activo: true,
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** La lista se lee de `proveedores` en cada GET: lo que agrega un POST se ve al volver a pedirla. */
const simularBackend = (
  inicial: Proveedor[],
  rutas: Record<string, Manejador> = {},
) => {
  const estado = { proveedores: inicial };
  const fetch = vi.fn(async (peticion: Request) => {
    const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
    if (clave === 'GET /api/inventario/proveedores') {
      return Response.json(estado.proveedores);
    }
    const manejador = rutas[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return { estado, fetch };
};

const error = (status: number, message: string | string[]) =>
  Response.json({ statusCode: status, message }, { status });

const ingresarComo = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: { codigoPublico: 'u-1', nombre: 'Jorge', apellido: 'Pino', rol },
    }),
  );

const mostrarPantalla = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaProveedores />
      <Toaster />
    </QueryClientProvider>,
  );

/** La tabla de escritorio y la lista de celular están las dos en el DOM (las oculta el CSS). */
const tabla = () => screen.getByRole('table');
const filaDe = (razonSocial: string) =>
  within(tabla()).getByText(razonSocial).closest('tr') as HTMLElement;
const listaCelular = () =>
  screen
    .getAllByRole('list')
    .find((lista) => lista.closest('nav') === null) as HTMLElement;

const abrirFormulario = async () => {
  await userEvent.click(
    screen.getAllByRole('button', { name: 'Nuevo proveedor' })[0],
  );
  return screen.findByRole('form', { name: 'Nuevo proveedor' });
};

beforeEach(() => {
  reiniciarParaPruebas();
  ingresarComo('bodeguero');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Pantalla Proveedores (SCRUM-110)', () => {
  it('E11-H1 FE · listado: en escritorio, muestra RUT, razón social, contacto y entradas de cada proveedor', async () => {
    simularBackend([DISTRIBUIDORA, SIN_CONTACTO]);
    mostrarPantalla();

    await screen.findByRole('table');
    expect(
      within(tabla())
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual([
      'Razón social',
      'RUT',
      'Contacto',
      'Correo',
      'Teléfono',
      'Entradas',
    ]);
    const fila = filaDe('Distribuidora Capilar SpA');
    expect(
      within(fila)
        .getAllByRole('cell')
        .map((celda) => celda.textContent),
    ).toEqual([
      'Distribuidora Capilar SpA',
      '76.086.428-5',
      'Marcela Soto',
      'ventas@distribuidora.cl',
      '+56412345678',
      '3',
    ]);
  });

  it('E11-H1 FE · listado: sin la cantidad de entradas del backend, muestra «—»', async () => {
    simularBackend([SIN_CONTACTO]);
    mostrarPantalla();

    await screen.findByRole('table');
    expect(
      within(filaDe('Insumos del Sur Ltda.')).getAllByRole('cell')[5],
    ).toHaveTextContent('—');
  });

  it('E11-H1 FE · listado: en celular, cada fila muestra RUT, contacto y entradas', async () => {
    simularBackend([DISTRIBUIDORA, SIN_CONTACTO]);
    mostrarPantalla();
    await screen.findByRole('table');
    const [distribuidora, sinContacto] =
      within(listaCelular()).getAllByRole('listitem');

    expect(distribuidora).toHaveTextContent('76.086.428-5 · Marcela Soto');
    expect(distribuidora).toHaveTextContent(
      'ventas@distribuidora.cl · +56412345678',
    );
    expect(distribuidora).toHaveTextContent('Entradas: 3');
    expect(sinContacto).toHaveTextContent('77.111.222-6');
    expect(sinContacto).not.toHaveTextContent('·');
  });

  it('E11-H1 FE · listado: el buscador filtra por razón social o por RUT', async () => {
    simularBackend([DISTRIBUIDORA, SIN_CONTACTO]);
    mostrarPantalla();
    await screen.findByRole('table');
    const [buscador] = screen.getAllByRole('searchbox', {
      name: 'Buscar proveedores',
    });

    await userEvent.type(buscador, 'insumos');
    expect(within(tabla()).queryByText('Distribuidora Capilar SpA')).toBeNull();
    expect(within(tabla()).getByText('Insumos del Sur Ltda.')).toBeVisible();

    await userEvent.clear(buscador);
    await userEvent.type(buscador, '76.086');
    expect(
      within(tabla()).getByText('Distribuidora Capilar SpA'),
    ).toBeVisible();
    expect(within(tabla()).queryByText('Insumos del Sur Ltda.')).toBeNull();

    await userEvent.clear(buscador);
    await userEvent.type(buscador, 'nada');
    expect(
      screen.getAllByText('Ningún proveedor coincide con «nada».')[0],
    ).toBeVisible();
  });

  it('E11-H1 FE · listado: sin proveedores, lo dice', async () => {
    simularBackend([]);
    mostrarPantalla();

    expect(
      await screen.findByText('Aún no hay proveedores.'),
    ).toBeInTheDocument();
  });

  it('E11-H1 FE · listado: si la API falla, muestra el error sin detalles técnicos', async () => {
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

  it('E11-H1 FE · nuevo proveedor: al guardar aparece en la lista', async () => {
    const nuevo: Proveedor = {
      id: 3,
      rut: '78900123-5',
      razonSocial: 'Cosmética Austral SpA',
      nombreContacto: 'Pedro Castro',
      telefono: null,
      email: null,
      activo: true,
    };
    const { estado, fetch } = simularBackend([DISTRIBUIDORA], {
      'POST /api/inventario/proveedores': () => {
        estado.proveedores = [nuevo, DISTRIBUIDORA];
        return Response.json(nuevo, { status: 201 });
      },
    });
    mostrarPantalla();
    await screen.findByRole('table');

    const formulario = await abrirFormulario();
    await userEvent.type(
      within(formulario).getByLabelText('Razón social'),
      'Cosmética Austral SpA',
    );
    await userEvent.type(
      within(formulario).getByLabelText('RUT'),
      '78.900.123-5',
    );
    await userEvent.type(
      within(formulario).getByLabelText('Nombre de contacto (opcional)'),
      'Pedro Castro',
    );
    await userEvent.click(
      within(formulario).getByRole('button', { name: 'Guardar proveedor' }),
    );

    expect(
      await screen.findByText('Registramos a Cosmética Austral SpA.'),
    ).toBeInTheDocument();
    expect(
      await within(tabla()).findByText('Cosmética Austral SpA'),
    ).toBeVisible();
    const creacion = fetch.mock.calls
      .map(([peticion]) => peticion)
      .find((peticion) => peticion.method === 'POST');
    expect(await creacion?.json()).toEqual({
      rut: '78900123-5',
      razonSocial: 'Cosmética Austral SpA',
      nombreContacto: 'Pedro Castro',
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('form', { name: 'Nuevo proveedor' }),
      ).toBeNull(),
    );
  });

  it('E11-H1 FE · nuevo proveedor: avisa de los datos que faltan sin llamar a la API', async () => {
    const { fetch } = simularBackend([DISTRIBUIDORA]);
    mostrarPantalla();
    await screen.findByRole('table');

    const formulario = await abrirFormulario();
    await userEvent.type(
      within(formulario).getByLabelText('RUT'),
      '11.111.111-2',
    );
    await userEvent.click(
      within(formulario).getByRole('button', { name: 'Guardar proveedor' }),
    );

    expect(
      await within(formulario).findByText('La razón social es obligatoria.'),
    ).toBeVisible();
    expect(within(formulario).getByText('El RUT no es válido.')).toBeVisible();
    expect(fetch.mock.calls.some(([p]) => p.method === 'POST')).toBe(false);
  });

  it('E11-H1 FE · RUT repetido: muestra el error del servidor junto al RUT sin perder lo escrito', async () => {
    simularBackend([DISTRIBUIDORA], {
      'POST /api/inventario/proveedores': () =>
        error(409, 'Ya existe un proveedor con ese RUT.'),
    });
    mostrarPantalla();
    await screen.findByRole('table');

    const formulario = await abrirFormulario();
    await userEvent.type(
      within(formulario).getByLabelText('Razón social'),
      'Otra Distribuidora SpA',
    );
    const rut = within(formulario).getByLabelText('RUT');
    await userEvent.type(rut, '76.086.428-5');
    await userEvent.click(
      within(formulario).getByRole('button', { name: 'Guardar proveedor' }),
    );

    expect(
      await within(formulario).findByText(
        'Ya existe un proveedor con ese RUT.',
      ),
    ).toBeVisible();
    expect(rut).toHaveAttribute('aria-invalid', 'true');
    expect(rut).toHaveValue('76.086.428-5');
    expect(within(formulario).getByLabelText('Razón social')).toHaveValue(
      'Otra Distribuidora SpA',
    );
  });

  it('E11-H1 FE · pestañas: el bodeguero ve las cuatro y «Proveedores» marcada', async () => {
    simularBackend([]);
    mostrarPantalla();

    const pestanas = screen.getByRole('navigation', { name: 'Inventario' });
    expect(
      within(pestanas)
        .getAllByRole('link')
        .map((enlace) => enlace.textContent),
    ).toEqual(['Stock', 'Movimientos', 'Entradas', 'Proveedores']);
    expect(
      within(pestanas).getByRole('link', { name: 'Proveedores' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('E11-H1 FE · pestañas: el vendedor no ve «Entradas» ni «Proveedores»', () => {
    ingresarComo('vendedor');
    simularBackend([]);
    mostrarPantalla();

    expect(
      within(screen.getByRole('navigation', { name: 'Inventario' }))
        .getAllByRole('link')
        .map((enlace) => enlace.textContent),
    ).toEqual(['Stock', 'Movimientos']);
  });
});
