import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { SesionIniciada } from '@/compartido/api/respuestas';
import {
  guardarSesion,
  leerEstado,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { Ingreso } from './ingreso';

// Cliente igual al de la app, pero con URL absoluta (Node no resuelve rutas relativas) y que
// usa el fetch simulado de cada prueba (el de la app guarda el fetch real al importarse).
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

const navegacion = vi.hoisted(() => ({
  replace: vi.fn(),
  parametros: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navegacion.replace }),
  useSearchParams: () => navegacion.parametros,
}));

const sesion = (rol: Rol): SesionIniciada => ({
  tokenAcceso: 'token',
  expiraEn: 900,
  usuario: { codigoPublico: 'u-1', nombre: 'Camila', apellido: 'Rojas', rol },
});

const responder = (
  cuerpo: unknown,
  status = 200,
  cabeceras: Record<string, string> = {},
) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json', ...cabeceras },
  });

/** Simula el backend: responde a POST /api/cuentas/sesion y guarda lo que se envió. */
const simularIngreso = (respuesta: () => Response) => {
  const fetch = vi.fn(async (entrada: Request) => {
    expect(new URL(entrada.url).pathname).toBe('/api/cuentas/sesion');
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const mostrarIngreso = () => {
  act(() => olvidarSesion());
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Ingreso />
    </QueryClientProvider>,
  );
};

const ingresar = async (email: string, contrasena: string) => {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('Correo electrónico'), email);
  await usuario.type(screen.getByLabelText('Contraseña'), contrasena);
  await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
};

beforeEach(() => {
  navegacion.parametros = new URLSearchParams();
});

afterEach(() => {
  reiniciarParaPruebas();
  navegacion.replace.mockReset();
  vi.unstubAllGlobals();
});

describe('SCRUM-94 · Pantalla de inicio de sesión', () => {
  it('E1-H2 FE · ingreso correcto: guarda la sesión y lleva al personal al panel', async () => {
    const fetch = simularIngreso(() => responder(sesion('administrador')));
    mostrarIngreso();

    await ingresar('  admin@correo.cl ', 'secreta123');

    await waitFor(() =>
      expect(navegacion.replace).toHaveBeenCalledWith('/panel'),
    );
    expect(leerEstado()).toMatchObject({
      tipo: 'activa',
      usuario: { rol: 'administrador' },
    });
    const pedido = fetch.mock.calls[0]![0];
    expect(pedido.method).toBe('POST');
    expect(await pedido.json()).toEqual({
      email: 'admin@correo.cl',
      contrasena: 'secreta123',
    });
  });

  it('E1-H2 FE · ingreso correcto: el cliente vuelve a la página de donde venía', async () => {
    navegacion.parametros = new URLSearchParams({ volver: '/catalogo' });
    simularIngreso(() => responder(sesion('cliente')));
    mostrarIngreso();

    await ingresar('camila@correo.cl', 'secreta123');

    await waitFor(() =>
      expect(navegacion.replace).toHaveBeenCalledWith('/catalogo'),
    );
  });

  it('E1-H2 FE · credenciales incorrectas: muestra el error del servidor sin marcar un campo', async () => {
    simularIngreso(() =>
      responder(
        {
          statusCode: 401,
          message: 'Correo o contraseña incorrectos.',
          error: 'Unauthorized',
        },
        401,
      ),
    );
    mostrarIngreso();

    await ingresar('camila@correo.cl', 'equivocada');

    expect(
      await screen.findByText('Correo o contraseña incorrectos.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText('Contraseña')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
    // Lo escrito se conserva para corregirlo
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
      'camila@correo.cl',
    );
    expect(navegacion.replace).not.toHaveBeenCalled();
    expect(leerEstado().tipo).toBe('anonima');
  });

  it('E1-H2 FE · límite de intentos: indica que debe esperar', async () => {
    simularIngreso(() =>
      responder(
        {
          statusCode: 429,
          message:
            'Demasiados intentos fallidos. Espera 12 minutos e inténtalo de nuevo.',
        },
        429,
        { 'retry-after': '720' },
      ),
    );
    mostrarIngreso();

    await ingresar('camila@correo.cl', 'otra');

    expect(
      await screen.findByText(
        'Demasiados intentos fallidos. Espera 12 minutos e inténtalo de nuevo.',
      ),
    ).toBeInTheDocument();
    expect(navegacion.replace).not.toHaveBeenCalled();
  });

  it('muestra el aviso del backend cuando falta confirmar el correo', async () => {
    simularIngreso(() =>
      responder(
        {
          statusCode: 403,
          message: 'Debes confirmar tu correo antes de iniciar sesión.',
        },
        403,
      ),
    );
    mostrarIngreso();

    await ingresar('camila@correo.cl', 'secreta123');

    expect(
      await screen.findByText(
        'Debes confirmar tu correo antes de iniciar sesión.',
      ),
    ).toBeInTheDocument();
  });

  it('un error del servidor no muestra detalles técnicos', async () => {
    simularIngreso(() =>
      responder(
        { statusCode: 500, message: 'PrismaClientKnownRequestError' },
        500,
      ),
    );
    mostrarIngreso();

    await ingresar('camila@correo.cl', 'secreta123');

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
  });

  it('sin conexión muestra el mensaje genérico y conserva lo escrito', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );
    mostrarIngreso();

    await ingresar('camila@correo.cl', 'secreta123');

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
      'camila@correo.cl',
    );
  });

  it('valida los campos antes de llamar al servidor', async () => {
    const fetch = simularIngreso(() => responder(sesion('cliente')));
    mostrarIngreso();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Escribe tu correo.')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('con la sesión ya iniciada no muestra el formulario y redirige', async () => {
    const fetch = simularIngreso(() => responder(sesion('cliente')));
    act(() => guardarSesion(sesion('profesional')));
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Ingreso />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(navegacion.replace).toHaveBeenCalledWith('/'));
    expect(fetch).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Ingresar' }),
    ).not.toBeInTheDocument();
  });

  it('enlaza a la recuperación de contraseña', () => {
    mostrarIngreso();
    expect(
      screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' }),
    ).toHaveAttribute('href', '/recuperar-contrasena');
  });
});
