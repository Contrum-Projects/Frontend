import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  guardarSesion,
  leerEstado,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { CuentaHeader } from '@/tienda/diseno/cuentaHeader';
import { MenuCelular } from '@/tienda/diseno/menuCelular';
import { DATOS } from './cuentaDePrueba';
import { DisenoCuenta } from './disenoCuenta';
import { PantallaMisDatos } from './pantallaMisDatos';

// Cliente igual al de la app, pero con URL absoluta (Node no resuelve rutas relativas) y que
// usa el fetch simulado de cada prueba.
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

const navegacion = vi.hoisted(() => ({ replace: vi.fn(), ruta: '/' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navegacion.replace }),
  usePathname: () => navegacion.ruta,
}));

const iniciarSesion = () =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Camila',
        apellido: 'Rojas',
        rol: 'cliente',
      },
    }),
  );

/** Lo que Mis datos lee al abrirse (SCRUM-97): con la sesión vigente, responde sin anotarlo. */
const lecturaDeCuenta = (peticion: string) =>
  peticion === 'GET /api/cuentas/yo'
    ? Response.json(DATOS)
    : peticion === 'GET /api/cuentas/yo/direcciones'
      ? Response.json([])
      : null;

const describir = (entrada: Request | string, opciones?: RequestInit) =>
  typeof entrada === 'string'
    ? `${opciones?.method ?? 'GET'} ${entrada}`
    : `${entrada.method} ${new URL(entrada.url).pathname}`;

/**
 * Simula el backend: responde según la ruta y anota cada petición como «MÉTODO /ruta». Las
 * lecturas de Mis datos responden bien y no se anotan, salvo con `rechazarLecturas`.
 */
const simularBackend = (
  responder: (peticion: string) => Response,
  { rechazarLecturas = false } = {},
) => {
  const peticiones: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (entrada: Request | string, opciones?: RequestInit) => {
      const peticion = describir(entrada, opciones);
      const lectura = rechazarLecturas ? null : lecturaDeCuenta(peticion);
      if (lectura) return lectura;
      peticiones.push(peticion);
      return responder(peticion);
    }),
  );
  return peticiones;
};

const sinContenido = () => new Response(null, { status: 204 });

const conProveedor = (contenido: ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      {contenido}
    </QueryClientProvider>,
  );

const mostrarMisDatos = () => {
  navegacion.ruta = '/cuenta/datos';
  conProveedor(
    <DisenoCuenta>
      <PantallaMisDatos />
    </DisenoCuenta>,
  );
};

beforeEach(() => {
  reiniciarParaPruebas();
  navegacion.ruta = '/';
});

afterEach(() => {
  reiniciarParaPruebas();
  navegacion.replace.mockReset();
  vi.unstubAllGlobals();
});

describe('SCRUM-95 · Cerrar sesión', () => {
  it('E1-H3 FE · cerrar sesión desde el menú del celular: borra la sesión y muestra el sitio como visitante', async () => {
    const peticiones = simularBackend(sinContenido);
    iniciarSesion();
    conProveedor(
      <>
        <CuentaHeader />
        <MenuCelular categorias={[]} marcas={[]} />
      </>,
    );
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('dialog', { name: 'Menú' });

    await usuario.click(
      within(menu).getByRole('button', { name: 'Cerrar sesión' }),
    );

    expect(peticiones).toEqual(['DELETE /api/cuentas/sesion']);
    expect(leerEstado()).toEqual({ tipo: 'anonima', cierre: 'este' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar',
    );
    expect(navegacion.replace).not.toHaveBeenCalled();
  });

  it('E1-H3 FE · cerrar sesión: sin «Cerrar sesión» en el menú si no hay sesión', async () => {
    act(() => olvidarSesion());
    conProveedor(<MenuCelular categorias={[]} marcas={[]} />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(
      screen.queryByRole('button', { name: 'Cerrar sesión' }),
    ).not.toBeInTheDocument();
  });

  it('E1-H3 FE · cerrar sesión desde Mi cuenta: borra la sesión y lleva al inicio como visitante', async () => {
    const peticiones = simularBackend(sinContenido);
    iniciarSesion();
    mostrarMisDatos();
    const menuCuenta = screen.getByRole('navigation', { name: 'Mi cuenta' });
    expect(within(menuCuenta).getByText('Hola, Camila')).toBeInTheDocument();
    expect(
      within(menuCuenta).getByRole('link', { name: 'Mis datos' }),
    ).toHaveAttribute('aria-current', 'page');

    await userEvent
      .setup()
      .click(within(menuCuenta).getByRole('button', { name: 'Cerrar sesión' }));

    expect(peticiones).toEqual(['DELETE /api/cuentas/sesion']);
    expect(leerEstado()).toMatchObject({ tipo: 'anonima' });
    expect(navegacion.replace).toHaveBeenCalledWith('/');
  });

  it('E1-H3 FE · cerrar sesión sin conexión: avisa y deja la sesión abierta para reintentar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );
    iniciarSesion();
    mostrarMisDatos();
    const menuCuenta = screen.getByRole('navigation', { name: 'Mi cuenta' });

    await userEvent
      .setup()
      .click(within(menuCuenta).getByRole('button', { name: 'Cerrar sesión' }));

    expect(within(menuCuenta).getByRole('alert')).toHaveTextContent(
      'No pudimos cerrar tu sesión. Intenta de nuevo.',
    );
    expect(leerEstado()).toMatchObject({ tipo: 'activa' });
    expect(navegacion.replace).not.toHaveBeenCalled();
  });

  it('E1-H3 FE · cerrar sesión: un doble clic envía un solo cierre', async () => {
    let responder: (respuesta: Response) => void = () => {};
    const peticiones: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (entrada: Request) =>
          new Promise<Response>((resolver) => {
            const peticion = describir(entrada);
            const lectura = lecturaDeCuenta(peticion);
            if (lectura) return resolver(lectura);
            peticiones.push(peticion);
            responder = resolver;
          }),
      ),
    );
    iniciarSesion();
    mostrarMisDatos();
    const boton = within(
      screen.getByRole('navigation', { name: 'Mi cuenta' }),
    ).getByRole('button', { name: 'Cerrar sesión' });
    const usuario = userEvent.setup();

    await usuario.dblClick(boton);
    expect(boton).toBeDisabled();
    await act(async () => responder(sinContenido()));

    expect(peticiones).toEqual(['DELETE /api/cuentas/sesion']);
    expect(leerEstado()).toMatchObject({ tipo: 'anonima' });
  });

  it('E1-H3 FE · cerrar en todos los dispositivos: pide confirmación y, al cancelar, no cierra nada', async () => {
    const peticiones = simularBackend(sinContenido);
    iniciarSesion();
    mostrarMisDatos();
    const usuario = userEvent.setup();

    await usuario.click(
      screen.getByRole('button', { name: 'Cerrar sesión en todos' }),
    );
    const dialogo = screen.getByRole('alertdialog', {
      name: '¿Cerrar sesión en todos tus dispositivos?',
    });
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Cancelar' }),
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(peticiones).toEqual([]);
    expect(leerEstado()).toMatchObject({ tipo: 'activa' });
  });

  it('E1-H3 FE · cerrar en todos los dispositivos: tras confirmar, cierra todas y lleva a iniciar sesión', async () => {
    const peticiones = simularBackend(sinContenido);
    iniciarSesion();
    mostrarMisDatos();
    const usuario = userEvent.setup();

    await usuario.click(
      screen.getByRole('button', { name: 'Cerrar sesión en todos' }),
    );
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Cerrar sesión en todos',
      }),
    );

    expect(peticiones).toEqual(['DELETE /api/cuentas/sesion/todas']);
    expect(leerEstado()).toEqual({ tipo: 'anonima', cierre: 'todos' });
    expect(navegacion.replace).toHaveBeenCalledWith('/ingresar');
  });

  it('E1-H3 FE · cerrar en todos los dispositivos: si el backend falla, avisa en el diálogo y no cierra nada', async () => {
    simularBackend(() => new Response(null, { status: 503 }));
    iniciarSesion();
    mostrarMisDatos();
    const usuario = userEvent.setup();

    await usuario.click(
      screen.getByRole('button', { name: 'Cerrar sesión en todos' }),
    );
    const dialogo = screen.getByRole('alertdialog');
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Cerrar sesión en todos' }),
    );

    expect(within(dialogo).getByRole('alert')).toHaveTextContent(
      'No pudimos cerrar tu sesión. Intenta de nuevo.',
    );
    expect(leerEstado()).toMatchObject({ tipo: 'activa' });
    expect(navegacion.replace).not.toHaveBeenCalled();
  });

  it('E1-H3 FE · cerrar en todos los dispositivos: si la sesión ya estaba cerrada (401), lleva a iniciar sesión', async () => {
    simularBackend(() => new Response(null, { status: 401 }));
    iniciarSesion();
    mostrarMisDatos();
    const usuario = userEvent.setup();

    await usuario.click(
      screen.getByRole('button', { name: 'Cerrar sesión en todos' }),
    );
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Cerrar sesión en todos',
      }),
    );

    expect(leerEstado()).toEqual({ tipo: 'anonima' });
    expect(navegacion.replace).toHaveBeenLastCalledWith(
      '/ingresar?volver=%2Fcuenta%2Fdatos',
    );
  });

  it('E1-H3 FE · sesión revocada: si el servidor la rechaza, lleva a iniciar sesión y de vuelta a la página', async () => {
    // Token revocado y cookie de refresco ya sin efecto: todo responde 401
    const peticiones = simularBackend(
      () => new Response(null, { status: 401 }),
      { rechazarLecturas: true },
    );
    iniciarSesion();
    mostrarMisDatos();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mis datos' }),
    ).toBeInTheDocument();

    // Mis datos pide los datos de la cuenta al abrirse y el servidor los rechaza
    await waitFor(() =>
      expect(navegacion.replace).toHaveBeenCalledWith(
        '/ingresar?volver=%2Fcuenta%2Fdatos',
      ),
    );
    expect(peticiones).toContain('GET /api/cuentas/yo');
    expect(
      peticiones.filter((p) => p === 'POST /api/cuentas/sesion/renovar'),
    ).toHaveLength(1);
    expect(leerEstado()).toEqual({ tipo: 'anonima' });
    expect(
      screen.queryByRole('heading', { name: 'Mis datos' }),
    ).not.toBeInTheDocument();
  });

  it('E1-H3 FE · sesión revocada: quien entra a Mi cuenta sin sesión va a iniciar sesión', () => {
    act(() => olvidarSesion('este'));
    mostrarMisDatos();

    expect(navegacion.replace).toHaveBeenCalledWith(
      '/ingresar?volver=%2Fcuenta%2Fdatos',
    );
    expect(
      screen.queryByRole('heading', { name: 'Mis datos' }),
    ).not.toBeInTheDocument();
  });
});
