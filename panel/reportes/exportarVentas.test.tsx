import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { guardarArchivo } from '@/tienda/pedidos/consultasPedidos';
import { ExportarVentas } from './exportarVentas';
import { rangoDelPeriodo } from './periodos';

// Cliente igual al de la app, con URL absoluta y el fetch simulado de cada prueba
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

// Guardar el archivo toca el DOM del navegador: aquí basta saber qué se guardó
vi.mock('@/tienda/pedidos/consultasPedidos', async (original) => ({
  ...(await original<typeof import('@/tienda/pedidos/consultasPedidos')>()),
  guardarArchivo: vi.fn(),
}));

const RANGO = rangoDelPeriodo('seis-meses', '2026-09-15');
const CSV = '﻿Código pedido;Fecha\r\nAB12CD34EF56;2026-09-01 10:00\r\n';

const respuestaCsv = () =>
  new Response(CSV, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ventas-${RANGO.desde}-${RANGO.hasta}.csv"`,
    },
  });

const simularBackend = (responder: () => Response | Promise<Response>) => {
  const pedidas: URL[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const url = new URL(peticion.url);
      if (url.pathname !== '/api/reportes/ventas/exportar') {
        throw new Error(`Petición no simulada: ${url.pathname}`);
      }
      pedidas.push(url);
      return responder();
    }),
  );
  return pedidas;
};

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <ExportarVentas rango={RANGO} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Marcela',
        apellido: 'Díaz',
        rol: 'administrador',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Exportar ventas en CSV (SCRUM-160)', () => {
  it('E14-H5 FE · CA1 descargar: pide el mismo período de la pantalla y guarda el CSV', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend(respuestaCsv);
    mostrar();

    await usuario.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    await vi.waitFor(() => expect(guardarArchivo).toHaveBeenCalledOnce());
    expect(pedidas[0].searchParams.get('desde')).toBe('2026-04-01');
    expect(pedidas[0].searchParams.get('hasta')).toBe('2026-09-15');
    const [archivo, nombre] = vi.mocked(guardarArchivo).mock.calls[0];
    expect(nombre).toBe('ventas-2026-04-01-2026-09-15.csv');
    // El BOM se conserva: Excel lo usa para leer las tildes
    const bytes = new Uint8Array(await archivo.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  });

  it('E14-H5 FE · CA1 descargar: va con el token de la sesión', async () => {
    const usuario = userEvent.setup();
    simularBackend(respuestaCsv);
    mostrar();

    await usuario.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    await vi.waitFor(() => expect(guardarArchivo).toHaveBeenCalledOnce());
    const peticion = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(peticion.headers.get('Authorization')).toBe('Bearer token');
  });

  it('E14-H5 FE · CA2 mientras descarga: el botón queda deshabilitado y no pide dos veces', async () => {
    const usuario = userEvent.setup();
    let responder: (respuesta: Response) => void = () => {};
    const pedidas = simularBackend(
      () => new Promise<Response>((listo) => (responder = listo)),
    );
    mostrar();

    await usuario.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    const boton = await screen.findByRole('button', { name: 'Exportando…' });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    await usuario.click(boton);
    expect(pedidas).toHaveLength(1);

    act(() => responder(respuestaCsv()));
    expect(
      await screen.findByRole('button', { name: 'Exportar CSV' }),
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  it.each([
    [400, 'El período no puede superar los 366 días.'],
    [403, 'El rol no tiene el permiso de ver los reportes.'],
  ])(
    'E14-H5 FE · CA3 error %i: muestra el mensaje del backend y no descarga nada',
    async (estado, mensaje) => {
      const usuario = userEvent.setup();
      simularBackend(() =>
        Response.json(
          { statusCode: estado, message: mensaje },
          { status: estado },
        ),
      );
      mostrar();

      await usuario.click(screen.getByRole('button', { name: 'Exportar CSV' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(mensaje);
      expect(guardarArchivo).not.toHaveBeenCalled();
    },
  );

  it('E14-H5 FE · CA3 respuesta que no es CSV: no la guarda y muestra un error genérico', async () => {
    const usuario = userEvent.setup();
    simularBackend(() => Response.json({ algo: 'raro' }));
    mostrar();

    await usuario.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    expect(await screen.findByRole('alert')).not.toBeEmptyDOMElement();
    expect(guardarArchivo).not.toHaveBeenCalled();
  });
});
