import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { ConfirmacionCorreo } from './confirmacionCorreo';

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

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const simularConfirmacion = (respuesta: () => Response) => {
  const fetch = vi.fn(async (entrada: Request) => {
    expect(new URL(entrada.url).pathname).toBe('/api/cuentas/confirmar-correo');
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const abrirEnlace = (token: string | null) => {
  navegacion.parametros = new URLSearchParams(token ? { token } : {});
  act(() => olvidarSesion());
  render(
    // Modo estricto, como en desarrollo: los efectos corren dos veces
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <ConfirmacionCorreo />
      </QueryClientProvider>
    </StrictMode>,
  );
};

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('SCRUM-93 · Confirmación del correo', () => {
  it('E1-H1 FE · confirmación del correo: con el enlace confirma la cuenta y lleva a ingresar', async () => {
    const fetch = simularConfirmacion(() =>
      responder({ mensaje: 'Tu correo quedó confirmado. Ya puedes comprar.' }),
    );
    abrirEnlace('abc123');

    expect(
      await screen.findByRole('heading', { name: 'Correo confirmado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tu correo quedó confirmado. Ya puedes comprar.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar',
    );
    // El enlace es de un solo uso: se envía una vez aunque el efecto corra dos
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe('');
    expect(await fetch.mock.calls[0]![0].json()).toEqual({ token: 'abc123' });
  });

  it('E1-H1 FE · confirmación del correo: avisa que el enlace venció', async () => {
    simularConfirmacion(() =>
      responder(
        {
          statusCode: 400,
          message: 'El enlace de confirmación no es válido o ya venció.',
        },
        400,
      ),
    );
    abrirEnlace('vencido');

    expect(
      await screen.findByRole('heading', { name: 'El enlace venció' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('El enlace de confirmación no es válido o ya venció.'),
    ).toBeInTheDocument();
  });

  it('E1-H1 FE · confirmación del correo: sin enlace indica «Revisa tu correo»', () => {
    const fetch = simularConfirmacion(() => responder({}));
    abrirEnlace(null);

    expect(
      screen.getByRole('heading', { name: 'Revisa tu correo' }),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('un error del servidor permite reintentar sin mostrar detalles técnicos', async () => {
    let intentos = 0;
    simularConfirmacion(() =>
      ++intentos === 1
        ? responder({ statusCode: 500, message: 'Redis caído' }, 500)
        : responder({
            mensaje: 'Tu correo quedó confirmado. Ya puedes comprar.',
          }),
    );
    abrirEnlace('abc123');

    expect(
      await screen.findByRole('heading', {
        name: 'No pudimos confirmar tu correo',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Redis/)).not.toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

    expect(
      await screen.findByRole('heading', { name: 'Correo confirmado' }),
    ).toBeInTheDocument();
  });
});
