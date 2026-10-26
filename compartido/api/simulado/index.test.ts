import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorSimulado, json, responderSimulado, type RutaSimulada } from '.';

const rutas: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/tienda/productos/:codigo',
    historia: 'SCRUM-108',
    responder: ({ params, url }) =>
      json({ codigo: params.codigo, formato: url.searchParams.get('formato') }),
  },
  {
    metodo: 'POST',
    ruta: '/tienda/packs',
    historia: 'SCRUM-105',
    responder: () => errorSimulado(409, 'El SKU ya existe.'),
  },
];

const peticion = (camino: string, method = 'GET') =>
  new Request(`http://tienda.test/api${camino}`, { method });

describe('API simulada', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('con API_SIMULADA=1 responde la ruta registrada con sus parámetros y la marca', async () => {
    vi.stubEnv('API_SIMULADA', '1');

    const respuesta = await responderSimulado(
      peticion('/tienda/productos/CP%20001?formato=300ml'),
      '/tienda/productos/CP%20001',
      rutas,
    );

    expect(respuesta?.status).toBe(200);
    expect(respuesta?.headers.get('x-api-simulada')).toBe('SCRUM-108');
    expect(await respuesta?.json()).toEqual({
      codigo: 'CP 001',
      formato: '300ml',
    });
  });

  it('devuelve los errores con la forma del backend', async () => {
    vi.stubEnv('API_SIMULADA', '1');

    const respuesta = await responderSimulado(
      peticion('/tienda/packs', 'POST'),
      '/tienda/packs',
      rutas,
    );

    expect(respuesta?.status).toBe(409);
    expect(await respuesta?.json()).toEqual({
      statusCode: 409,
      message: 'El SKU ya existe.',
    });
  });

  it('deja pasar al backend lo que no está registrado o usa otro método', async () => {
    vi.stubEnv('API_SIMULADA', '1');

    expect(
      await responderSimulado(
        peticion('/tienda/marcas'),
        '/tienda/marcas',
        rutas,
      ),
    ).toBeNull();
    expect(
      await responderSimulado(
        peticion('/tienda/productos/x', 'DELETE'),
        '/tienda/productos/x',
        rutas,
      ),
    ).toBeNull();
  });

  it('no hace nada sin API_SIMULADA=1 ni en producción', async () => {
    const camino = '/tienda/productos/x';
    expect(await responderSimulado(peticion(camino), camino, rutas)).toBeNull();

    vi.stubEnv('API_SIMULADA', '1');
    vi.stubEnv('NODE_ENV', 'production');
    expect(await responderSimulado(peticion(camino), camino, rutas)).toBeNull();
  });
});
