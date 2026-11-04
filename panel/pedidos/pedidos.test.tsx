import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CambioPermitido,
  DetallePedidoGestion,
  ListadoPedidosGestion,
  PedidoGestion,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { DetallePedidoPanel, SinPedidoElegido } from './detallePedido';
import { DisenoPedidos } from './disenoPedidos';

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

const navegacion = vi.hoisted(() => ({ segmento: null as string | null }));
vi.mock('next/navigation', () => ({
  useSelectedLayoutSegment: () => navegacion.segmento,
  usePathname: () => '/panel/pedidos',
}));

const FILA: PedidoGestion = {
  codigoPublico: 'PAGADODESP01',
  fechaPedido: '2026-11-03T13:14:00.000Z',
  cliente: 'Camila Rojas',
  tipoEntrega: 'despacho',
  estado: 'pagado',
  total: 28970,
  unidades: 2,
};

const LISTADO: ListadoPedidosGestion = {
  items: [FILA],
  total: 1,
  pagina: 1,
  limite: 20,
  grupos: [
    { clave: 'por_preparar', nombre: 'Por preparar', cantidad: 6 },
    { clave: 'listos_para_retiro', nombre: 'Listos para retiro', cantidad: 2 },
    { clave: 'despachados', nombre: 'Despachados', cantidad: null },
    { clave: 'todos', nombre: 'Todos', cantidad: null },
  ],
  grupo: 'por_preparar',
};

const cambio = (
  estado: string,
  datos: Partial<CambioPermitido> = {},
): CambioPermitido => ({
  estado,
  sentido: 'avance',
  pideCodigoSeguimiento: false,
  avisaAlCliente: false,
  ...datos,
});

const DETALLE: DetallePedidoGestion = {
  codigoPublico: 'PAGADODESP01',
  fechaPedido: '2026-11-03T13:14:00.000Z',
  estado: 'pagado',
  pagarHasta: null,
  tipoEntrega: 'despacho',
  tipoDocumento: 'boleta',
  porcentajeIva: 19,
  montos: { neto: 24345, iva: 4625, total: 28970 },
  items: [
    {
      articuloId: 11,
      tipo: 'formato',
      nombre: 'Shampoo reparador',
      nombreFormato: '300 ml',
      imagen: null,
      cantidad: 1,
      precioUnitario: 12990,
      subtotal: 12990,
    },
  ],
  envio: {
    servicio: 'Chilexpress',
    costo: 3990,
    estado: 'pendiente',
    codigoSeguimiento: null,
    fechaEstimada: null,
    destinatario: 'Camila Rojas',
    telefonoContacto: null,
    calle: 'Av. Ejemplo',
    numero: '1234',
    referencia: 'depto. 56',
    comuna: { codigoCut: '13120', nombre: 'Ñuñoa' },
  },
  documento: null,
  idTransaccionPago: '1320000001',
  cliente: {
    nombre: 'Camila Rojas',
    correo: 'camila@correo.test',
    telefono: '+56 9 1234 5678',
  },
  historial: [
    {
      estado: 'pendiente_pago',
      fecha: '2026-11-03T13:14:00.000Z',
      comentario: null,
      realizadoPor: 'Cliente',
    },
    {
      estado: 'pagado',
      fecha: '2026-11-03T13:15:00.000Z',
      comentario: null,
      realizadoPor: 'Sistema',
    },
  ],
  cambiosPermitidos: [cambio('en_preparacion')],
  sePuedeCancelar: false,
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de la pantalla; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: Request[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/gestion/pedidos': () => Response.json(LISTADO),
    'GET /api/gestion/pedidos/PAGADODESP01': () => Response.json(DETALLE),
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

const error = (status: number, message: string | string[]) =>
  Response.json({ statusCode: status, message }, { status });

const mostrar = (pantalla: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {pantalla}
      <Toaster />
    </QueryClientProvider>,
  );

const mostrarDetalle = (codigo = 'PAGADODESP01') =>
  mostrar(<DetallePedidoPanel codigo={codigo} />);

/** Los POST de cambio de estado enviados, con su cuerpo. */
const cuerposEnviados = (pedidas: Request[]) =>
  Promise.all(
    pedidas
      .filter((peticion) => peticion.method === 'POST')
      .map((peticion) => peticion.json()),
  );

beforeEach(() => {
  navegacion.segmento = null;
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Marcela',
        apellido: 'Díaz',
        rol: 'vendedor',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Panel de pedidos · lista y detalle (SCRUM-130)', () => {
  it('E8-H2 FE · CA1 lista y detalle: muestra la tabla con pedido, fecha, cliente, entrega, estado y total', async () => {
    simularBackend();
    mostrar(<DisenoPedidos>{null}</DisenoPedidos>);

    const tabla = await screen.findByRole('table', { name: 'Pedidos' });
    expect(
      within(tabla)
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual(['Pedido', 'Fecha', 'Cliente', 'Entrega', 'Estado', 'Total']);
    expect(
      within(within(tabla).getAllByRole('row')[1])
        .getAllByRole('cell')
        .map((celda) => celda.textContent),
    ).toEqual([
      'PAGADODESP01',
      '3 nov, 10:14',
      'Camila Rojas',
      'Despacho',
      'Pagado',
      expect.stringMatching(/^\$28\.970$/),
    ]);
    expect(
      within(tabla).getByRole('link', { name: 'PAGADODESP01' }),
    ).toHaveAttribute('href', '/panel/pedidos/PAGADODESP01');
    // Celular: el mismo pedido como tarjeta, con sus unidades
    const tarjetas = screen.getByRole('list', { name: 'Pedidos' });
    expect(within(tarjetas).getByText(/2 unidades/)).toBeInTheDocument();
  });

  it('E8-H2 FE · CA1 lista y detalle: los filtros por estado son los grupos del backend, con su conteo', async () => {
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos': (peticion) =>
        new URL(peticion.url).searchParams.get('grupo') === 'despachados'
          ? Response.json({
              ...LISTADO,
              items: [],
              total: 0,
              grupo: 'despachados',
            })
          : Response.json(LISTADO),
    });
    const usuario = userEvent.setup();
    mostrar(<DisenoPedidos>{null}</DisenoPedidos>);

    const filtros = await screen.findByRole('list', {
      name: 'Filtrar pedidos por estado',
    });
    expect(
      within(filtros)
        .getAllByRole('button')
        .map((boton) => boton.textContent),
    ).toEqual([
      'Por preparar · 6',
      'Listos para retiro · 2',
      'Despachados',
      'Todos',
    ]);
    // Marcado el que aplicó el backend, aunque no se pidió ninguno
    expect(
      within(filtros).getByRole('button', { name: 'Por preparar · 6' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(new URL(pedidas[0].url).searchParams.has('grupo')).toBe(false);

    await usuario.click(
      within(filtros).getByRole('button', { name: 'Despachados' }),
    );

    expect(
      await screen.findByText('No hay pedidos en este grupo.'),
    ).toBeInTheDocument();
    expect(
      within(filtros).getByRole('button', { name: 'Despachados' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('E8-H2 FE · CA1 lista y detalle: la búsqueda va al backend como «q»', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<DisenoPedidos>{null}</DisenoPedidos>);
    await screen.findByRole('table', { name: 'Pedidos' });

    await usuario.type(
      screen.getByRole('searchbox', {
        name: 'Buscar pedidos por pedido, producto o cliente',
      }),
      'Camila',
    );

    await waitFor(() =>
      expect(
        pedidas.some(
          (peticion) =>
            new URL(peticion.url).searchParams.get('q') === 'Camila',
        ),
      ).toBe(true),
    );
  });

  it('E8-H2 FE · CA1 lista y detalle: en escritorio, el pedido abierto queda marcado junto a su detalle', async () => {
    simularBackend();
    navegacion.segmento = 'PAGADODESP01';
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    mostrar(
      <DisenoPedidos>
        <DetallePedidoPanel codigo="PAGADODESP01" />
      </DisenoPedidos>,
    );

    const tabla = await screen.findByRole('table', { name: 'Pedidos' });
    expect(
      within(tabla).getByRole('link', { name: 'PAGADODESP01' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      await screen.findByRole('heading', { level: 2, name: 'PAGADODESP01' }),
    ).toBeInTheDocument();
  });

  it('E8-H2 FE · CA1 lista y detalle: en celular, con un pedido abierto no se pide la lista', async () => {
    const { pedidas } = simularBackend();
    navegacion.segmento = 'PAGADODESP01';
    mostrar(
      <DisenoPedidos>
        <DetallePedidoPanel codigo="PAGADODESP01" />
      </DisenoPedidos>,
    );

    expect(
      await screen.findByRole('heading', { level: 2, name: 'PAGADODESP01' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedidos' })).toHaveAttribute(
      'href',
      '/panel/pedidos',
    );
    expect(pedidas.map((peticion) => new URL(peticion.url).pathname)).toEqual([
      '/api/gestion/pedidos/PAGADODESP01',
    ]);
  });

  it('E8-H2 FE · CA1 lista y detalle: el detalle muestra cliente, entrega, productos y montos del backend', async () => {
    simularBackend();
    mostrarDetalle();

    expect(await screen.findByText('Camila Rojas')).toBeInTheDocument();
    expect(
      screen.getByText('camila@correo.test · +56 9 1234 5678'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Despacho · Av. Ejemplo 1234, depto. 56, Ñuñoa'),
    ).toBeInTheDocument();
    const productos = screen.getByRole('region', { name: 'Productos' });
    expect(
      within(productos)
        .getAllByRole('term')
        .map((termino) => termino.textContent),
    ).toEqual(['1 × Shampoo reparador · 300 ml', 'Despacho', 'Total']);
    expect(
      within(productos)
        .getAllByRole('definition')
        .map((monto) => monto.textContent),
    ).toEqual([
      expect.stringMatching(/^\$12\.990$/),
      expect.stringMatching(/^\$3\.990$/),
      expect.stringMatching(/^\$28\.970$/),
    ]);
  });

  it('E8-H2 FE · CA1 lista y detalle: un pedido que no existe lo dice', async () => {
    simularBackend({
      'GET /api/gestion/pedidos/NOEXISTE0001': () =>
        error(404, 'El pedido no existe.'),
    });
    mostrarDetalle('NOEXISTE0001');

    expect(
      await screen.findByRole('heading', {
        name: 'No encontramos este pedido',
      }),
    ).toBeInTheDocument();
  });
});

describe('Panel de pedidos · estados de la pantalla (SCRUM-130)', () => {
  it('E8-H2 FE · CA1 lista y detalle: en escritorio, sin pedido elegido, pide elegir uno', () => {
    simularBackend();
    mostrar(
      <DisenoPedidos>
        <SinPedidoElegido />
      </DisenoPedidos>,
    );

    expect(
      screen.getByText('Elige un pedido para ver su detalle.'),
    ).toBeInTheDocument();
  });

  it('E8-H2 FE · CA1 lista y detalle: una búsqueda sin resultados lo dice', async () => {
    simularBackend({
      'GET /api/gestion/pedidos': (peticion) =>
        Response.json(
          new URL(peticion.url).searchParams.has('q')
            ? { ...LISTADO, items: [], total: 0 }
            : LISTADO,
        ),
    });
    const usuario = userEvent.setup();
    mostrar(<DisenoPedidos>{null}</DisenoPedidos>);
    await screen.findByRole('table', { name: 'Pedidos' });

    await usuario.type(
      screen.getByRole('searchbox', {
        name: 'Buscar pedidos por pedido, producto o cliente',
      }),
      'Nadie',
    );

    expect(
      await screen.findByText('Ningún pedido coincide con la búsqueda.'),
    ).toBeInTheDocument();
  });

  it('E8-H2 FE · CA1 lista y detalle: si la lista falla, muestra el error y deja reintentar', async () => {
    let fallar = true;
    simularBackend({
      'GET /api/gestion/pedidos': () =>
        fallar ? error(403, 'No tienes permiso.') : Response.json(LISTADO),
    });
    const usuario = userEvent.setup();
    mostrar(<DisenoPedidos>{null}</DisenoPedidos>);

    expect(await screen.findByText('No tienes permiso.')).toBeInTheDocument();
    fallar = false;
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('table', { name: 'Pedidos' }),
    ).toBeInTheDocument();
  });

  it('E8-H2 FE · CA1 lista y detalle: si el servidor falla con el detalle, no muestra detalles técnicos y deja reintentar', async () => {
    let fallar = true;
    simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        fallar
          ? error(500, 'TypeError: cannot read properties of undefined')
          : Response.json(DETALLE),
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    const reintentar = await screen.findByRole(
      'button',
      { name: 'Reintentar' },
      // El detalle reintenta solo dos veces un 5xx antes de mostrar el error
      { timeout: 10000 },
    );
    expect(screen.queryByText(/TypeError/)).not.toBeInTheDocument();
    fallar = false;
    await usuario.click(reintentar);

    expect(await screen.findByText('Camila Rojas')).toBeInTheDocument();
  }, 15000);
});

describe('Panel de pedidos · cambio de estado (SCRUM-130)', () => {
  it('E8-H2 FE · CA2 cambiar estado: el historial muestra cada cambio con fecha y quién lo hizo', async () => {
    simularBackend();
    mostrarDetalle();

    const historial = await screen.findByRole('region', { name: 'Historial' });
    expect(
      within(historial)
        .getAllByRole('listitem')
        .map((cambio) => cambio.textContent),
    ).toEqual([
      'Pagado3 nov, 10:15 · Sistema',
      'Pendiente de pago3 nov, 10:14 · Cliente',
    ]);
  });

  it('E8-H2 FE · CA2 cambiar estado: con un comentario opcional, lo envía y el historial muestra el cambio', async () => {
    let cambiado = false;
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        Response.json(
          cambiado
            ? {
                ...DETALLE,
                estado: 'en_preparacion',
                historial: [
                  ...DETALLE.historial,
                  {
                    estado: 'en_preparacion',
                    fecha: '2026-11-03T14:00:00.000Z',
                    comentario: 'Falta confirmar el tono.',
                    realizadoPor: 'Marcela Díaz',
                  },
                ],
                cambiosPermitidos: [
                  cambio('despachado', {
                    pideCodigoSeguimiento: true,
                    avisaAlCliente: true,
                  }),
                  cambio('pagado', { sentido: 'retroceso' }),
                ],
              }
            : DETALLE,
        ),
      'POST /api/pedidos/PAGADODESP01/estado': () => {
        cambiado = true;
        return Response.json({
          codigoPublico: 'PAGADODESP01',
          estado: 'en_preparacion',
        });
      },
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    // Parte del paso que sigue, como en Figma
    expect(
      await screen.findByRole('combobox', { name: 'Cambiar estado' }),
    ).toHaveTextContent('En preparación');
    await usuario.type(
      screen.getByLabelText('Comentario (opcional)'),
      'Falta confirmar el tono.',
    );
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText('El pedido PAGADODESP01 quedó «En preparación».'),
    ).toBeInTheDocument();
    expect(await cuerposEnviados(pedidas)).toEqual([
      { estado: 'en_preparacion', comentario: 'Falta confirmar el tono.' },
    ]);
    const historial = screen.getByRole('region', { name: 'Historial' });
    await waitFor(() =>
      expect(within(historial).getAllByRole('listitem')[0]).toHaveTextContent(
        'En preparación3 nov, 11:00 · Marcela DíazFalta confirmar el tono.',
      ),
    );
    // El formulario parte de nuevo con los cambios que siguen
    expect(
      screen.getByRole('combobox', { name: 'Cambiar estado' }),
    ).toHaveTextContent('Despachado');
    expect(screen.getByLabelText('Comentario (opcional)')).toHaveValue('');
  });

  it('E8-H2 FE · CA2 cambiar estado: volver a un estado anterior pide el comentario antes de enviar', async () => {
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        Response.json({
          ...DETALLE,
          estado: 'en_preparacion',
          cambiosPermitidos: [
            cambio('despachado', { pideCodigoSeguimiento: true }),
            cambio('pagado', { sentido: 'retroceso' }),
          ],
        }),
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    await usuario.click(
      await screen.findByRole('combobox', { name: 'Cambiar estado' }),
    );
    await usuario.click(
      screen.getByRole('option', { name: 'Volver a Pagado' }),
    );
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByLabelText(/^Comentario/)).toHaveAccessibleDescription(
      'El comentario es obligatorio al volver a un estado anterior.',
    );
    expect(await cuerposEnviados(pedidas)).toEqual([]);
  });

  it('E8-H2 FE · CA2 cambiar estado: al despachar pide el código de Chilexpress y avisa al cliente', async () => {
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        Response.json({
          ...DETALLE,
          estado: 'en_preparacion',
          cambiosPermitidos: [
            cambio('despachado', {
              pideCodigoSeguimiento: true,
              avisaAlCliente: true,
            }),
          ],
        }),
      'POST /api/pedidos/PAGADODESP01/estado': () =>
        Response.json({ codigoPublico: 'PAGADODESP01', estado: 'despachado' }),
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    const guardar = await screen.findByRole('button', {
      name: 'Guardar y avisar al cliente',
    });
    await usuario.click(guardar);
    const codigo = screen.getByLabelText(
      /Código de seguimiento de Chilexpress/,
    );
    expect(codigo).toHaveAccessibleDescription(
      'El código de seguimiento es obligatorio al despachar el pedido.',
    );

    await usuario.type(codigo, '990000000001');
    await usuario.click(guardar);

    await waitFor(async () =>
      expect(await cuerposEnviados(pedidas)).toEqual([
        { estado: 'despachado', codigoSeguimiento: '990000000001' },
      ]),
    );
  });

  it('E8-H2 FE · CA2 cambiar estado: si el backend rechaza, muestra su mensaje sin perder lo escrito', async () => {
    simularBackend({
      'POST /api/pedidos/PAGADODESP01/estado': () =>
        error(
          409,
          'No se puede cambiar un pedido de «cancelado» a «en preparación».',
        ),
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    const comentario = await screen.findByLabelText('Comentario (opcional)');
    await usuario.type(comentario, 'Armado.');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText(
        'No se puede cambiar un pedido de «cancelado» a «en preparación».',
      ),
    ).toBeInTheDocument();
    expect(comentario).toHaveValue('Armado.');
  });

  it('E8-H2 FE · CA2 cambiar estado: la OT repetida queda junto al código', async () => {
    simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        Response.json({
          ...DETALLE,
          estado: 'en_preparacion',
          cambiosPermitidos: [
            cambio('despachado', { pideCodigoSeguimiento: true }),
          ],
        }),
      'POST /api/pedidos/PAGADODESP01/estado': () =>
        error(
          409,
          'Ese código de seguimiento ya está registrado en otro pedido.',
        ),
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    const codigo = await screen.findByLabelText(
      /Código de seguimiento de Chilexpress/,
    );
    await usuario.type(codigo, '990000000001');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(codigo).toHaveAccessibleDescription(
        'Ese código de seguimiento ya está registrado en otro pedido.',
      ),
    );
    expect(codigo).toHaveValue('990000000001');
  });

  it('E8-H2 FE · CA2 cambiar estado: un pedido que ya no cambia no muestra el formulario', async () => {
    simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        Response.json({
          ...DETALLE,
          estado: 'entregado',
          cambiosPermitidos: [],
        }),
    });
    mostrarDetalle();

    expect(
      await screen.findByRole('region', { name: 'Historial' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Cambiar estado' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});

describe('Panel de pedidos · retiro en tienda (SCRUM-130)', () => {
  it('E8-H2 FE · CA3 pedido para retiro: tras marcarlo «listo para retiro», la pantalla ofrece «retirado»', async () => {
    let listo = false;
    const RETIRO: DetallePedidoGestion = {
      ...DETALLE,
      estado: 'en_preparacion',
      tipoEntrega: 'retiro',
      envio: null,
      cambiosPermitidos: [
        cambio('listo_para_retiro', { avisaAlCliente: true }),
        cambio('pagado', { sentido: 'retroceso' }),
      ],
    };
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PAGADODESP01': () =>
        Response.json(
          listo
            ? {
                ...RETIRO,
                estado: 'listo_para_retiro',
                cambiosPermitidos: [
                  cambio('retirado', { avisaAlCliente: true }),
                  cambio('en_preparacion', { sentido: 'retroceso' }),
                ],
              }
            : RETIRO,
        ),
      'POST /api/pedidos/PAGADODESP01/estado': () => {
        listo = true;
        return Response.json({
          codigoPublico: 'PAGADODESP01',
          estado: 'listo_para_retiro',
        });
      },
    });
    const usuario = userEvent.setup();
    mostrarDetalle();

    expect(await screen.findByText('Retiro en tienda')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Cambiar estado' }),
    ).toHaveTextContent('Listo para retiro');
    await usuario.click(
      screen.getByRole('button', { name: 'Guardar y avisar al cliente' }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Cambiar estado' }),
      ).toHaveTextContent('Retirado'),
    );
    expect(await cuerposEnviados(pedidas)).toEqual([
      { estado: 'listo_para_retiro' },
    ]);
  });
});

describe('Panel de pedidos · cancelar un pedido pendiente de pago (SCRUM-131)', () => {
  const PENDIENTE: DetallePedidoGestion = {
    ...DETALLE,
    codigoPublico: 'PENDPAGO0001',
    estado: 'pendiente_pago',
    pagarHasta: '2026-11-03T13:44:00.000Z',
    idTransaccionPago: null,
    historial: [DETALLE.historial[0]],
    cambiosPermitidos: [],
    sePuedeCancelar: true,
  };
  const CANCELADO: DetallePedidoGestion = {
    ...PENDIENTE,
    estado: 'cancelado',
    historial: [
      ...PENDIENTE.historial,
      {
        estado: 'cancelado',
        fecha: '2026-11-03T14:00:00.000Z',
        comentario: 'El cliente pidió anular la compra.',
        realizadoPor: 'Marcela Díaz',
      },
    ],
    sePuedeCancelar: false,
  };

  /** Abre el diálogo y devuelve su botón de confirmar. */
  const abrirDialogo = async (usuario: ReturnType<typeof userEvent.setup>) => {
    await usuario.click(
      await screen.findByRole('button', { name: 'Cancelar pedido' }),
    );
    const dialogo = screen.getByRole('alertdialog');
    return {
      dialogo,
      confirmar: within(dialogo).getByRole('button', {
        name: 'Cancelar pedido',
      }),
      motivo: within(dialogo).getByLabelText('Motivo (opcional)'),
    };
  };

  it('E8-H3 FE · CA1 cancelar: pide confirmación, envía el motivo y el historial muestra el pedido cancelado', async () => {
    let cancelado = false;
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PENDPAGO0001': () =>
        Response.json(cancelado ? CANCELADO : PENDIENTE),
      'POST /api/pedidos/PENDPAGO0001/cancelar': () => {
        cancelado = true;
        return Response.json({
          codigoPublico: 'PENDPAGO0001',
          estado: 'cancelado',
        });
      },
    });
    const usuario = userEvent.setup();
    mostrarDetalle('PENDPAGO0001');

    const { dialogo, confirmar, motivo } = await abrirDialogo(usuario);
    expect(dialogo).toHaveAccessibleName('¿Cancelar el pedido PENDPAGO0001?');
    // Nada se envía sin confirmar
    expect(await cuerposEnviados(pedidas)).toEqual([]);

    await usuario.type(motivo, 'El cliente pidió anular la compra.');
    await usuario.click(confirmar);

    expect(
      await screen.findByText('El pedido PENDPAGO0001 quedó cancelado.'),
    ).toBeInTheDocument();
    expect(await cuerposEnviados(pedidas)).toEqual([
      { comentario: 'El cliente pidió anular la compra.' },
    ]);
    const historial = screen.getByRole('region', { name: 'Historial' });
    await waitFor(() =>
      expect(within(historial).getAllByRole('listitem')[0]).toHaveTextContent(
        'Cancelado3 nov, 11:00 · Marcela DíazEl cliente pidió anular la compra.',
      ),
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar pedido' }),
    ).not.toBeInTheDocument();
    // El botón ya no existe: el foco queda en el título del pedido
    expect(
      screen.getByRole('heading', { level: 2, name: 'PENDPAGO0001' }),
    ).toHaveFocus();
  });

  it('E8-H3 FE · CA1 cancelar: «Volver» no cancela y sin motivo se envía el cuerpo vacío', async () => {
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PENDPAGO0001': () => Response.json(PENDIENTE),
      'POST /api/pedidos/PENDPAGO0001/cancelar': () =>
        Response.json({ codigoPublico: 'PENDPAGO0001', estado: 'cancelado' }),
    });
    const usuario = userEvent.setup();
    mostrarDetalle('PENDPAGO0001');

    await abrirDialogo(usuario);
    await usuario.click(screen.getByRole('button', { name: 'Volver' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(await cuerposEnviados(pedidas)).toEqual([]);

    const { confirmar } = await abrirDialogo(usuario);
    await usuario.click(confirmar);
    await waitFor(async () =>
      expect(await cuerposEnviados(pedidas)).toEqual([{}]),
    );
  });

  it('E8-H3 FE · CA1 cancelar: un motivo demasiado largo se avisa junto al campo sin perder lo escrito', async () => {
    const { pedidas } = simularBackend({
      'GET /api/gestion/pedidos/PENDPAGO0001': () => Response.json(PENDIENTE),
    });
    const usuario = userEvent.setup();
    mostrarDetalle('PENDPAGO0001');

    const { dialogo, confirmar, motivo } = await abrirDialogo(usuario);
    const largo = 'a'.repeat(501);
    await usuario.click(motivo);
    await usuario.paste(largo);
    await usuario.click(confirmar);

    expect(
      await within(dialogo).findByText(
        'El comentario no puede superar los 500 caracteres.',
      ),
    ).toBeInTheDocument();
    expect(motivo).toHaveValue(largo);
    expect(await cuerposEnviados(pedidas)).toEqual([]);
  });

  it('E8-H3 FE · CA1 cancelar: si el backend rechaza el motivo, el mensaje queda junto al campo', async () => {
    simularBackend({
      'GET /api/gestion/pedidos/PENDPAGO0001': () => Response.json(PENDIENTE),
      'POST /api/pedidos/PENDPAGO0001/cancelar': () =>
        error(400, ['El comentario debe ser un texto.']),
    });
    const usuario = userEvent.setup();
    mostrarDetalle('PENDPAGO0001');

    const { dialogo, confirmar, motivo } = await abrirDialogo(usuario);
    await usuario.type(motivo, 'Pedido duplicado.');
    await usuario.click(confirmar);

    expect(
      await within(dialogo).findByText('El comentario debe ser un texto.'),
    ).toBeInTheDocument();
    expect(motivo).toHaveAttribute('aria-invalid', 'true');
    expect(motivo).toHaveValue('Pedido duplicado.');
  });

  it('E8-H3 FE · CA1 cancelar: si el servidor falla, el aviso queda en el diálogo con el motivo escrito', async () => {
    simularBackend({
      'GET /api/gestion/pedidos/PENDPAGO0001': () => Response.json(PENDIENTE),
      'POST /api/pedidos/PENDPAGO0001/cancelar': () =>
        error(500, 'Internal server error'),
    });
    const usuario = userEvent.setup();
    mostrarDetalle('PENDPAGO0001');

    const { dialogo, confirmar, motivo } = await abrirDialogo(usuario);
    await usuario.type(motivo, 'Pedido duplicado.');
    await usuario.click(confirmar);

    const aviso = await within(dialogo).findByRole('alert');
    expect(aviso).not.toHaveTextContent('Internal server error');
    expect(motivo).toHaveValue('Pedido duplicado.');
  });

  it('E8-H3 FE · CA2 pedido pagado: al abrir su detalle no se ofrece cancelar', async () => {
    simularBackend();
    mostrarDetalle();

    expect(
      await screen.findByRole('combobox', { name: 'Cambiar estado' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar pedido' }),
    ).not.toBeInTheDocument();
  });

  it('E8-H3 FE · CA2 pedido pagado: si se pagó mientras tanto, muestra el mensaje del backend y deja de ofrecer cancelar', async () => {
    let pagado = false;
    simularBackend({
      'GET /api/gestion/pedidos/PENDPAGO0001': () =>
        Response.json(
          pagado
            ? { ...PENDIENTE, estado: 'pagado', sePuedeCancelar: false }
            : PENDIENTE,
        ),
      'POST /api/pedidos/PENDPAGO0001/cancelar': () => {
        pagado = true;
        return error(
          409,
          'Solo se puede cancelar un pedido pendiente de pago.',
        );
      },
    });
    const usuario = userEvent.setup();
    mostrarDetalle('PENDPAGO0001');

    const { confirmar } = await abrirDialogo(usuario);
    await usuario.click(confirmar);

    expect(
      await screen.findByText(
        'Solo se puede cancelar un pedido pendiente de pago.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Cancelar pedido' }),
      ).not.toBeInTheDocument(),
    );
  });
});
