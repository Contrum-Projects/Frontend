import createClient from 'openapi-fetch';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  guardarSesion,
  leerEstado,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { middlewareDeSesion } from './cliente';
import type { paths } from './esquema';

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const usuario = {
  codigoPublico: 'u-1',
  nombre: 'Camila',
  apellido: 'Rojas',
  rol: 'cliente' as const,
};

/** Cliente igual al de la app, pero con URL absoluta (Node no resuelve rutas relativas). */
function clienteDePrueba(peticiones: Request[], respuestas: Response[]) {
  const cliente = createClient<paths>({
    baseUrl: 'http://tienda.test',
    fetch: async (peticion) => {
      peticiones.push(peticion);
      return respuestas.shift() ?? json({}, 500);
    },
  });
  cliente.use(middlewareDeSesion);
  return cliente;
}

describe('cliente de la API', () => {
  beforeEach(() => reiniciarParaPruebas());
  afterEach(() => vi.unstubAllGlobals());

  it('agrega el token de acceso a cada petición', async () => {
    guardarSesion({ tokenAcceso: 'a', expiraEn: 900, usuario });
    const peticiones: Request[] = [];
    const cliente = clienteDePrueba(peticiones, [json([])]);

    await cliente.GET('/api/cuentas/yo/direcciones');

    expect(peticiones[0].headers.get('authorization')).toBe('Bearer a');
  });

  it('no manda token al iniciar sesión (usa la cookie de refresco)', async () => {
    guardarSesion({ tokenAcceso: 'a', expiraEn: 900, usuario });
    const peticiones: Request[] = [];
    const cliente = clienteDePrueba(peticiones, [json({}, 401)]);

    await cliente.POST('/api/cuentas/sesion', {
      body: { email: 'camila@correo.cl', contrasena: 'x' },
    });

    expect(peticiones[0].headers.get('authorization')).toBeNull();
  });

  it('ante un 401 renueva la sesión y repite la petición una vez (RNF-28)', async () => {
    guardarSesion({ tokenAcceso: 'revocado', expiraEn: 900, usuario });
    const fetchGlobal = vi
      .fn()
      // renovación con la cookie de refresco
      .mockResolvedValueOnce(
        json({ tokenAcceso: 'nuevo', expiraEn: 900, usuario }),
      )
      // la petición repetida
      .mockResolvedValueOnce(json([{ id: 1 }]));
    vi.stubGlobal('fetch', fetchGlobal);
    const peticiones: Request[] = [];
    const cliente = clienteDePrueba(peticiones, [
      json({ statusCode: 401 }, 401),
    ]);

    const { data, response } = await cliente.GET('/api/cuentas/yo/direcciones');

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: 1 }]);
    const repetida = fetchGlobal.mock.calls[1][0] as Request;
    expect(repetida.headers.get('authorization')).toBe('Bearer nuevo');
  });

  it('si la sesión ya no se puede renovar, la olvida y entrega el 401', async () => {
    guardarSesion({ tokenAcceso: 'revocado', expiraEn: 900, usuario });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json({ statusCode: 401 }, 401)),
    );
    const cliente = clienteDePrueba([], [json({ statusCode: 401 }, 401)]);

    const { response } = await cliente.GET('/api/cuentas/yo/direcciones');

    expect(response.status).toBe(401);
    expect(leerEstado()).toEqual({ tipo: 'anonima' });
  });
});
