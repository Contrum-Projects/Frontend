import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { act } from 'react';
import { vi } from 'vitest';
import type {
  DatosPersonales,
  DireccionCuenta,
} from '@/compartido/api/respuestas';
import { guardarSesion } from '@/compartido/sesion/almacen';
import { DisenoCuenta } from './disenoCuenta';
import { PantallaMisDatos } from './pantallaMisDatos';

/**
 * Apoyo para las pruebas de «Mi cuenta». Cada archivo de prueba simula además
 * `@/compartido/api/cliente` y `next/navigation` (vi.mock solo funciona en el propio archivo).
 */

export const DATOS: DatosPersonales = {
  codigoPublico: 'u-1',
  nombre: 'Camila',
  apellido: 'Rojas',
  email: 'camila@correo.cl',
  rut: null,
  telefono: '+56912345678',
  fechaNacimiento: null,
  genero: null,
};

const RM = { codigoCut: '13', nombre: 'Metropolitana de Santiago' };

export const direccion = (
  id: number,
  calle: string,
  esPrincipal: boolean,
  comuna = { codigoCut: '13120', nombre: 'Ñuñoa' },
): DireccionCuenta => ({
  id,
  calle,
  numero: String(1000 + id),
  referencia: null,
  esPrincipal,
  comuna: { ...comuna, region: RM },
});

export const REGIONES = [{ codigoCut: '05', nombre: 'Valparaíso' }, RM];

export const COMUNAS: Record<string, { codigoCut: string; nombre: string }[]> =
  {
    '05': [{ codigoCut: '05109', nombre: 'Viña del Mar' }],
    '13': [
      { codigoCut: '13120', nombre: 'Ñuñoa' },
      { codigoCut: '13123', nombre: 'Providencia' },
    ],
  };

export const responder = (cuerpo: unknown, status = 200) =>
  cuerpo === undefined
    ? new Response(null, { status })
    : Response.json(cuerpo, { status });

export interface PeticionRegistrada {
  /** «MÉTODO /ruta». */
  peticion: string;
  cuerpo: unknown;
}

/**
 * Simula el backend en el borde (`fetch`). `rutas` responde según «MÉTODO /ruta»; lo que no
 * está, responde 404. Devuelve las peticiones que no son lecturas (GET).
 */
export const simularBackend = (
  rutas: Record<string, (cuerpo: unknown) => Response>,
) => {
  const escrituras: PeticionRegistrada[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (entrada: Request) => {
      const peticion = `${entrada.method} ${new URL(entrada.url).pathname}`;
      const texto = await entrada.clone().text();
      const cuerpo: unknown = texto ? JSON.parse(texto) : undefined;
      if (entrada.method !== 'GET') escrituras.push({ peticion, cuerpo });
      const manejar = rutas[peticion];
      return manejar
        ? manejar(cuerpo)
        : responder({ statusCode: 404, message: 'No existe.' }, 404);
    }),
  );
  return escrituras;
};

/** Ubicaciones de prueba, para sumar a las rutas de cada prueba. */
export const RUTAS_UBICACIONES: Record<string, () => Response> = {
  'GET /api/territorio/regiones': () => responder(REGIONES),
  ...Object.fromEntries(
    Object.entries(COMUNAS).map(([region, comunas]) => [
      `GET /api/territorio/regiones/${region}/comunas`,
      () => responder(comunas),
    ]),
  ),
};

/** Abre Mis datos con la sesión iniciada. */
export const mostrarMisDatos = () => {
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
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <DisenoCuenta>
        <PantallaMisDatos />
      </DisenoCuenta>
    </QueryClientProvider>,
  );
};
