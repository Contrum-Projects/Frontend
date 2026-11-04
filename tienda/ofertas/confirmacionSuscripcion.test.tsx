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
import { ConfirmacionSuscripcion } from './confirmacionSuscripcion';

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

// Textos de src/modulos/marketing/suscripciones.service.ts del backend
const CONFIRMADA =
  'Tu suscripción quedó confirmada. Te avisaremos de nuestras ofertas.';
const ENLACE_INVALIDO = 'El enlace de confirmación no es válido o ya venció.';

/** Simula POST /api/marketing/suscripciones/confirmar y guarda los cuerpos enviados. */
const simular = (respuesta: () => Response) => {
  const cuerpos: unknown[] = [];
  const fetch = vi.fn(async (entrada: Request) => {
    expect(new URL(entrada.url).pathname).toBe(
      '/api/marketing/suscripciones/confirmar',
    );
    cuerpos.push(await entrada.json());
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return cuerpos;
};

const abrirEnlace = (token: string | null) => {
  navegacion.parametros = new URLSearchParams(token ? { token } : {});
  act(() => olvidarSesion());
  render(
    // Modo estricto, como en desarrollo: los efectos corren dos veces
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <ConfirmacionSuscripcion />
      </QueryClientProvider>
    </StrictMode>,
  );
};

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('ConfirmacionSuscripcion', () => {
  it('E12-H1 FE · confirmación: al cargar el enlace, confirma la suscripción una sola vez', async () => {
    const cuerpos = simular(() => responder({ mensaje: CONFIRMADA }));
    const reemplazar = vi.spyOn(window.history, 'replaceState');
    abrirEnlace('t0k3n');

    expect(
      await screen.findByRole('heading', { name: 'Suscripción confirmada' }),
    ).toBeVisible();
    expect(screen.getByText(CONFIRMADA)).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Ver el catálogo' }),
    ).toHaveAttribute('href', '/catalogo');
    expect(cuerpos).toEqual([{ token: 't0k3n' }]);
    // El token no queda en la barra ni en el historial
    expect(reemplazar).toHaveBeenCalledWith(null, '', '/suscripcion/confirmar');
  });

  it('E12-H1 FE · confirmación: un enlace vencido lo dice y lleva a la tienda', async () => {
    simular(() =>
      responder({ statusCode: 400, message: ENLACE_INVALIDO }, 400),
    );
    abrirEnlace('vencido');

    expect(
      await screen.findByRole('heading', { name: 'El enlace venció' }),
    ).toBeVisible();
    expect(screen.getByText(ENLACE_INVALIDO)).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Volver a la tienda' }),
    ).toHaveAttribute('href', '/');
  });

  it('E12-H1 FE · confirmación: sin token en el enlace, no llama al backend', () => {
    const cuerpos = simular(() => responder({ mensaje: CONFIRMADA }));
    abrirEnlace(null);

    expect(
      screen.getByRole('heading', { name: 'El enlace venció' }),
    ).toBeVisible();
    expect(cuerpos).toHaveLength(0);
  });

  it('E12-H1 FE · exceso de solicitudes: pide esperar un momento y deja reintentar', async () => {
    let intentos = 0;
    const cuerpos = simular(() =>
      ++intentos === 1
        ? responder(
            {
              statusCode: 429,
              message: 'ThrottlerException: Too Many Requests',
            },
            429,
          )
        : responder({ mensaje: CONFIRMADA }),
    );
    abrirEnlace('t0k3n');

    expect(
      await screen.findByRole('heading', {
        name: 'No pudimos confirmar tu suscripción',
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
      ),
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Suscripción confirmada' }),
    ).toBeVisible();
    expect(cuerpos).toEqual([{ token: 't0k3n' }, { token: 't0k3n' }]);
  });
});
