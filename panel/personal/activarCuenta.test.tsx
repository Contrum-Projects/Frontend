import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { PantallaActivarCuenta } from './activarCuenta';

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

const navegacion = vi.hoisted(() => ({ parametros: new URLSearchParams() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => navegacion.parametros,
}));

/** Simula la aceptación de la invitación y guarda lo que se envió. */
const simular = (respuesta: () => Response) => {
  const fetch = vi.fn(async (peticion: Request) => {
    expect(new URL(peticion.url).pathname).toBe(
      '/api/personal/invitacion/aceptar',
    );
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const abrirEnlace = (token: string | null) => {
  navegacion.parametros = new URLSearchParams(token ? { token } : {});
  // Sin sesión conocida, el cliente primero intentaría renovarla
  act(() => olvidarSesion());
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PantallaActivarCuenta />
    </QueryClientProvider>,
  );
};

const crearContrasena = async () => {
  await userEvent.type(
    screen.getByLabelText('Nueva contraseña', { selector: 'input' }),
    'nueva1234',
  );
  await userEvent.type(
    screen.getByLabelText('Repite tu contraseña'),
    'nueva1234',
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Guardar contraseña' }),
  );
};

beforeEach(() => {
  reiniciarParaPruebas();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Activar la cuenta del personal (SCRUM-98)', () => {
  it('E13-H1 FE · nueva cuenta: con el enlace de la invitación, la persona crea su contraseña e ingresa al panel', async () => {
    const fetch = simular(() =>
      Response.json({
        mensaje: 'Tu contraseña quedó definida. Ya puedes iniciar sesión.',
      }),
    );
    abrirEnlace('abc123');

    expect(
      screen.getByRole('heading', { name: 'Crea tu contraseña' }),
    ).toBeVisible();
    await crearContrasena();

    expect(
      await screen.findByRole('heading', { name: 'Contraseña creada' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fpanel',
    );
    expect(await fetch.mock.calls[0][0].json()).toEqual({
      token: 'abc123',
      contrasena: 'nueva1234',
      confirmacionContrasena: 'nueva1234',
    });
  });

  it('E13-H1 FE · nueva cuenta: si el enlace venció, lo dice y pide una invitación nueva', async () => {
    simular(() =>
      Response.json(
        {
          statusCode: 400,
          message: 'El enlace de invitación no es válido o ya venció.',
        },
        { status: 400 },
      ),
    );
    abrirEnlace('vencido');

    await crearContrasena();

    expect(
      await screen.findByRole('heading', { name: 'El enlace no sirve' }),
    ).toBeVisible();
    expect(
      screen.getByText(/El enlace de invitación no es válido o ya venció\./),
    ).toHaveTextContent('Pide a la administración de la tienda');
  });

  it('E13-H1 FE · nueva cuenta: sin token, no llama al backend', () => {
    const fetch = simular(() => new Response(null, { status: 500 }));
    abrirEnlace(null);

    expect(
      screen.getByRole('heading', { name: 'El enlace no sirve' }),
    ).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });
});
