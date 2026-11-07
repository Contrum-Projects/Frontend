import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import { BajaOfertas } from './bajaOfertas';

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
  Response.json(cuerpo, { status });

// Textos de la respuesta del backend (marketing/bajas.service.ts)
const BAJA = 'Ya no recibirás publicidad en esta dirección de correo.';
const ENLACE_INVALIDO = 'El enlace de baja no es válido.';

/** Simula POST /api/marketing/bajas y guarda los cuerpos enviados. */
const simular = (respuesta: () => Response) => {
  const cuerpos: unknown[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (entrada: Request) => {
      expect(new URL(entrada.url).pathname).toBe('/api/marketing/bajas');
      cuerpos.push(await entrada.json());
      return respuesta();
    }),
  );
  return cuerpos;
};

const abrirEnlace = (token: string | null) => {
  navegacion.parametros = new URLSearchParams(token ? { token } : {});
  render(
    // Modo estricto, como en desarrollo: los efectos corren dos veces
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <BajaOfertas />
      </QueryClientProvider>
    </StrictMode>,
  );
};

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('BajaOfertas', () => {
  it('E12-H2 FE · baja desde un correo: al cargar el enlace, confirma que no recibirá más publicidad', async () => {
    const cuerpos = simular(() => responder({ mensaje: BAJA }));
    const reemplazar = vi.spyOn(window.history, 'replaceState');
    abrirEnlace('t0k3n');

    expect(
      await screen.findByRole('heading', { name: 'Te diste de baja' }),
    ).toBeVisible();
    expect(screen.getByText(BAJA)).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Volver a la tienda' }),
    ).toHaveAttribute('href', '/');
    // Una sola vez, aunque el efecto corra dos veces
    expect(cuerpos).toEqual([{ token: 't0k3n' }]);
    // El token no queda en la barra ni en el historial
    expect(reemplazar).toHaveBeenCalledWith(null, '', '/ofertas/baja');
  });

  it('E12-H2 FE · baja desde un correo: un enlace que no es válido lo dice', async () => {
    simular(() =>
      responder({ statusCode: 400, message: ENLACE_INVALIDO }, 400),
    );
    abrirEnlace('falso');

    expect(
      await screen.findByRole('heading', { name: 'El enlace no es válido' }),
    ).toBeVisible();
    expect(screen.getByText(ENLACE_INVALIDO)).toBeVisible();
  });

  it('E12-H2 FE · baja desde un correo: sin token en el enlace, no llama al backend', () => {
    const cuerpos = simular(() => responder({ mensaje: BAJA }));
    abrirEnlace(null);

    expect(
      screen.getByRole('heading', { name: 'El enlace no es válido' }),
    ).toBeVisible();
    expect(cuerpos).toHaveLength(0);
  });

  it('E12-H2 FE · baja desde un correo: si falla el servidor, deja reintentar', async () => {
    let intentos = 0;
    const cuerpos = simular(() =>
      ++intentos === 1
        ? responder({ statusCode: 500, message: 'Error interno' }, 500)
        : responder({ mensaje: BAJA }),
    );
    abrirEnlace('t0k3n');

    expect(
      await screen.findByRole('heading', { name: 'No pudimos darte de baja' }),
    ).toBeVisible();
    expect(screen.queryByText('Error interno')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Te diste de baja' }),
    ).toBeVisible();
    expect(cuerpos).toEqual([{ token: 't0k3n' }, { token: 't0k3n' }]);
  });
});
