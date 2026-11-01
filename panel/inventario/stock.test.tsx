import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  ListadoMovimientos,
  ListadoStock,
  MovimientoListado,
  StockFormato,
  StockListado,
  UbicacionInventario,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { PantallaMovimientos } from './pantallaMovimientos';
import { PantallaStock } from './pantallaStock';

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

vi.mock('next/navigation', () => ({
  usePathname: () => '/panel/inventario',
}));

const UBICACIONES: UbicacionInventario[] = [
  { id: 1, codigo: 'A-01', bodega: { id: 1, nombre: 'Bodega principal' } },
  { id: 4, codigo: 'S-01', bodega: { id: 2, nombre: 'Sala de ventas' } },
];

const SHAMPOO: StockListado = {
  formatoId: 11,
  sku: 'SH-REP-300',
  producto: 'Shampoo reparador',
  nombreFormato: '300 ml',
  imagen: null,
  ubicaciones: [
    { id: 1, codigo: 'A-01' },
    { id: 4, codigo: 'S-01' },
  ],
  stock: 2,
  stockMinimo: 5,
  bajoMinimo: true,
  ultimaEntrada: {
    costoUnitarioNeto: 4200,
    proveedor: { id: 3, razonSocial: 'Distribuidora Capilar SpA' },
  },
};

/** Nunca se recibió (criterio 3). */
const SERUM: StockListado = {
  formatoId: 15,
  sku: 'SER-PUN-60',
  producto: 'Sérum de puntas',
  nombreFormato: '60 ml',
  imagen: null,
  ubicaciones: [],
  stock: 0,
  stockMinimo: null,
  bajoMinimo: false,
  ultimaEntrada: null,
};

const listadoStock = (items: StockListado[]): ListadoStock => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
  totalBajoMinimo: 3,
});

const VENTA: MovimientoListado = {
  id: 9,
  fechaHora: '2026-10-12T13:15:00Z',
  tipo: 'venta',
  formato: { id: 11, producto: 'Shampoo reparador', nombreFormato: '300 ml' },
  cantidad: -1,
  ubicacion: { id: 1, codigo: 'A-01', bodega: 'Bodega principal' },
  destino: null,
  referencia: 'CP-10490',
  registradoPor: null,
};

const TRANSFERENCIA: MovimientoListado = {
  id: 7,
  fechaHora: '2026-10-11T19:40:00Z',
  tipo: 'transferencia',
  formato: { id: 11, producto: 'Shampoo reparador', nombreFormato: '300 ml' },
  cantidad: 6,
  ubicacion: { id: 1, codigo: 'A-01', bodega: 'Bodega principal' },
  destino: { id: 4, codigo: 'S-01', bodega: 'Sala de ventas' },
  referencia: null,
  registradoPor: { nombre: 'Jorge Pino' },
};

const ENTRADA: MovimientoListado = {
  id: 3,
  fechaHora: '2026-09-28T14:20:00Z',
  tipo: 'entrada',
  formato: {
    id: 14,
    producto: 'Acondicionador hidratante',
    nombreFormato: '300 ml',
  },
  cantidad: 24,
  ubicacion: { id: 1, codigo: 'A-01', bodega: 'Bodega principal' },
  destino: null,
  referencia: 'F-004398',
  registradoPor: { nombre: 'Jorge Pino' },
};

const listadoMovimientos = (
  items: MovimientoListado[],
  total = items.length,
): ListadoMovimientos => ({ items, total, pagina: 1, limite: 20 });

const STOCK_SHAMPOO: StockFormato = {
  formato: {
    id: 11,
    nombreFormato: '300 ml',
    sku: 'SH-REP-300',
    producto: 'Shampoo reparador',
    activo: true,
  },
  ubicaciones: [
    {
      id: 1,
      codigo: 'A-01',
      bodega: 'Bodega principal',
      activa: true,
      cantidad: 1,
    },
    {
      id: 4,
      codigo: 'S-01',
      bodega: 'Sala de ventas',
      activa: false,
      cantidad: 1,
    },
  ],
  total: 2,
  ultimaEntrada: {
    fechaRecepcion: '2026-09-28',
    proveedor: {
      id: 3,
      rut: '76086428-5',
      razonSocial: 'Distribuidora Capilar SpA',
    },
    costoUnitarioNeto: 4200,
  },
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de las dos pantallas; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: Request[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/inventario/stock': () =>
      Response.json(listadoStock([SHAMPOO, SERUM])),
    'GET /api/inventario/movimientos': () =>
      Response.json(listadoMovimientos([VENTA, TRANSFERENCIA, ENTRADA])),
    'GET /api/inventario/ubicaciones': () => Response.json(UBICACIONES),
    ...rutas,
  };
  const fetch = vi.fn(async (peticion: Request) => {
    pedidas.push(peticion.clone());
    const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
    const manejador = base[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return { pedidas };
};

/** Consultas enviadas a una ruta, como objetos. */
const consultasA = (pedidas: Request[], ruta: string) =>
  pedidas
    .filter((peticion) => new URL(peticion.url).pathname === ruta)
    .map((peticion) => Object.fromEntries(new URL(peticion.url).searchParams));

const error = (status: number, message: string) =>
  Response.json({ statusCode: status, message }, { status });

/** jsdom no tiene matchMedia: sin ella, la pantalla se comporta como en celular. */
const simularEscritorio = () =>
  vi.stubGlobal(
    'matchMedia',
    (consulta: string) =>
      ({
        matches: true,
        media: consulta,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );

const mostrar = (pantalla: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {pantalla}
    </QueryClientProvider>,
  );

const textos = (elementos: HTMLElement[]) =>
  elementos.map((elemento) => elemento.textContent);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-31T12:00:00-03:00'));
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Jorge',
        apellido: 'Pino',
        rol: 'bodeguero',
      },
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Inventario · Stock (SCRUM-114)', () => {
  it('E11-H5 FE · CA1 stock: muestra por formato las ubicaciones, el stock, el mínimo, el último costo neto y el último proveedor', async () => {
    simularEscritorio();
    const { pedidas } = simularBackend();
    mostrar(<PantallaStock />);

    const tabla = await screen.findByRole('table', {
      name: 'Stock por formato',
    });
    expect(textos(within(tabla).getAllByRole('columnheader'))).toEqual([
      'Formato',
      'Ubicaciones',
      'Stock',
      'Mínimo',
      'Último costo neto',
      'Último proveedor',
      'Detalle',
    ]);
    const celdas = within(within(tabla).getAllByRole('row')[1]).getAllByRole(
      'cell',
    );
    expect(textos(celdas).slice(0, 6)).toEqual([
      'Shampoo reparador · 300 mlSH-REP-300',
      'A-01 · S-01',
      '2 (bajo el mínimo)',
      '5',
      '$4.200',
      'Distribuidora Capilar SpA',
    ]);
    // En escritorio parte con todos los formatos
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(consultasA(pedidas, '/api/inventario/stock')[0]).toEqual({});
  });

  it('E11-H5 FE · CA1 bajo el mínimo: la cifra lleva el color de aviso solo si el backend lo marca', async () => {
    simularEscritorio();
    simularBackend();
    mostrar(<PantallaStock />);

    const tabla = await screen.findByRole('table', {
      name: 'Stock por formato',
    });
    const [, bajo, normal] = within(tabla).getAllByRole('row');
    expect(within(bajo).getByText('2')).toHaveClass('bg-estado-aviso-fondo');
    expect(within(normal).getByText('0')).not.toHaveClass(
      'bg-estado-aviso-fondo',
    );
  });

  it('E11-H5 FE · CA1 bodega elegible: envía la bodega y la búsqueda al backend', async () => {
    simularEscritorio();
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaStock />);
    await screen.findByRole('table', { name: 'Stock por formato' });

    await usuario.click(screen.getByRole('combobox', { name: 'Bodega' }));
    await usuario.click(
      await screen.findByRole('option', { name: 'Sala de ventas' }),
    );
    await usuario.type(
      screen.getByLabelText('Buscar por formato, SKU o código de barras'),
      'SH-REP',
    );

    await waitFor(
      () =>
        expect(consultasA(pedidas, '/api/inventario/stock').at(-1)).toEqual({
          bodegaId: '2',
          buscar: 'SH-REP',
        }),
      { timeout: 3000 },
    );
    // Los últimos movimientos también siguen a la bodega
    await waitFor(() =>
      expect(consultasA(pedidas, '/api/inventario/movimientos').at(-1)).toEqual(
        { bodegaId: '2', limite: '5' },
      ),
    );
  });

  it('E11-H5 FE · CA1 últimos movimientos: en escritorio muestra los 5 más recientes bajo la tabla', async () => {
    simularEscritorio();
    const { pedidas } = simularBackend();
    mostrar(<PantallaStock />);

    const ultimos = await screen.findByRole('table', {
      name: 'Últimos movimientos',
    });
    expect(within(ultimos).getAllByRole('row')).toHaveLength(4);
    expect(consultasA(pedidas, '/api/inventario/movimientos')).toEqual([
      { limite: '5' },
    ]);
  });

  it('E11-H5 FE · CA1 en celular: la lista parte filtrada por bajo el mínimo y se puede ver todo', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaStock />);

    const lista = await screen.findByRole('list', {
      name: 'Stock por formato',
    });
    expect(within(lista).getAllByRole('listitem')[0]).toHaveTextContent(
      'Shampoo reparador · 300 mlUbicación A-01 · S-01 · mín. 52 (bajo el mínimo)',
    );
    expect(
      screen.getByRole('button', { name: 'Bajo el mínimo · 3' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(consultasA(pedidas, '/api/inventario/stock')[0]).toEqual({
      bajoMinimo: 'true',
    });
    // Los últimos movimientos son solo de escritorio
    expect(consultasA(pedidas, '/api/inventario/movimientos')).toEqual([]);

    await usuario.click(screen.getByRole('button', { name: 'Todos' }));
    await waitFor(() =>
      expect(consultasA(pedidas, '/api/inventario/stock').at(-1)).toEqual({}),
    );
  });

  it('E11-H5 FE · CA1 detalle: la flecha muestra las unidades por ubicación y la última entrada', async () => {
    simularEscritorio();
    simularBackend({
      'GET /api/inventario/stock/formatos/11': () =>
        Response.json(STOCK_SHAMPOO),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaStock />);

    await usuario.click(
      await screen.findByRole('button', {
        name: 'Ver el stock de Shampoo reparador · 300 ml por ubicación',
      }),
    );

    const panel = await screen.findByRole('dialog', {
      name: 'Shampoo reparador · 300 ml',
    });
    expect(
      await within(panel).findByText('Bodega principal · A-01'),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/Sala de ventas · S-01/)).toHaveTextContent(
      'Sala de ventas · S-01 (desactivada)',
    );
    expect(within(panel).getByText('Total').parentElement).toHaveTextContent(
      'Total2',
    );
    expect(within(panel).getByText('28 sept 2026')).toBeInTheDocument();
    expect(within(panel).getByText('$4.200')).toBeInTheDocument();
  });

  it('E11-H5 FE · CA3 sin entradas: el formato nunca recibido muestra stock cero y sin proveedor ni costo', async () => {
    simularEscritorio();
    simularBackend({
      'GET /api/inventario/stock/formatos/15': () =>
        Response.json({
          formato: {
            id: 15,
            nombreFormato: '60 ml',
            sku: 'SER-PUN-60',
            producto: 'Sérum de puntas',
            activo: true,
          },
          ubicaciones: [],
          total: 0,
          ultimaEntrada: null,
        } satisfies StockFormato),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaStock />);

    const tabla = await screen.findByRole('table', {
      name: 'Stock por formato',
    });
    const fila = within(tabla).getAllByRole('row')[2];
    expect(textos(within(fila).getAllByRole('cell')).slice(1, 6)).toEqual([
      '—',
      '0',
      '—',
      '—',
      '—',
    ]);

    await usuario.click(
      within(fila).getByRole('button', { name: /Ver el stock/ }),
    );
    const panel = await screen.findByRole('dialog');
    expect(
      await within(panel).findByText(
        'Este formato aún no se ha recibido: no tiene proveedor ni costo.',
      ),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText('No hay unidades en ninguna ubicación.'),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA1 sin formatos: lo dice', async () => {
    simularEscritorio();
    simularBackend({
      'GET /api/inventario/stock': () => Response.json(listadoStock([])),
    });
    mostrar(<PantallaStock />);
    expect(
      await screen.findByText('Aún no hay formatos en el catálogo.'),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA1 en celular sin nada bajo el mínimo: lo dice sin hablar de filtros', async () => {
    simularBackend({
      'GET /api/inventario/stock': () => Response.json(listadoStock([])),
    });
    mostrar(<PantallaStock />);
    expect(
      await screen.findByText('Ningún formato está bajo el mínimo.'),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA1 error: muestra el mensaje del backend', async () => {
    simularBackend({
      'GET /api/inventario/stock': () =>
        error(403, 'No tienes permiso para consultar inventario.'),
    });
    mostrar(<PantallaStock />);
    expect(
      await screen.findByText('No tienes permiso para consultar inventario.'),
    ).toBeInTheDocument();
  });
  it('E11-H5 FE · CA1 sin resultados con filtros: lo dice', async () => {
    simularEscritorio();
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaStock />);
    await screen.findByRole('table', { name: 'Stock por formato' });

    simularBackend({
      'GET /api/inventario/stock': () => Response.json(listadoStock([])),
    });
    await usuario.type(
      screen.getByLabelText('Buscar por formato, SKU o código de barras'),
      'xyz',
    );
    expect(
      await screen.findByText(
        'Ningún formato coincide con los filtros.',
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(pedidas.length).toBeGreaterThan(0);
  });

  it('E11-H5 FE · CA1 y CA3 en celular: la fila abre el detalle; sin entradas, stock cero y sin proveedor ni costo', async () => {
    simularBackend({
      'GET /api/inventario/stock': () =>
        Response.json(listadoStock([SHAMPOO, SERUM])),
      'GET /api/inventario/stock/formatos/15': () =>
        Response.json({
          formato: {
            id: 15,
            nombreFormato: '60 ml',
            sku: 'SER-PUN-60',
            producto: 'Sérum de puntas',
            activo: true,
          },
          ubicaciones: [],
          total: 0,
          ultimaEntrada: null,
        } satisfies StockFormato),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaStock />);

    const lista = await screen.findByRole('list', {
      name: 'Stock por formato',
    });
    const serum = within(lista).getAllByRole('listitem')[1];
    expect(serum).toHaveTextContent('Sérum de puntas · 60 mlSin ubicación0');

    await usuario.click(within(serum).getByRole('button'));
    const panel = await screen.findByRole('dialog', {
      name: 'Sérum de puntas · 60 ml',
    });
    expect(
      await within(panel).findByText(
        'Este formato aún no se ha recibido: no tiene proveedor ni costo.',
      ),
    ).toBeInTheDocument();
  });

  it('E11-H6 FE · CA2 alerta en inventario (celular): la cifra bajo el mínimo lleva el color de aviso', async () => {
    simularBackend({
      'GET /api/inventario/stock': () =>
        Response.json(listadoStock([SHAMPOO, SERUM])),
    });
    mostrar(<PantallaStock />);

    const lista = await screen.findByRole('list', {
      name: 'Stock por formato',
    });
    const [bajo, normal] = within(lista).getAllByRole('listitem');
    expect(within(bajo).getByText('2')).toHaveClass('bg-estado-aviso-fondo');
    expect(within(normal).getByText('0')).not.toHaveClass(
      'bg-estado-aviso-fondo',
    );
  });

  it('E11-H5 FE · CA1 últimos movimientos: si el backend falla, muestra su mensaje', async () => {
    simularEscritorio();
    simularBackend({
      'GET /api/inventario/movimientos': () =>
        error(403, 'No tienes permiso para consultar inventario.'),
    });
    mostrar(<PantallaStock />);
    const ultimos = await screen.findByRole('region', {
      name: 'Últimos movimientos',
    });
    expect(
      await within(ultimos).findByText(
        'No tienes permiso para consultar inventario.',
      ),
    ).toBeInTheDocument();
  });
});

describe('Inventario · Movimientos (SCRUM-114)', () => {
  it('E11-H5 FE · CA2 movimientos: muestra tipo, formato, ubicación, cantidad, referencia y quién lo registró', async () => {
    simularBackend();
    mostrar(<PantallaMovimientos />);

    const tabla = await screen.findByRole('table', {
      name: 'Movimientos de inventario',
    });
    expect(textos(within(tabla).getAllByRole('columnheader'))).toEqual([
      'Fecha',
      'Tipo',
      'Formato',
      'Ubicación',
      'Cantidad',
      'Referencia',
      'Registró',
    ]);
    const filas = within(tabla)
      .getAllByRole('row')
      .slice(1)
      .map((fila) => textos(within(fila).getAllByRole('cell')).slice(1));
    expect(filas).toEqual([
      [
        'Venta',
        'Shampoo reparador · 300 ml',
        'A-01',
        '-1',
        'CP-10490',
        'Sistema',
      ],
      [
        'Transferencia',
        'Shampoo reparador · 300 ml',
        'A-01 → S-01',
        '6',
        '—',
        'Jorge Pino',
      ],
      [
        'Entrada',
        'Acondicionador hidratante · 300 ml',
        'A-01',
        '+24',
        'F-004398',
        'Jorge Pino',
      ],
    ]);
    // La fecha y hora, en la hora de Chile
    expect(within(tabla).getAllByRole('row')[1]).toHaveTextContent(
      /12 oct.*10:15/,
    );
    expect(
      screen.getByText(
        /Los movimientos no se editan: un error se corrige con un ajuste\./,
      ),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA2 filtros: envía al backend el tipo, el período, la bodega y la búsqueda', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaMovimientos />);
    await screen.findByRole('table', { name: 'Movimientos de inventario' });

    await usuario.click(screen.getByRole('button', { name: 'Ventas' }));
    expect(screen.getByRole('button', { name: 'Ventas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await usuario.click(screen.getByRole('combobox', { name: 'Bodega' }));
    await usuario.click(
      await screen.findByRole('option', { name: 'Bodega principal' }),
    );
    await usuario.type(
      screen.getByLabelText('Buscar movimientos por formato o referencia'),
      'CP-104',
    );
    // La búsqueda espera a que se deje de escribir: se aplica antes de abrir el calendario
    await waitFor(
      () =>
        expect(
          consultasA(pedidas, '/api/inventario/movimientos').at(-1),
        ).toHaveProperty('buscar', 'CP-104'),
      { timeout: 3000 },
    );
    await usuario.click(screen.getByRole('button', { name: /Período/ }));
    await usuario.click(
      screen.getByRole('button', { name: 'jueves, 1 de octubre de 2026' }),
    );
    await usuario.click(
      screen.getByRole('button', { name: 'miércoles, 14 de octubre de 2026' }),
    );

    await waitFor(
      () =>
        expect(
          consultasA(pedidas, '/api/inventario/movimientos').at(-1),
        ).toEqual({
          grupo: 'ventas',
          bodegaId: '1',
          buscar: 'CP-104',
          desde: '2026-10-01',
          hasta: '2026-10-14',
        }),
      { timeout: 3000 },
    );
  });

  it('E11-H5 FE · CA2 sin resultados: lo dice según haya filtros o no', async () => {
    simularBackend({
      'GET /api/inventario/movimientos': () =>
        Response.json(listadoMovimientos([])),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaMovimientos />);

    expect(
      await screen.findByText('Aún no hay movimientos registrados.'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Salidas' }));
    expect(
      await screen.findByText('Ningún movimiento coincide con los filtros.'),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA2 más resultados que los mostrados: dice cuántos hay', async () => {
    simularBackend({
      'GET /api/inventario/movimientos': () =>
        Response.json(listadoMovimientos([VENTA], 126)),
    });
    mostrar(<PantallaMovimientos />);
    expect(
      await screen.findByText(/Mostrando 1 de 126 movimientos\./),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA2 tipos: nombra mermas, consumo, ajustes y reingresos', async () => {
    const base = { ...VENTA, registradoPor: { nombre: 'Jorge Pino' } };
    simularBackend({
      'GET /api/inventario/movimientos': () =>
        Response.json(
          listadoMovimientos([
            {
              ...base,
              id: 1,
              tipo: 'merma_vencimiento',
              referencia: 'Vencido',
            },
            { ...base, id: 2, tipo: 'merma_dano', referencia: 'Envase roto' },
            { ...base, id: 3, tipo: 'consumo_peluqueria', referencia: null },
            { ...base, id: 4, tipo: 'ajuste_positivo', cantidad: 2 },
            { ...base, id: 5, tipo: 'ajuste_negativo', cantidad: -2 },
            { ...VENTA, id: 6, tipo: 'reingreso', cantidad: 1 },
          ]),
        ),
    });
    mostrar(<PantallaMovimientos />);

    const tabla = await screen.findByRole('table', {
      name: 'Movimientos de inventario',
    });
    const tiposYCantidades = within(tabla)
      .getAllByRole('row')
      .slice(1)
      .map((fila) => {
        const celdas = textos(within(fila).getAllByRole('cell'));
        return [celdas[1], celdas[4]];
      });
    expect(tiposYCantidades).toEqual([
      ['Merma por vencimiento', '-1'],
      ['Merma por daño', '-1'],
      ['Consumo en peluquería', '-1'],
      ['Ajuste positivo', '+2'],
      ['Ajuste negativo', '-2'],
      ['Reingreso por cancelación', '+1'],
    ]);
  });

  it('E11-H5 FE · CA2 error: muestra el mensaje del backend', async () => {
    simularBackend({
      'GET /api/inventario/movimientos': () =>
        error(403, 'No tienes permiso para consultar inventario.'),
    });
    mostrar(<PantallaMovimientos />);
    expect(
      await screen.findByText('No tienes permiso para consultar inventario.'),
    ).toBeInTheDocument();
  });

  it('E11-H5 FE · CA2 en celular: cada movimiento con tipo, ubicación, referencia, fecha y quién lo registró', async () => {
    simularBackend();
    mostrar(<PantallaMovimientos />);

    const lista = await screen.findByRole('list', {
      name: 'Movimientos de inventario',
    });
    const [venta, transferencia] = within(lista).getAllByRole('listitem');
    expect(venta).toHaveTextContent('Venta · A-01 · CP-10490');
    expect(venta).toHaveTextContent(/· Sistema/);
    expect(transferencia).toHaveTextContent('Transferencia · A-01 → S-01');
    expect(transferencia).toHaveTextContent('Cantidad: 6');
  });
});
