import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { ReporteVentas, TotalesVentas } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { puedeAbrir } from '@/panel/diseno/secciones';
import { PantallaReportes } from './pantallaReportes';
import { lineasDelEje, rangoDelPeriodo } from './periodos';

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

// Hoy, fijo: 15 de septiembre de 2026 en Chile
vi.mock('./periodos', async (original) => ({
  ...(await original<typeof import('./periodos')>()),
  hoyEnChile: () => '2026-09-15',
}));

const totales = (pedidos: number, montoTotal: number): TotalesVentas => ({
  pedidos,
  montoNeto: Math.round(montoTotal / 1.19),
  montoIva: montoTotal - Math.round(montoTotal / 1.19),
  montoTotal,
});

/** El backend suma; aquí, valores fijos por período (desde|hasta). */
const reporte = (
  desde: string,
  hasta: string,
  minorista: TotalesVentas,
  mayorista: TotalesVentas,
  total: TotalesVentas,
): ReporteVentas => ({ desde, hasta, minorista, mayorista, total });

const CERO = totales(0, 0);

const MESES: Record<string, ReporteVentas> = {
  '2026-04-01|2026-04-30': reporte(
    '2026-04-01',
    '2026-04-30',
    totales(70, 1_820_000),
    totales(18, 620_000),
    totales(88, 2_440_000),
  ),
  '2026-05-01|2026-05-31': reporte(
    '2026-05-01',
    '2026-05-31',
    totales(75, 1_950_000),
    totales(22, 740_000),
    totales(97, 2_690_000),
  ),
  '2026-06-01|2026-06-30': reporte(
    '2026-06-01',
    '2026-06-30',
    totales(80, 2_100_000),
    totales(25, 910_000),
    totales(105, 3_010_000),
  ),
  '2026-07-01|2026-07-31': reporte(
    '2026-07-01',
    '2026-07-31',
    totales(78, 2_040_000),
    totales(28, 1_080_000),
    totales(106, 3_120_000),
  ),
  '2026-08-01|2026-08-31': reporte(
    '2026-08-01',
    '2026-08-31',
    totales(96, 2_380_000),
    totales(31, 1_220_000),
    totales(127, 3_600_000),
  ),
  '2026-09-01|2026-09-15': reporte(
    '2026-09-01',
    '2026-09-15',
    totales(99, 2_610_000),
    totales(40, 1_400_000),
    totales(139, 4_010_000),
  ),
  '2026-04-01|2026-09-15': reporte(
    '2026-04-01',
    '2026-09-15',
    totales(498, 12_900_000),
    totales(164, 5_970_000),
    totales(662, 18_870_000),
  ),
};

type Responder = (desde: string, hasta: string) => Response;

const conDatos: Responder = (desde, hasta) => {
  const encontrado = MESES[`${desde}|${hasta}`];
  return encontrado
    ? Response.json(encontrado)
    : Response.json(
        { statusCode: 404, message: 'No simulado' },
        { status: 404 },
      );
};

const simularBackend = (responder: Responder = conDatos) => {
  const pedidas: string[] = [];
  const fetch = vi.fn(async (peticion: Request) => {
    const url = new URL(peticion.url);
    if (url.pathname !== '/api/reportes/ventas') {
      throw new Error(`Petición no simulada: ${url.pathname}`);
    }
    const desde = url.searchParams.get('desde') ?? '';
    const hasta = url.searchParams.get('hasta') ?? '';
    pedidas.push(`${desde}|${hasta}`);
    return responder(desde, hasta);
  });
  vi.stubGlobal('fetch', fetch);
  return { pedidas };
};

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaReportes />
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
  vi.restoreAllMocks();
});

const resumen = async () =>
  within(await screen.findByRole('region', { name: 'Resumen del período' }));

describe('Reporte de ventas (SCRUM-143)', () => {
  it('E14-H2 FE · CA1 ventas: muestra pedidos y montos por mes, separados por cliente y profesional', async () => {
    simularBackend();
    mostrar();

    const meses = await screen.findByRole('list', { name: 'Ventas por mes' });
    const filas = within(meses).getAllByRole('listitem');
    expect(filas).toHaveLength(6);
    expect(filas[0]).toHaveTextContent('Abril');
    const agosto = filas[4];
    expect(agosto).toHaveTextContent('Agosto');
    expect(agosto).toHaveTextContent('Cliente: $2.380.000 · 96 pedidos');
    expect(agosto).toHaveTextContent('Profesional: $1.220.000 · 31 pedidos');
    expect(filas[5]).toHaveTextContent('Septiembre');
  });

  it('E14-H2 FE · CA1 ventas: el resumen del período trae cliente, profesional y total', async () => {
    simularBackend();
    mostrar();

    const tabla = await resumen();
    const filas = tabla.getAllByRole('row');
    expect(filas[1]).toHaveTextContent(/Cliente\s*498\s*\$12\.900\.000/);
    expect(filas[2]).toHaveTextContent(/Profesional\s*164\s*\$5\.970\.000/);
    expect(filas[3]).toHaveTextContent(/Total\s*662\s*\$18\.870\.000/);
    expect(
      tabla.getByText('Montos con IVA, de pedidos pagados.'),
    ).toBeVisible();
    // Celular: el total bajo el gráfico
    expect(screen.getByText('$18.870.000 · 662 pedidos')).toBeInTheDocument();
  });

  it('E14-H2 FE · CA1 ventas: pide el período completo y cada mes por separado', async () => {
    const { pedidas } = simularBackend();
    mostrar();
    await resumen();

    expect(pedidas).toContain('2026-04-01|2026-09-15');
    expect(pedidas).toContain('2026-04-01|2026-04-30');
    expect(pedidas).toContain('2026-09-01|2026-09-15');
  });

  it('E14-H2 FE · CA1 ventas: con «Este mes» muestra solo el mes en curso', async () => {
    const usuario = userEvent.setup();
    simularBackend();
    mostrar();
    await resumen();

    await usuario.click(screen.getByRole('radio', { name: 'Este mes' }));

    const tabla = await screen.findByRole('cell', { name: '139' });
    expect(tabla).toBeInTheDocument();
    const filas = within(
      screen.getByRole('list', { name: 'Ventas por mes' }),
    ).getAllByRole('listitem');
    expect(filas).toHaveLength(1);
    expect(filas[0]).toHaveTextContent('Septiembre');
  });

  it('E14-H2 FE · CA2 sin ventas: los totales aparecen en cero', async () => {
    simularBackend((desde, hasta) =>
      Response.json(reporte(desde, hasta, CERO, CERO, CERO)),
    );
    mostrar();

    const tabla = await resumen();
    const filas = tabla.getAllByRole('row');
    expect(filas[1]).toHaveTextContent(/Cliente\s*0\s*\$0/);
    expect(filas[2]).toHaveTextContent(/Profesional\s*0\s*\$0/);
    expect(filas[3]).toHaveTextContent(/Total\s*0\s*\$0/);
    expect(screen.getByText('$0 · 0 pedidos')).toBeInTheDocument();
    const meses = within(
      screen.getByRole('list', { name: 'Ventas por mes' }),
    ).getAllByRole('listitem');
    expect(meses[0]).toHaveTextContent('Cliente: $0 · 0 pedidos');
  });

  it('E14-H2 FE · mientras carga muestra el esqueleto, sin montos', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );
    const { container } = mostrar();

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Reportes' }),
    ).toBeVisible();
  });

  it('E14-H2 FE · sin permiso: muestra el mensaje del backend', async () => {
    simularBackend(() =>
      Response.json(
        {
          statusCode: 403,
          message: 'No tienes permiso para ver los reportes.',
        },
        { status: 403 },
      ),
    );
    mostrar();

    expect(
      await screen.findByText('No tienes permiso para ver los reportes.'),
    ).toBeInTheDocument();
  });

  it('E14-H2 FE · solo el administrador abre «Reportes»', () => {
    expect(puedeAbrir('administrador', '/panel/reportes')).toBe(true);
    expect(puedeAbrir('vendedor', '/panel/reportes')).toBe(false);
    expect(puedeAbrir('bodeguero', '/panel/reportes')).toBe(false);
  });
});

describe('Períodos del reporte', () => {
  it('«Últimos 6 meses» va del día 1 de hace cinco meses a hoy, con cada mes completo', () => {
    const rango = rangoDelPeriodo('seis-meses', '2026-02-10');
    expect(rango.desde).toBe('2025-09-01');
    expect(rango.hasta).toBe('2026-02-10');
    expect(rango.meses.map((mes) => mes.clave)).toEqual([
      '2025-09',
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
    ]);
    expect(rango.meses[0]).toEqual({
      clave: '2025-09',
      desde: '2025-09-01',
      hasta: '2025-09-30',
    });
    expect(rango.meses[5].hasta).toBe('2026-02-10');
  });

  it('«Este mes» va del día 1 a hoy', () => {
    expect(rangoDelPeriodo('este-mes', '2026-11-04')).toEqual({
      desde: '2026-11-01',
      hasta: '2026-11-04',
      meses: [{ clave: '2026-11', desde: '2026-11-01', hasta: '2026-11-04' }],
    });
  });

  it('el eje usa topes redondos y, sin ventas, solo el cero', () => {
    expect(lineasDelEje(0)).toEqual([0]);
    expect(lineasDelEje(2_610_000)).toEqual([
      0, 1_000_000, 2_000_000, 3_000_000,
    ]);
    expect(lineasDelEje(4_500)).toEqual([0, 2_000, 4_000, 6_000]);
  });
});
