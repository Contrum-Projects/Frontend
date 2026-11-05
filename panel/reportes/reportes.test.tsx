import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CarritosDelMes,
  IndicadorObjetivo,
  ReporteCampanas,
  ReporteCarritos,
  ReporteObjetivos,
  ResultadoCampana,
  ReporteVentas,
  TotalesVentas,
} from '@/compartido/api/respuestas';
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

const objetivo = (
  codigo: IndicadorObjetivo['codigo'],
  meta: number,
  porcentaje: number | null,
  cumplen: number,
  total: number,
  estado: IndicadorObjetivo['estado'],
): IndicadorObjetivo => ({ codigo, meta, porcentaje, cumplen, total, estado });

/** El backend calcula porcentaje y estado; aquí, valores fijos. */
const OBJETIVOS_SEIS_MESES = [
  objetivo('OE1', 30, 24, 41, 171, 'bajo-la-meta'),
  objetivo('OE2', 70, 78, 112, 144, 'sobre-la-meta'),
  objetivo('OE3', 80, 85, 34, 40, 'sobre-la-meta'),
];

const OBJETIVOS_ESTE_MES = [
  objetivo('OE1', 30, 33, 10, 30, 'sobre-la-meta'),
  objetivo('OE2', 70, 60, 12, 20, 'bajo-la-meta'),
  objetivo('OE3', 80, 90, 9, 10, 'sobre-la-meta'),
];

const objetivosConDatos: Responder = (desde, hasta) =>
  Response.json({
    desde,
    hasta,
    objetivos:
      desde === '2026-09-01' ? OBJETIVOS_ESTE_MES : OBJETIVOS_SEIS_MESES,
  } satisfies ReporteObjetivos);

const responderObjetivos =
  (objetivos: IndicadorObjetivo[]): Responder =>
  (desde, hasta) =>
    Response.json({ desde, hasta, objetivos } satisfies ReporteObjetivos);

/** El backend cuenta; aquí, cifras fijas por mes (Figma P6 2041:1429). */
const carritos = (
  mes: string,
  abandonados: number,
  recuperados: number,
  porcentajeRecuperados: number | null,
): CarritosDelMes => ({ mes, abandonados, recuperados, porcentajeRecuperados });

const CARRITOS_SEIS_MESES = [
  carritos('2026-04', 82, 13, 16),
  carritos('2026-05', 90, 17, 19),
  carritos('2026-06', 87, 15, 17),
  carritos('2026-07', 99, 21, 21),
  carritos('2026-08', 95, 22, 23),
  carritos('2026-09', 110, 27, 25),
];

const responderCarritos =
  (meses: CarritosDelMes[]): Responder =>
  (desde, hasta) =>
    Response.json({ desde, hasta, meses } satisfies ReporteCarritos);

const campana = (
  datos: Partial<ResultadoCampana> &
    Pick<ResultadoCampana, 'codigo' | 'nombre' | 'fecha'>,
): ResultadoCampana => ({
  automatica: false,
  segmento: 'Todos los suscritos',
  enviados: 0,
  porcentajeAbiertos: null,
  porcentajeClic: null,
  rebotados: 0,
  cancelados: 0,
  fallidos: 0,
  ...datos,
});

/** Las más recientes primero, como las ordena el backend. */
const CAMPANAS = [
  campana({
    codigo: 'CMP-12',
    nombre: 'Mascarillas 20% dcto.',
    // 1 de septiembre, 10:00 en Chile
    fecha: '2026-09-01T14:00:00.000Z',
    enviados: 2140,
    porcentajeAbiertos: 41,
    porcentajeClic: 9,
    rebotados: 38,
    cancelados: 12,
    fallidos: 4,
  }),
  campana({
    codigo: 'CMP-11',
    nombre: 'Novedades para peluqueros',
    fecha: '2026-08-18T14:00:00.000Z',
    segmento: 'Profesionales',
    enviados: 312,
    porcentajeAbiertos: 58,
    porcentajeClic: 17,
    rebotados: 6,
    cancelados: 1,
  }),
  campana({
    codigo: 'CUMPLEANOS-2026-08',
    nombre: 'Saludo de cumpleaños',
    automatica: true,
    fecha: '2026-08',
    segmento: null,
    enviados: 87,
    porcentajeAbiertos: 63,
    porcentajeClic: 21,
    rebotados: 2,
  }),
];

const responderCampanas =
  (campanas: ResultadoCampana[]): Responder =>
  (desde, hasta) =>
    Response.json({ desde, hasta, campanas } satisfies ReporteCampanas);

interface OtrosReportes {
  carritos?: Responder;
  campanas?: Responder;
}

const simularBackend = (
  responder: Responder = conDatos,
  responderObjetivosDe: Responder = objetivosConDatos,
  {
    carritos: responderCarritosDe = responderCarritos(CARRITOS_SEIS_MESES),
    campanas: responderCampanasDe = responderCampanas(CAMPANAS),
  }: OtrosReportes = {},
) => {
  const pedidas: string[] = [];
  const objetivosPedidos: string[] = [];
  const carritosPedidos: string[] = [];
  const campanasPedidas: string[] = [];
  const fetch = vi.fn(async (peticion: Request) => {
    const url = new URL(peticion.url);
    const desde = url.searchParams.get('desde') ?? '';
    const hasta = url.searchParams.get('hasta') ?? '';
    if (url.pathname === '/api/reportes/objetivos') {
      objetivosPedidos.push(`${desde}|${hasta}`);
      return responderObjetivosDe(desde, hasta);
    }
    if (url.pathname === '/api/reportes/carritos') {
      carritosPedidos.push(`${desde}|${hasta}`);
      return responderCarritosDe(desde, hasta);
    }
    if (url.pathname === '/api/reportes/campanas') {
      campanasPedidas.push(`${desde}|${hasta}`);
      return responderCampanasDe(desde, hasta);
    }
    if (url.pathname !== '/api/reportes/ventas') {
      throw new Error(`Petición no simulada: ${url.pathname}`);
    }
    pedidas.push(`${desde}|${hasta}`);
    return responder(desde, hasta);
  });
  vi.stubGlobal('fetch', fetch);
  return { pedidas, objetivosPedidos, carritosPedidos, campanasPedidas };
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

/** La tarjeta (o fila, en el celular) del objetivo, por su título. */
const tarjetaObjetivo = async (titulo: string) => {
  const encabezado = await screen.findByRole('heading', {
    level: 3,
    name: titulo,
  });
  const tarjeta = encabezado.closest('li');
  if (!tarjeta) throw new Error(`Sin tarjeta para ${titulo}`);
  return within(tarjeta);
};

describe('Reporte de objetivos (SCRUM-142)', () => {
  it('E14-H1 FE · CA1 indicadores: muestra OE1, OE2 y OE3 con valor, meta, barra y estado', async () => {
    simularBackend();
    mostrar();

    const oe1 = await tarjetaObjetivo('OE1 · Peluqueros que compran');
    expect(oe1.getByText('24%')).toBeInTheDocument();
    expect(oe1.getByText('meta 30%')).toBeInTheDocument();
    const barra = oe1.getByRole('meter', { name: 'Avance de OE1' });
    expect(barra).toHaveAttribute('aria-valuenow', '24');
    expect(barra).toHaveAttribute('aria-valuetext', '24%, meta 30%');
    expect(oe1.getByText('Bajo la meta')).toBeInTheDocument();
    expect(
      oe1.getByText(
        '41 de 171 cuentas con solicitud están verificadas y compraron a precio mayorista',
      ),
    ).toBeInTheDocument();

    const oe2 = await tarjetaObjetivo('OE2 · Verificaciones en 48 horas');
    expect(oe2.getByText('78%')).toBeInTheDocument();
    expect(oe2.getByText('meta 70%')).toBeInTheDocument();
    expect(oe2.getByText('Sobre la meta')).toBeInTheDocument();
    expect(
      oe2.getByText('112 de 144 solicitudes resueltas dentro de 48 horas'),
    ).toBeInTheDocument();

    const oe3 = await tarjetaObjetivo('OE3 · Descripciones con IA');
    expect(oe3.getByText('85%')).toBeInTheDocument();
    expect(oe3.getByText('meta 80%')).toBeInTheDocument();
    expect(oe3.getByText('Sobre la meta')).toBeInTheDocument();
    expect(
      oe3.getByText(
        '34 de 40 productos nuevos usan la descripción de IA o IA editada',
      ),
    ).toBeInTheDocument();
  });

  it('E14-H1 FE · CA1 indicadores: el estado es el que entrega el backend', async () => {
    // 50 supera la meta, pero el frontend no compara: muestra el estado recibido (RNF-03)
    simularBackend(
      conDatos,
      responderObjetivos([objetivo('OE1', 30, 50, 5, 10, 'bajo-la-meta')]),
    );
    mostrar();

    const oe1 = await tarjetaObjetivo('OE1 · Peluqueros que compran');
    expect(oe1.getByText('Bajo la meta')).toBeInTheDocument();
  });

  it('E14-H1 FE · CA2 período: al cambiar el período, los indicadores se actualizan', async () => {
    const usuario = userEvent.setup();
    const { objetivosPedidos } = simularBackend();
    mostrar();

    const oe1 = await tarjetaObjetivo('OE1 · Peluqueros que compran');
    expect(oe1.getByText('24%')).toBeInTheDocument();
    expect(objetivosPedidos).toEqual(['2026-04-01|2026-09-15']);

    await usuario.click(screen.getByRole('radio', { name: 'Este mes' }));

    expect(await screen.findByText('33%')).toBeInTheDocument();
    expect(objetivosPedidos).toContain('2026-09-01|2026-09-15');
    const actualizado = await tarjetaObjetivo('OE1 · Peluqueros que compran');
    expect(actualizado.getByText('Sobre la meta')).toBeInTheDocument();
    const oe2 = await tarjetaObjetivo('OE2 · Verificaciones en 48 horas');
    expect(oe2.getByText('60%')).toBeInTheDocument();
    expect(oe2.getByText('Bajo la meta')).toBeInTheDocument();
  });

  it('E14-H1 FE · CA3 sin datos: lo indica en vez de un valor', async () => {
    simularBackend(
      conDatos,
      responderObjetivos([
        objetivo('OE1', 30, null, 0, 0, 'sin-datos'),
        objetivo('OE2', 70, null, 0, 0, 'sin-datos'),
        objetivo('OE3', 80, null, 0, 0, 'sin-datos'),
      ]),
    );
    mostrar();

    const oe1 = await tarjetaObjetivo('OE1 · Peluqueros que compran');
    expect(oe1.getByText('Sin datos en el período')).toBeInTheDocument();
    expect(oe1.queryByText(/^\d+%$/)).not.toBeInTheDocument();
    expect(oe1.getByText('meta 30%')).toBeInTheDocument();
    expect(oe1.queryByText(/la meta$/)).not.toBeInTheDocument();
    expect(
      oe1.getByText('No hay cuentas con solicitud en el período.'),
    ).toBeInTheDocument();
    // Sin valor no hay avance que medir: la barra vacía solo se ve
    expect(oe1.queryByRole('meter')).not.toBeInTheDocument();

    const oe3 = await tarjetaObjetivo('OE3 · Descripciones con IA');
    expect(
      oe3.getByText('No hay productos nuevos en el período.'),
    ).toBeInTheDocument();
  });

  it('E14-H1 FE · si falla la consulta, muestra el mensaje del backend y las ventas siguen', async () => {
    simularBackend(conDatos, () =>
      Response.json(
        { statusCode: 400, message: 'El período no es válido.' },
        { status: 400 },
      ),
    );
    mostrar();

    expect(
      await screen.findByText('El período no es válido.'),
    ).toBeInTheDocument();
    expect(await resumen()).toBeTruthy();
  });

  it('E14-H1 FE · sin permiso: muestra el mensaje del backend y no los indicadores', async () => {
    simularBackend(conDatos, () =>
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
    expect(
      screen.queryByRole('heading', { level: 3, name: /^OE1/ }),
    ).not.toBeInTheDocument();
  });

  it('E14-H1 FE · mientras carga muestra el esqueleto, sin porcentajes', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );
    mostrar();

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: /^OE1/ }),
    ).not.toBeInTheDocument();
  });
});

const seccion = async (nombre: string | RegExp) =>
  within(await screen.findByRole('region', { name: nombre }));

const cifras = (tarjeta: ReturnType<typeof within>) =>
  tarjeta
    .getAllByRole('definition')
    .map((cifra: HTMLElement) => cifra.textContent);

describe('Reporte de carritos y campañas (SCRUM-144)', () => {
  it('E14-H3 FE · CA1 carritos: muestra por mes los abandonados y los recuperados', async () => {
    const { carritosPedidos } = simularBackend();
    mostrar();

    const tarjeta = await seccion('Carritos abandonados');
    expect(carritosPedidos).toEqual(['2026-04-01|2026-09-15']);
    const meses = within(
      tarjeta.getByRole('list', { name: 'Carritos por mes' }),
    ).getAllByRole('listitem');
    expect(meses).toHaveLength(6);
    expect(meses[0]).toHaveTextContent(
      'Abril: 82 carritos abandonados, 13 terminaron en compra (16%).',
    );
    expect(meses[5]).toHaveTextContent(
      'Septiembre: 110 carritos abandonados, 27 terminaron en compra (25%).',
    );
    // Bajo el gráfico, el último mes (Figma 2041:1454)
    expect(
      tarjeta.getByText(
        'Sep: 110 carritos abandonados, 27 terminaron en compra (25%).',
      ),
    ).toBeInTheDocument();
  });

  it('E14-H3 FE · CA1 carritos: en celular, las cifras del último mes', async () => {
    simularBackend();
    mostrar();

    const tarjeta = await seccion('Carritos abandonados');
    expect(cifras(tarjeta)).toEqual(['110', '27', '25%']);
    expect(
      tarjeta.getAllByRole('term').map((termino) => termino.textContent),
    ).toEqual(['abandonados (sep)', 'con compra', 'recuperados']);
  });

  it('E14-H3 FE · CA1 carritos: al cambiar el período, se piden sus meses', async () => {
    const usuario = userEvent.setup();
    const { carritosPedidos } = simularBackend(conDatos, objetivosConDatos, {
      carritos: (desde, hasta) =>
        responderCarritos(
          desde === '2026-09-01'
            ? [carritos('2026-09', 3, 1, 33)]
            : CARRITOS_SEIS_MESES,
        )(desde, hasta),
    });
    mostrar();
    await seccion('Carritos abandonados');

    await usuario.click(screen.getByRole('radio', { name: 'Este mes' }));

    expect(
      await screen.findByText(
        'Sep: 3 carritos abandonados, 1 terminó en compra (33%).',
      ),
    ).toBeInTheDocument();
    expect(carritosPedidos).toContain('2026-09-01|2026-09-15');
  });

  it('E14-H3 FE · CA1 carritos: sin abandonos en el período, lo dice', async () => {
    simularBackend(conDatos, objetivosConDatos, {
      carritos: responderCarritos([
        carritos('2026-08', 0, 0, null),
        carritos('2026-09', 0, 0, null),
      ]),
    });
    mostrar();

    const tarjeta = await seccion('Carritos abandonados');
    expect(
      tarjeta.getByText('No hay carritos abandonados en el período.'),
    ).toBeInTheDocument();
    expect(tarjeta.queryByRole('definition')).not.toBeInTheDocument();
  });

  it('E14-H3 FE · CA1 carritos: sin porcentaje del backend, no lo inventa', async () => {
    simularBackend(conDatos, objetivosConDatos, {
      carritos: responderCarritos([
        carritos('2026-08', 4, 1, 25),
        carritos('2026-09', 0, 0, null),
      ]),
    });
    mostrar();

    const tarjeta = await seccion('Carritos abandonados');
    expect(
      tarjeta.getByText('Sep: 0 carritos abandonados, 0 terminaron en compra.'),
    ).toBeInTheDocument();
    expect(cifras(tarjeta)).toEqual(['0', '0', '–']);
  });

  it('E14-H3 FE · CA2 campañas: muestra enviados, abiertos, con clic, rebotados, cancelados y fallidos', async () => {
    const { campanasPedidas } = simularBackend();
    mostrar();

    const tarjeta = await seccion(/Resultados de campañas/);
    expect(campanasPedidas).toEqual(['2026-04-01|2026-09-15']);
    const tabla = within(tarjeta.getByRole('table'));
    expect(
      tabla.getAllByRole('columnheader').map((celda) => celda.textContent),
    ).toEqual([
      'Campaña',
      'Enviados',
      'Abiertos',
      'Con clic',
      'Rebotados',
      'Cancelados',
      'Fallidos',
    ]);
    const filas = tabla.getAllByRole('row');
    expect(filas).toHaveLength(4);
    expect(
      within(filas[1])
        .getAllByRole('cell')
        .map((celda) => celda.textContent),
    ).toEqual([
      'Mascarillas 20% dcto.1 sept · Todos los suscritos',
      '2.140',
      '41%',
      '9%',
      '38',
      '12',
      '4',
    ]);
    expect(filas[2]).toHaveTextContent('18 ago · Profesionales');
    // El saludo de cumpleaños: el mes y «Automático»
    expect(filas[3]).toHaveTextContent('Saludo de cumpleaños');
    expect(filas[3]).toHaveTextContent('Agosto · Automático');
  });

  it('E14-H3 FE · CA2 campañas: en celular, la última campaña con sus seis cifras', async () => {
    simularBackend();
    mostrar();

    const tarjeta = await seccion(/Última campaña/);
    expect(
      tarjeta.getByText('Mascarillas 20% dcto. · 1 sept'),
    ).toBeInTheDocument();
    expect(cifras(tarjeta)).toEqual(['2.140', '41%', '9%', '38', '12', '4']);
    expect(
      tarjeta.getAllByRole('term').map((termino) => termino.textContent),
    ).toEqual([
      'enviados',
      'abiertos',
      'con clic',
      'rebotados',
      'cancelados',
      'fallidos',
    ]);
    expect(
      tarjeta.getByRole('link', { name: 'Ver todas las campañas' }),
    ).toHaveAttribute('href', '/panel/campanas');
  });

  it('E14-H3 FE · CA2 campañas: sin campañas enviadas en el período, lo dice', async () => {
    simularBackend(conDatos, objetivosConDatos, {
      campanas: responderCampanas([]),
    });
    mostrar();

    const tarjeta = await seccion(/Última campaña/);
    expect(
      tarjeta.getByText('No hay campañas enviadas en el período.'),
    ).toBeInTheDocument();
    expect(tarjeta.queryByRole('table')).not.toBeInTheDocument();
  });

  it('E14-H3 FE · si falla una consulta, muestra el mensaje del backend y lo demás sigue', async () => {
    simularBackend(conDatos, objetivosConDatos, {
      carritos: () =>
        Response.json(
          {
            statusCode: 403,
            message: 'No tienes permiso para ver los reportes.',
          },
          { status: 403 },
        ),
    });
    mostrar();

    expect(
      await screen.findByText('No tienes permiso para ver los reportes.'),
    ).toBeInTheDocument();
    expect(await seccion(/Última campaña/)).toBeTruthy();
    expect(
      screen.queryByRole('region', { name: 'Carritos abandonados' }),
    ).not.toBeInTheDocument();
  });

  it('E14-H3 FE · si fallan las campañas, muestra el mensaje del backend y los carritos siguen', async () => {
    simularBackend(conDatos, objetivosConDatos, {
      campanas: () =>
        Response.json(
          { statusCode: 400, message: 'El período no es válido.' },
          { status: 400 },
        ),
    });
    mostrar();

    expect(
      await screen.findByText('El período no es válido.'),
    ).toBeInTheDocument();
    expect(await seccion('Carritos abandonados')).toBeTruthy();
    expect(
      screen.queryByRole('region', { name: /Última campaña/ }),
    ).not.toBeInTheDocument();
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
