import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  leerEstado,
  reiniciarParaPruebas,
  renovarSesion,
  tokenVigente,
} from './almacen';

const sesion = (token: string, expiraEn = 900) => ({
  tokenAcceso: token,
  expiraEn,
  usuario: {
    codigoPublico: 'u-1',
    nombre: 'Camila',
    apellido: 'Rojas',
    rol: 'cliente',
  },
});

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('sesión del navegador', () => {
  beforeEach(() => reiniciarParaPruebas());
  afterEach(() => vi.unstubAllGlobals());

  it('renueva una sola vez aunque se pida en paralelo (cada token de refresco sirve una vez)', async () => {
    const fetch = vi.fn().mockResolvedValue(responder(sesion('a')));
    vi.stubGlobal('fetch', fetch);

    const tokens = await Promise.all([
      renovarSesion(),
      renovarSesion(),
      tokenVigente(),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/cuentas/sesion/renovar', {
      method: 'POST',
      credentials: 'same-origin',
    });
    expect(tokens).toEqual(['a', 'a', 'a']);
    expect(leerEstado()).toMatchObject({
      tipo: 'activa',
      usuario: { nombre: 'Camila' },
    });
  });

  it('sin cookie de refresco (401) queda como visitante y no vuelve a pedir', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(responder({ statusCode: 401 }, 401));
    vi.stubGlobal('fetch', fetch);

    expect(await renovarSesion()).toBeNull();
    expect(leerEstado()).toEqual({ tipo: 'anonima' });
    expect(await tokenVigente()).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('usa el token guardado mientras está vigente', async () => {
    const fetch = vi.fn().mockResolvedValue(responder(sesion('a')));
    vi.stubGlobal('fetch', fetch);

    await renovarSesion();
    expect(await tokenVigente()).toBe('a');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('renueva antes de usar un token a punto de vencer', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(responder(sesion('viejo', 10)))
      .mockResolvedValueOnce(responder(sesion('nuevo')));
    vi.stubGlobal('fetch', fetch);

    await renovarSesion();
    expect(await tokenVigente()).toBe('nuevo');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
