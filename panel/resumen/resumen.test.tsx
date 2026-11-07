import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  FormatoBajoMinimo,
  ListadoPedidosGestion,
  PedidoGestion,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { PantallaResumen } from './pantallaResumen';

const navegacion = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navegacion.push }),
}));

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

const formato = (
  formatoId: number,
  producto: string,
  nombreFormato: string,
  stockTotal: number,
  stockMinimo: number,
): FormatoBajoMinimo => ({
  formatoId,
  sku: `SKU-${formatoId}`,
  producto,
  nombreFormato,
  activo: true,
  stockMinimo,
  stockTotal,
  faltante: stockMinimo - stockTotal,
});

/** Del que más falta al que menos, como los entrega el backend. */
const BAJO_MINIMO: FormatoBajoMinimo[] = [
  formato(1, 'Tinte permanente', 'Tono 7.1', 1, 6),
  formato(2, 'Shampoo reparador', '300 ml', 2, 5),
  formato(3, 'Sérum de puntas', '60 ml', 1, 3),
  formato(4, 'Acondicionador', '1 L', 0, 2),
  formato(5, 'Mascarilla nutritiva', '500 g', 3, 4),
  formato(6, 'Aceite de argán', '100 ml', 1, 2),
];

const pedido = (n: number): PedidoGestion => ({
  codigoPublico: `PED${String(n).padStart(9, '0')}`,
  fechaPedido: '2026-11-06T12:00:00.000Z',
  cliente: `Cliente ${n}`,
  tipoEntrega: n % 2 === 0 ? 'retiro' : 'despacho',
  estado: 'pagado',
  total: 10000 * n,
  unidades: 1,
});

/** Del más reciente al más antiguo, como los entrega el backend. */
const PEDIDOS: ListadoPedidosGestion = {
  items: [1, 2, 3, 4, 5, 6].map(pedido),
  total: 6,
  pagina: 1,
  limite: 20,
  grupo: 'todos',
  grupos: [
    { clave: 'todos', nombre: 'Todos', cantidad: 6 },
    { clave: 'por_preparar', nombre: 'Por preparar', cantidad: 4 },
    { clave: 'listos_para_retiro', nombre: 'Listos para retiro', cantidad: 2 },
  ],
};

const VERIFICACIONES = { items: [], total: 3, pagina: 1, limite: 20 };

interface Respuestas {
  pedidos?: () => Response;
  verificaciones?: () => Response;
  stock?: () => Response;
}

const RUTAS: Record<string, keyof Respuestas> = {
  '/api/gestion/pedidos': 'pedidos',
  '/api/verificaciones/revision-manual': 'verificaciones',
  '/api/inventario/stock/bajo-minimo': 'stock',
};

const simularBackend = ({
  pedidos = () => Response.json(PEDIDOS),
  verificaciones = () => Response.json(VERIFICACIONES),
  stock = () => Response.json(BAJO_MINIMO),
}: Respuestas = {}) => {
  const respuestas: Required<Respuestas> = { pedidos, verificaciones, stock };
  const fetch = vi.fn(async (peticion: Request) => {
    const ruta = new URL(peticion.url).pathname;
    const clave = RUTAS[ruta];
    if (!clave) throw new Error(`Petición no simulada: ${ruta}`);
    return respuestas[clave]();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const pidio = (fetch: ReturnType<typeof simularBackend>, ruta: string) =>
  fetch.mock.calls.some(
    ([peticion]) => new URL(peticion.url).pathname === ruta,
  );

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaResumen />
    </QueryClientProvider>,
  );

const iniciarSesion = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: { codigoPublico: 'u-1', nombre: 'Jorge', apellido: 'Pino', rol },
    }),
  );

/** El número y el texto de un indicador, juntos. */
const indicador = (texto: string) =>
  screen.getByText(texto).parentElement?.textContent;

beforeEach(() => {
  reiniciarParaPruebas();
  navegacion.push.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Resumen del panel (P1)', () => {
  it('P1 · administración ve los cuatro indicadores con las cifras del backend', async () => {
    simularBackend();
    iniciarSesion('administrador');
    mostrar();

    expect(await screen.findByText('Pedidos por preparar')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Resumen',
    );
    expect(indicador('Pedidos por preparar')).toBe('4Pedidos por preparar');
    expect(indicador('Listos para retiro')).toBe('2Listos para retiro');
    expect(indicador('Verificaciones pendientes')).toBe(
      '3Verificaciones pendientes',
    );
    expect(indicador('Formatos con stock bajo')).toBe(
      '6Formatos con stock bajo',
    );
  });

  it('P1 · pedidos recientes: 5 en la tabla y 3 en la lista, cada uno abre su pedido', async () => {
    simularBackend();
    iniciarSesion('vendedor');
    mostrar();

    const tabla = await screen.findByRole('table', {
      name: 'Pedidos recientes',
    });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(5);
    expect(within(filas[0]).getByText('Cliente 1')).toBeVisible();
    expect(
      within(filas[0]).getByRole('link', { name: 'PED000000001' }),
    ).toHaveAttribute('href', '/panel/pedidos/PED000000001');
    expect(within(tabla).queryByText('Cliente 6')).toBeNull();

    const lista = screen.getByRole('list', { name: 'Pedidos recientes' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /Ver todos/ })).toHaveAttribute(
      'href',
      '/panel/pedidos',
    );
  });

  it('P1 · sin pedidos muestra el estado vacío', async () => {
    simularBackend({
      pedidos: () =>
        Response.json({
          ...PEDIDOS,
          items: [],
          total: 0,
          grupos: PEDIDOS.grupos.map((grupo) => ({ ...grupo, cantidad: 0 })),
        }),
    });
    iniciarSesion('vendedor');
    mostrar();

    expect(await screen.findByText('Aún no hay pedidos.')).toBeVisible();
    expect(indicador('Pedidos por preparar')).toBe('0Pedidos por preparar');
  });

  it('P1 · el vendedor no ve verificaciones ni stock, y no se piden al backend', async () => {
    const fetch = simularBackend();
    iniciarSesion('vendedor');
    mostrar();

    expect(await screen.findByText('Pedidos por preparar')).toBeVisible();
    expect(screen.queryByText('Verificaciones pendientes')).toBeNull();
    expect(screen.queryByText('Formatos con stock bajo')).toBeNull();
    expect(pidio(fetch, '/api/verificaciones/revision-manual')).toBe(false);
    expect(pidio(fetch, '/api/inventario/stock/bajo-minimo')).toBe(false);
  });

  it('P1 · bodega no ve verificaciones ni se piden al backend', async () => {
    const fetch = simularBackend();
    iniciarSesion('bodeguero');
    mostrar();

    expect(await screen.findByText('Formatos con stock bajo')).toBeVisible();
    expect(screen.queryByText('Verificaciones pendientes')).toBeNull();
    expect(pidio(fetch, '/api/verificaciones/revision-manual')).toBe(false);
  });

  it('P1 · el buscador lleva a Pedidos con la búsqueda aplicada', async () => {
    simularBackend();
    iniciarSesion('vendedor');
    mostrar();

    const buscador = await screen.findByRole('searchbox', {
      name: 'Buscar pedido, producto o cliente',
    });
    await userEvent.type(buscador, ' Camila Rojas {Enter}');
    expect(navegacion.push).toHaveBeenCalledWith(
      '/panel/pedidos?q=Camila%20Rojas',
    );
  });
});

describe('Resumen del panel: aviso de stock bajo (SCRUM-115)', () => {
  it('E11-H6 FE · CA1 aviso en el resumen: muestra el total y los formatos que más faltan con su stock y mínimo', async () => {
    simularBackend();
    iniciarSesion('bodeguero');
    mostrar();

    expect(await screen.findByText('Formatos con stock bajo')).toBeVisible();
    expect(indicador('Formatos con stock bajo')).toBe(
      '6Formatos con stock bajo',
    );
    const titulo = screen.getByRole('heading', {
      name: 'Stock bajo el mínimo',
    });
    expect(titulo).toBeVisible();

    const tabla = screen.getByRole('table', { name: 'Stock bajo el mínimo' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    // Solo los 5 que más faltan, en el orden del backend
    expect(filas).toHaveLength(5);
    expect(
      within(filas[0]).getByText('Tinte permanente · Tono 7.1'),
    ).toBeVisible();
    expect(within(filas[0]).getByText('1')).toBeVisible();
    expect(within(filas[0]).getByText('6')).toBeVisible();
    expect(within(tabla).queryByText(/Aceite de argán/)).toBeNull();

    const lista = screen.getByRole('list', { name: 'Stock bajo el mínimo' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(5);
    expect(within(lista).getByText('2 / mín. 5')).toBeVisible();

    const tarjeta = titulo.closest('section') as HTMLElement;
    expect(within(tarjeta).getAllByRole('link')[0]).toHaveAttribute(
      'href',
      '/panel/inventario',
    );
  });

  it('E11-H6 FE · CA1 aviso en el resumen: también lo ve administración', async () => {
    simularBackend({ stock: () => Response.json(BAJO_MINIMO.slice(0, 1)) });
    iniciarSesion('administrador');
    mostrar();

    expect(await screen.findByText('Formatos con stock bajo')).toBeVisible();
    expect(
      within(
        screen.getByRole('table', { name: 'Stock bajo el mínimo' }),
      ).getByText('Tinte permanente · Tono 7.1'),
    ).toBeVisible();
  });

  it('E11-H6 FE · CA3 sin avisos: sin formatos bajo el mínimo no se muestra la alerta', async () => {
    const fetch = simularBackend({ stock: () => Response.json([]) });
    iniciarSesion('bodeguero');
    mostrar();

    expect(await screen.findByText('Pedidos por preparar')).toBeVisible();
    expect(pidio(fetch, '/api/inventario/stock/bajo-minimo')).toBe(true);
    expect(screen.queryByText('Formatos con stock bajo')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Stock bajo el mínimo' }),
    ).toBeNull();
  });

  it('E11-H6 FE · un error del servidor no muestra detalles técnicos', async () => {
    simularBackend({
      stock: () =>
        Response.json(
          { statusCode: 500, message: 'relation "existencia" does not exist' },
          { status: 500 },
        ),
    });
    iniciarSesion('bodeguero');
    mostrar();

    // Un 5xx se reintenta dos veces antes de mostrarse; lo demás sigue a la vista
    const alerta = await screen.findByRole('alert', {}, { timeout: 5000 });
    expect(alerta).not.toHaveTextContent('existencia');
    expect(screen.getByText('Pedidos por preparar')).toBeVisible();
  }, 10_000);
});
