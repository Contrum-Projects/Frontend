import {
  QueryClientProvider,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { Toaster } from '@/compartido/ui/sonner';
import { DisenoPanel } from './disenoPanel';

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

const navegacion = vi.hoisted(() => ({ replace: vi.fn(), ruta: '/panel' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navegacion.replace }),
  usePathname: () => navegacion.ruta,
}));

const ingresarComo = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Marcela',
        apellido: 'Soto',
        rol,
      },
    }),
  );

const mostrarPanel = (contenido = <h1>Contenido</h1>) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <DisenoPanel>{contenido}</DisenoPanel>
      <Toaster />
    </QueryClientProvider>,
  );

/** El menú lateral (escritorio); la navegación inferior es el segundo «Panel». */
const menuLateral = () =>
  screen.getAllByRole('navigation', { name: 'Panel' })[0];
const navegacionInferior = () =>
  screen.getAllByRole('navigation', { name: 'Panel' })[1];

const textosDe = (zona: HTMLElement) =>
  within(zona)
    .getAllByRole('link')
    .map((enlace) => enlace.textContent);

beforeEach(() => {
  reiniciarParaPruebas();
  navegacion.replace.mockClear();
  navegacion.ruta = '/panel';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Menú del panel según el rol (SCRUM-99)', () => {
  it('E13-H2 FE · opciones por rol: el administrador ve todas las secciones', () => {
    ingresarComo('administrador');
    mostrarPanel();

    expect(textosDe(menuLateral())).toEqual([
      'Inicio',
      'Pedidos',
      'Productos',
      'Inventario',
      'Verificaciones',
      'Campañas',
      'Reportes',
      'Personal',
    ]);
    expect(screen.getByText('Rol: administrador')).toBeInTheDocument();
  });

  it('E13-H2 FE · opciones por rol: el vendedor ve solo catálogo, inventario y pedidos', () => {
    ingresarComo('vendedor');
    mostrarPanel();

    expect(textosDe(menuLateral())).toEqual([
      'Inicio',
      'Pedidos',
      'Productos',
      'Inventario',
    ]);
  });

  it('E13-H2 FE · opciones por rol: el bodeguero no ve productos ni personal', () => {
    ingresarComo('bodeguero');
    mostrarPanel();

    expect(textosDe(menuLateral())).toEqual([
      'Inicio',
      'Pedidos',
      'Inventario',
    ]);
  });

  it('E13-H2 FE · opciones por rol: marca la sección abierta', () => {
    ingresarComo('administrador');
    navegacion.ruta = '/panel/pedidos/CP-10490';
    mostrarPanel();

    expect(
      within(menuLateral()).getByRole('link', { name: 'Pedidos' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(menuLateral()).getByRole('link', { name: 'Inicio' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('E13-H2 FE · opciones por rol: en celular, «Más» abre las secciones que no caben', async () => {
    ingresarComo('administrador');
    mostrarPanel();

    expect(textosDe(navegacionInferior())).toEqual([
      'Inicio',
      'Pedidos',
      'Productos',
      'Inventario',
    ]);
    await userEvent.click(
      within(navegacionInferior()).getByRole('button', { name: 'Más' }),
    );

    const hoja = await screen.findByRole('dialog', { name: 'Más' });
    expect(textosDe(hoja)).toEqual([
      'Verificaciones',
      'Campañas',
      'Reportes',
      'Personal',
    ]);
    expect(
      within(hoja).getByRole('button', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument();
  });

  it('E13-H2 FE · opciones por rol: en celular, el bodeguero solo tiene «Cerrar sesión» en «Más»', async () => {
    ingresarComo('bodeguero');
    mostrarPanel();

    await userEvent.click(
      within(navegacionInferior()).getByRole('button', { name: 'Más' }),
    );

    const hoja = await screen.findByRole('dialog', { name: 'Más' });
    expect(within(hoja).queryAllByRole('link')).toHaveLength(0);
    expect(
      within(hoja).getByRole('button', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument();
  });
});

describe('Acceso denegado (SCRUM-99)', () => {
  it('E13-H2 FE · acceso denegado: una sección que el rol no tiene muestra el aviso y no la página', () => {
    ingresarComo('vendedor');
    navegacion.ruta = '/panel/personal';
    mostrarPanel();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'No tienes acceso a esta sección',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver al inicio' }),
    ).toHaveAttribute('href', '/panel');
  });

  it('E13-H2 FE · acceso denegado: una página con permiso propio también lo exige', () => {
    ingresarComo('vendedor');
    navegacion.ruta = '/panel/inventario/proveedores';
    mostrarPanel();

    expect(
      screen.getByRole('heading', { name: 'No tienes acceso a esta sección' }),
    ).toBeInTheDocument();
  });

  it('E13-H2 FE · acceso denegado: con 403 muestra el aviso y no cambia los datos en pantalla', async () => {
    simularProveedoresCon403();
    ingresarComo('bodeguero');
    navegacion.ruta = '/panel/inventario';
    window.history.pushState({}, '', '/panel/inventario');
    mostrarPanel(<Proveedores />);

    expect(
      await screen.findByText('Distribuidora Capilar SpA'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(
      await screen.findByText('No tienes permiso para gestionar proveedores.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Distribuidora Capilar SpA')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem', { name: 'proveedor' })).toHaveLength(
      1,
    );
  });

  it('E13-H2 FE · acceso denegado: fuera del panel, el 403 lo muestra cada formulario (sin aviso repetido)', async () => {
    simularProveedoresCon403('No puedes modificar esta cuenta.');
    ingresarComo('cliente');
    window.history.pushState({}, '', '/cuenta/datos');
    render(
      <QueryClientProvider client={crearClienteDeConsultas()}>
        <Proveedores />
        <Toaster />
      </QueryClientProvider>,
    );

    await screen.findByText('Distribuidora Capilar SpA');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(await screen.findByText('No se pudo agregar.')).toBeInTheDocument();
    expect(
      screen.queryByText('No puedes modificar esta cuenta.'),
    ).not.toBeInTheDocument();
  });
});

const simularProveedoresCon403 = (
  mensaje = 'No tienes permiso para gestionar proveedores.',
) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) =>
      peticion.method === 'GET'
        ? Response.json([{ razonSocial: 'Distribuidora Capilar SpA' }])
        : Response.json(
            {
              statusCode: 403,
              message: mensaje,
            },
            { status: 403 },
          ),
    ),
  );

describe('Cliente en el panel (SCRUM-99)', () => {
  it.each<Rol>(['cliente', 'profesional'])(
    'E13-H2 FE · cliente en el panel: una cuenta %s va a la tienda',
    async (rol) => {
      ingresarComo(rol);
      mostrarPanel();

      await waitFor(() => expect(navegacion.replace).toHaveBeenCalledWith('/'));
      expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    },
  );

  it('E13-H2 FE · cliente en el panel: sin sesión, va a ingresar y vuelve a la página', async () => {
    navegacion.ruta = '/panel/pedidos';
    act(() => olvidarSesion());
    mostrarPanel();

    await waitFor(() =>
      expect(navegacion.replace).toHaveBeenCalledWith(
        '/ingresar?volver=%2Fpanel%2Fpedidos',
      ),
    );
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('E13-H2 FE · cliente en el panel: con la sesión por confirmar, muestra el esqueleto', () => {
    mostrarPanel();

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    expect(navegacion.replace).not.toHaveBeenCalled();
  });
});

/** Una página del panel cualquiera: lee una lista y tiene una acción. */
function Proveedores() {
  const lista = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () =>
      exigir<{ razonSocial: string }[]>(
        await api.GET('/api/inventario/proveedores'),
      ),
  });
  const agregar = useMutation({
    mutationFn: async () =>
      exigir(
        await api.POST('/api/inventario/proveedores', {
          body: { rut: '76.086.428-5', razonSocial: 'Otra SpA' },
        }),
      ),
  });

  return (
    <>
      <ul>
        {lista.data?.map((proveedor) => (
          <li key={proveedor.razonSocial} aria-label="proveedor">
            {proveedor.razonSocial}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => agregar.mutate()}>
        Agregar
      </button>
      {agregar.isError && <p>No se pudo agregar.</p>}
    </>
  );
}
