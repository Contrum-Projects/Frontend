import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';

vi.mock('@/compartido/api/simulado/rutas', () => ({
  rutasSimuladas: [
    {
      metodo: 'GET',
      ruta: '/tienda/packs/:codigo',
      historia: 'SCRUM-108',
      responder: ({ params }: { params: Record<string, string> }) =>
        Response.json({ codigo: params.codigo }),
    },
  ],
}));

const contexto = (ruta: string[]) => ({ params: Promise.resolve({ ruta }) });

describe('proxy /api → backend', () => {
  beforeEach(() => {
    vi.stubEnv('API_URL', 'http://backend.test:3000');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reenvía ruta, consulta, cookies e IP del cliente, y devuelve las cookies del backend', async () => {
    const respuestaBackend = new Response('{"ok":true}', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    respuestaBackend.headers.append(
      'set-cookie',
      'refresco=a; Path=/api/cuentas/sesion; HttpOnly',
    );
    respuestaBackend.headers.append('set-cookie', 'otra=b; Path=/');
    const fetch = vi.fn().mockResolvedValue(respuestaBackend);
    vi.stubGlobal('fetch', fetch);

    const respuesta = await POST(
      new Request('http://tienda.test/api/cuentas/sesion/renovar?x=1', {
        method: 'POST',
        headers: {
          cookie: 'refresco=viejo',
          'x-forwarded-for': '200.1.2.3',
          host: 'tienda.test',
        },
      }),
      contexto(['cuentas', 'sesion', 'renovar']),
    );

    const [destino, opciones] = fetch.mock.calls[0];
    expect(String(destino)).toBe(
      'http://backend.test:3000/api/cuentas/sesion/renovar?x=1',
    );
    expect(opciones.headers.get('cookie')).toBe('refresco=viejo');
    expect(opciones.headers.get('x-forwarded-for')).toBe('200.1.2.3');
    expect(opciones.headers.get('host')).toBeNull();
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.getSetCookie()).toHaveLength(2);
  });

  it('rechaza rutas con .. para no salir de /api', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    const respuesta = await GET(
      new Request('http://tienda.test/api/x'),
      contexto(['..', 'secreto']),
    );

    expect(respuesta.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('si el backend no responde, entrega un 502 con mensaje para la persona', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    );

    const respuesta = await GET(
      new Request('http://tienda.test/api/salud'),
      contexto(['salud']),
    );

    expect(respuesta.status).toBe(502);
    expect(await respuesta.json()).toMatchObject({ statusCode: 502 });
  });

  it('con API_SIMULADA=1 responde las rutas simuladas sin llamar al backend, y el resto sigue al backend', async () => {
    vi.stubEnv('API_SIMULADA', '1');
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetch);

    const simulada = await GET(
      new Request('http://tienda.test/api/tienda/packs/PK-1'),
      contexto(['tienda', 'packs', 'PK-1']),
    );
    expect(await simulada.json()).toEqual({ codigo: 'PK-1' });
    expect(simulada.headers.get('x-api-simulada')).toBe('SCRUM-108');
    expect(fetch).not.toHaveBeenCalled();

    await GET(
      new Request('http://tienda.test/api/tienda/marcas'),
      contexto(['tienda', 'marcas']),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
