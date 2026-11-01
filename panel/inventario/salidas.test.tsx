import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  AjusteRegistrado,
  FormatoParaPack,
  SalidaRegistrada,
  StockFormato,
  TransferenciaRegistrada,
  UbicacionInventario,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { Toaster } from '@/compartido/ui/sonner';
import { AccionesInventario } from './accionesInventario';
import { campoDelError } from './esquemaSalida';
import { PantallaSalidaNueva } from './pantallaSalidaNueva';

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

const push = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/panel/inventario/entradas',
  useRouter: () => ({ push }),
}));

const MASCARILLA: FormatoParaPack = {
  formatoId: 21,
  sku: 'MAS-NUT-500',
  nombreFormato: '500 g',
  producto: { id: 4, nombre: 'Mascarilla nutritiva' },
  canalVenta: 'general',
};

const STOCK: StockFormato = {
  formato: {
    id: 21,
    nombreFormato: '500 g',
    sku: 'MAS-NUT-500',
    producto: 'Mascarilla nutritiva',
    activo: true,
  },
  ubicaciones: [
    {
      id: 3,
      codigo: 'B-01',
      bodega: 'Bodega principal',
      activa: true,
      cantidad: 3,
    },
    {
      id: 4,
      codigo: 'S-01',
      bodega: 'Sala de ventas',
      activa: false,
      cantidad: 1,
    },
  ],
  total: 4,
  ultimaEntrada: null,
};

const SALIDA: SalidaRegistrada = {
  movimientoId: 90,
  tipo: 'merma_dano',
  formatoId: 21,
  ubicacion: { id: 3, codigo: 'B-01', bodega: 'Bodega principal' },
  cantidad: 1,
  stockRestante: 2,
  observacion: 'Envase roto al recibir',
  fechaHora: '2026-11-01T13:00:00.000Z',
};

const PRINCIPAL = { id: 1, nombre: 'Bodega principal' };
const SALA = { id: 2, nombre: 'Sala de ventas' };

/** Ubicaciones activas: B-01 tiene stock; A-01 y S-02 no. S-01 (desactivada) no está. */
const UBICACIONES: UbicacionInventario[] = [
  { id: 1, codigo: 'A-01', bodega: PRINCIPAL },
  { id: 3, codigo: 'B-01', bodega: PRINCIPAL },
  { id: 5, codigo: 'S-02', bodega: SALA },
];

const AJUSTE: AjusteRegistrado = {
  movimientoId: 91,
  tipo: 'ajuste_negativo',
  formatoId: 21,
  ubicacion: { id: 3, codigo: 'B-01', bodega: 'Bodega principal' },
  cantidad: -2,
  stockResultante: 1,
  observacion: 'Conteo físico: faltan 2',
  fechaHora: '2026-11-01T13:00:00.000Z',
};

const TRANSFERENCIA: TransferenciaRegistrada = {
  movimientoId: 92,
  formatoId: 21,
  origen: { id: 3, codigo: 'B-01', bodega: 'Bodega principal', stock: 1 },
  destino: { id: 5, codigo: 'S-02', bodega: 'Sala de ventas', stock: 2 },
  cantidad: 2,
  observacion: null,
  fechaHora: '2026-11-01T13:00:00.000Z',
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde la búsqueda y el stock; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: Request[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/catalogo/formatos': () =>
      Response.json({ items: [MASCARILLA], total: 1, pagina: 1, limite: 20 }),
    'GET /api/inventario/stock/formatos/21': () => Response.json(STOCK),
    'POST /api/inventario/salidas': () =>
      Response.json(SALIDA, { status: 201 }),
    'GET /api/inventario/ubicaciones': () => Response.json(UBICACIONES),
    'POST /api/inventario/ajustes': () =>
      Response.json(AJUSTE, { status: 201 }),
    'POST /api/inventario/transferencias': () =>
      Response.json(TRANSFERENCIA, { status: 201 }),
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

const iniciarSesion = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: { codigoPublico: 'u-1', nombre: 'Jorge', apellido: 'Pino', rol },
    }),
  );

beforeEach(() => {
  reiniciarParaPruebas();
  push.mockReset();
  iniciarSesion('bodeguero');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Usuario = ReturnType<typeof userEvent.setup>;

/** Abre el panel lateral desde la cabecera de Inventario (escritorio). */
const abrirPanel = async (usuario: Usuario) => {
  mostrar(<AccionesInventario disposicion="cabecera" />);
  await usuario.click(screen.getByRole('button', { name: 'Registrar salida' }));
  return within(
    await screen.findByRole('dialog', { name: 'Registrar salida' }),
  );
};

/** Merma por daño de 1 mascarilla en B-01, con comentario. */
const completarSalida = async (usuario: Usuario, cantidad = '1') => {
  await usuario.click(screen.getByRole('radio', { name: 'Merma por daño' }));
  await usuario.click(screen.getByLabelText('Formato'));
  await usuario.click(
    await screen.findByRole('button', { name: /Mascarilla nutritiva · 500 g/ }),
  );
  await usuario.click(
    await screen.findByRole('combobox', { name: 'Ubicación' }),
  );
  await usuario.click(
    await screen.findByRole('option', {
      name: 'Bodega principal · B-01 · stock 3',
    }),
  );
  await usuario.type(screen.getByLabelText('Cantidad'), cantidad);
  await usuario.type(
    screen.getByLabelText('Comentario (opcional)'),
    'Envase roto al recibir',
  );
};

const cuerpoDelPost = async (pedidas: Request[]) =>
  pedidas
    .find((peticion) => peticion.method === 'POST')!
    .json() as Promise<unknown>;

describe('Registrar salida (SCRUM-112)', () => {
  it('E11-H3 FE · CA1 registrar salida: con tipo, formato, ubicación y cantidad, la registra, cierra el panel y avisa el stock que queda', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    // Los tipos que no son venta, más ajuste y transferencia (SCRUM-113)
    expect(
      panel.getAllByRole('radio').map((opcion) => opcion.textContent),
    ).toEqual([
      'Merma por vencimiento',
      'Merma por daño',
      'Consumo en peluquería',
      'Ajuste',
      'Transferencia',
    ]);
    await completarSalida(usuario);
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar salida' }),
    );

    expect(
      await screen.findByText(
        'Salida registrada. Quedan 2 en Bodega principal · B-01.',
      ),
    ).toBeInTheDocument();
    expect(await cuerpoDelPost(pedidas)).toEqual({
      formatoId: 21,
      ubicacionId: 3,
      tipo: 'merma_dano',
      cantidad: 1,
      observacion: 'Envase roto al recibir',
    });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('E11-H3 FE · CA1 registrar salida: la ubicación muestra el stock de cada una, también las desactivadas', async () => {
    simularBackend();
    const usuario = userEvent.setup();
    await abrirPanel(usuario);

    expect(screen.getByRole('combobox', { name: 'Ubicación' })).toBeDisabled();
    await usuario.click(screen.getByLabelText('Formato'));
    await usuario.click(
      await screen.findByRole('button', { name: /Mascarilla nutritiva/ }),
    );
    await usuario.click(
      await screen.findByRole('combobox', { name: 'Ubicación' }),
    );
    expect(
      (await screen.findAllByRole('option')).map(
        (opcion) => opcion.textContent,
      ),
    ).toEqual([
      'Bodega principal · B-01 · stock 3',
      'Sala de ventas · S-01 · stock 1 (desactivada)',
    ]);
  });

  it('E11-H3 FE · CA1 registrar salida: un formato sin stock lo dice en la ubicación', async () => {
    simularBackend({
      'GET /api/inventario/stock/formatos/21': () =>
        Response.json({ ...STOCK, ubicaciones: [], total: 0 }),
    });
    const usuario = userEvent.setup();
    await abrirPanel(usuario);

    await usuario.click(screen.getByLabelText('Formato'));
    await usuario.click(
      await screen.findByRole('button', { name: /Mascarilla nutritiva/ }),
    );

    const ubicacion = await screen.findByRole('combobox', {
      name: 'Ubicación',
    });
    expect(ubicacion).toBeDisabled();
    expect(ubicacion).toHaveTextContent(
      'Este formato no tiene stock en ninguna ubicación.',
    );
  });

  it('E11-H3 FE · CA1 registrar salida: si el stock no carga, la ubicación muestra el mensaje del backend', async () => {
    simularBackend({
      'GET /api/inventario/stock/formatos/21': () =>
        error(403, 'No tienes permiso para consultar inventario.'),
    });
    const usuario = userEvent.setup();
    await abrirPanel(usuario);

    await usuario.click(screen.getByLabelText('Formato'));
    await usuario.click(
      await screen.findByRole('button', { name: /Mascarilla nutritiva/ }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Ubicación' }),
      ).toHaveTextContent('No tienes permiso para consultar inventario.'),
    );
  });

  it('E11-H3 FE · CA1 registrar salida: sin datos, marca cada campo y no envía nada', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await usuario.click(
      panel.getByRole('button', { name: 'Registrar salida' }),
    );

    expect(
      await panel.findByText('Elige el tipo de movimiento.'),
    ).toBeInTheDocument();
    expect(panel.getByText('Elige el formato.')).toBeInTheDocument();
    expect(
      panel.getByText('Elige la ubicación de la que sale.'),
    ).toBeInTheDocument();
    expect(
      panel.getByText('La cantidad debe ser un número entero desde 1.'),
    ).toBeInTheDocument();
    expect(pedidas.some((peticion) => peticion.method === 'POST')).toBe(false);
  });

  it('E11-H3 FE · CA2 cantidad mayor al stock: el servidor la rechaza y su mensaje queda junto a la cantidad, sin perder lo escrito', async () => {
    simularBackend({
      'POST /api/inventario/salidas': () =>
        error(
          400,
          'No hay stock suficiente en esa ubicación: hay 3 y la salida es de 5.',
        ),
    });
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await completarSalida(usuario, '5');
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar salida' }),
    );

    const cantidad = await panel.findByLabelText('Cantidad');
    await waitFor(() =>
      expect(cantidad).toHaveAccessibleDescription(
        'No hay stock suficiente en esa ubicación: hay 3 y la salida es de 5.',
      ),
    );
    expect(cantidad).toHaveValue('5');
    expect(panel.getByLabelText('Comentario (opcional)')).toHaveValue(
      'Envase roto al recibir',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('E11-H3 FE · CA2 errores: un 5xx no muestra detalles técnicos', async () => {
    simularBackend({
      'POST /api/inventario/salidas': () =>
        error(500, 'PrismaClientKnownRequestError at existencia'),
    });
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await completarSalida(usuario);
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar salida' }),
    );

    expect(await panel.findByRole('alert')).toBeInTheDocument();
    expect(panel.queryByText(/Prisma/)).not.toBeInTheDocument();
  });

  it('E11-H3 FE · CA2 errores: reconoce a qué campo apunta cada mensaje del backend', () => {
    expect(
      campoDelError('La cantidad debe ser un número entero positivo.'),
    ).toBe('cantidad');
    expect(campoDelError('La ubicación no existe.')).toBe('ubicacionId');
    expect(campoDelError('El formato no existe.')).toBe('formato');
    expect(
      campoDelError(
        'El tipo de salida es obligatorio y debe ser uno de estos: merma_vencimiento.',
      ),
    ).toBe('tipo');
    expect(campoDelError('Debes iniciar sesión.')).toBeNull();
  });

  it('E11-H3 FE · CA1 celular: la pantalla propia registra la salida y vuelve a Inventario', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaSalidaNueva />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Registrar salida' }),
    ).toBeInTheDocument();
    await completarSalida(usuario);
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar salida' }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/panel/inventario/entradas'),
    );
    expect(await cuerpoDelPost(pedidas)).toMatchObject({ cantidad: 1 });
  });

  it('E11-H3 FE · CA1 permisos: el vendedor no ve «Registrar salida»', () => {
    simularBackend();
    iniciarSesion('vendedor');
    mostrar(
      <>
        <AccionesInventario disposicion="cabecera" />
        <AccionesInventario disposicion="ancho" />
      </>,
    );

    expect(
      screen.queryByRole('button', { name: 'Registrar salida' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Registrar salida' }),
    ).not.toBeInTheDocument();
  });
});
/** Elige el tipo y la mascarilla. */
const elegirTipoYFormato = async (usuario: Usuario, tipo: string) => {
  await usuario.click(screen.getByRole('radio', { name: tipo }));
  await usuario.click(screen.getByLabelText('Formato'));
  await usuario.click(
    await screen.findByRole('button', { name: /Mascarilla nutritiva · 500 g/ }),
  );
};

/** Abre un selector y elige la opción. */
const elegir = async (usuario: Usuario, campo: string, opcion: string) => {
  await usuario.click(await screen.findByRole('combobox', { name: campo }));
  await usuario.click(await screen.findByRole('option', { name: opcion }));
};

/** Ajuste de la mascarilla en B-01: descuenta 2 por un conteo. */
const completarAjuste = async (
  usuario: Usuario,
  { sentido = 'Descontar', cantidad = '2' } = {},
) => {
  await elegirTipoYFormato(usuario, 'Ajuste');
  await usuario.click(screen.getByRole('radio', { name: sentido }));
  await elegir(usuario, 'Ubicación', 'Bodega principal · B-01 · stock 3');
  await usuario.type(screen.getByLabelText('Cantidad'), cantidad);
  await usuario.type(
    screen.getByLabelText('Motivo'),
    'Conteo físico: faltan 2',
  );
};

/** Transferencia de 2 mascarillas de B-01 a S-02. */
const completarTransferencia = async (usuario: Usuario, cantidad = '2') => {
  await elegirTipoYFormato(usuario, 'Transferencia');
  await elegir(
    usuario,
    'Ubicación de origen',
    'Bodega principal · B-01 · stock 3',
  );
  await elegir(usuario, 'Ubicación de destino', 'Sala de ventas · S-02');
  await usuario.type(screen.getByLabelText('Cantidad'), cantidad);
};

describe('Ajustes y transferencias (SCRUM-113)', () => {
  it('E11-H4 FE · CA1 ajuste: al descontar envía la cantidad negativa con el motivo y avisa el stock que queda', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await completarAjuste(usuario);
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar ajuste' }),
    );

    expect(
      await screen.findByText(
        'Ajuste registrado. Queda 1 en Bodega principal · B-01.',
      ),
    ).toBeInTheDocument();
    expect(await cuerpoDelPost(pedidas)).toEqual({
      formatoId: 21,
      ubicacionId: 3,
      cantidad: -2,
      observacion: 'Conteo físico: faltan 2',
    });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('E11-H4 FE · CA1 ajuste: al sumar envía la cantidad positiva, también en una ubicación activa sin stock', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await elegirTipoYFormato(usuario, 'Ajuste');
    await usuario.click(
      await screen.findByRole('combobox', { name: 'Ubicación' }),
    );
    // Las que tienen stock (también desactivadas) y las demás activas con «stock 0»
    await waitFor(() =>
      expect(
        screen.getAllByRole('option').map((opcion) => opcion.textContent),
      ).toEqual([
        'Bodega principal · B-01 · stock 3',
        'Sala de ventas · S-01 · stock 1 (desactivada)',
        'Bodega principal · A-01 · stock 0',
        'Sala de ventas · S-02 · stock 0',
      ]),
    );
    await usuario.click(
      screen.getByRole('option', { name: 'Bodega principal · A-01 · stock 0' }),
    );
    await usuario.click(screen.getByRole('radio', { name: 'Sumar' }));
    await usuario.type(screen.getByLabelText('Cantidad'), '3');
    await usuario.type(screen.getByLabelText('Motivo'), 'Conteo: había 3');
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar ajuste' }),
    );

    await waitFor(() =>
      expect(pedidas.some((peticion) => peticion.method === 'POST')).toBe(true),
    );
    expect(await cuerpoDelPost(pedidas)).toEqual({
      formatoId: 21,
      ubicacionId: 1,
      cantidad: 3,
      observacion: 'Conteo: había 3',
    });
  });

  it('E11-H4 FE · CA1 ajuste: sin sumar o descontar ni motivo, marca los campos y no envía nada', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await usuario.click(panel.getByRole('radio', { name: 'Ajuste' }));
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar ajuste' }),
    );

    expect(
      await panel.findByText('Elige si sumas o descuentas.'),
    ).toBeInTheDocument();
    expect(
      panel.getByText('Elige la ubicación que ajustas.'),
    ).toBeInTheDocument();
    expect(
      panel.getByText('Escribe el motivo del ajuste.'),
    ).toBeInTheDocument();
    expect(pedidas.some((peticion) => peticion.method === 'POST')).toBe(false);
  });

  it('E11-H4 FE · CA2 transferencia: con origen, destino y cantidad la registra y avisa el stock de ambas ubicaciones', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await completarTransferencia(usuario);
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar transferencia' }),
    );

    expect(
      await screen.findByText(
        'Transferencia registrada. Queda 1 en Bodega principal · B-01 y 2 en Sala de ventas · S-02.',
      ),
    ).toBeInTheDocument();
    expect(await cuerpoDelPost(pedidas)).toEqual({
      formatoId: 21,
      ubicacionOrigenId: 3,
      ubicacionDestinoId: 5,
      cantidad: 2,
    });
  });

  it('E11-H4 FE · CA2 transferencia: el destino ofrece las ubicaciones activas sin la de origen', async () => {
    simularBackend();
    const usuario = userEvent.setup();
    await abrirPanel(usuario);

    await elegirTipoYFormato(usuario, 'Transferencia');
    await elegir(
      usuario,
      'Ubicación de origen',
      'Bodega principal · B-01 · stock 3',
    );
    await usuario.click(
      screen.getByRole('combobox', { name: 'Ubicación de destino' }),
    );

    expect(
      (await screen.findAllByRole('option')).map(
        (opcion) => opcion.textContent,
      ),
    ).toEqual(['Bodega principal · A-01', 'Sala de ventas · S-02']);
  });

  it('E11-H4 FE · CA2 transferencia: sin origen ni destino, los marca y no envía nada', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await usuario.click(panel.getByRole('radio', { name: 'Transferencia' }));
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar transferencia' }),
    );

    expect(
      await panel.findByText('Elige la ubicación de origen.'),
    ).toBeInTheDocument();
    expect(
      panel.getByText('Elige la ubicación de destino.'),
    ).toBeInTheDocument();
    expect(pedidas.some((peticion) => peticion.method === 'POST')).toBe(false);
  });

  it('E11-H4 FE · CA3 sin stock: la transferencia rechazada muestra el error junto a la cantidad, sin perder lo escrito', async () => {
    simularBackend({
      'POST /api/inventario/transferencias': () =>
        error(
          400,
          'No hay stock suficiente en esa ubicación: hay 3 y la transferencia es de 5.',
        ),
    });
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await completarTransferencia(usuario, '5');
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar transferencia' }),
    );

    const cantidad = await panel.findByLabelText('Cantidad');
    await waitFor(() =>
      expect(cantidad).toHaveAccessibleDescription(
        'No hay stock suficiente en esa ubicación: hay 3 y la transferencia es de 5.',
      ),
    );
    expect(cantidad).toHaveValue('5');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('E11-H4 FE · CA3 sin stock: el ajuste negativo rechazado muestra el error junto a la cantidad', async () => {
    simularBackend({
      'POST /api/inventario/ajustes': () =>
        error(
          400,
          'No hay stock suficiente en esa ubicación: hay 3 y el ajuste es de 5.',
        ),
    });
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);

    await completarAjuste(usuario, { cantidad: '5' });
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar ajuste' }),
    );

    await waitFor(() =>
      expect(panel.getByLabelText('Cantidad')).toHaveAccessibleDescription(
        'No hay stock suficiente en esa ubicación: hay 3 y el ajuste es de 5.',
      ),
    );
    expect(panel.getByLabelText('Motivo')).toHaveValue(
      'Conteo físico: faltan 2',
    );
  });

  it('E11-H4 FE · CA3 errores: reconoce a qué campo apunta cada mensaje del ajuste y la transferencia', () => {
    expect(
      campoDelError(
        'La ubicación de destino debe ser distinta de la de origen.',
      ),
    ).toBe('destinoId');
    expect(campoDelError('La ubicación de origen es obligatoria.')).toBe(
      'ubicacionId',
    );
    expect(
      campoDelError(
        'La ubicación o su bodega está desactivada: elige otra ubicación.',
        'transferencia',
      ),
    ).toBe('destinoId');
    expect(campoDelError('El motivo del ajuste es obligatorio.')).toBe(
      'observacion',
    );
    expect(
      campoDelError(
        'El stock de ese formato en la ubicación de destino superaría el máximo permitido.',
      ),
    ).toBe('cantidad');
  });

  it('E11-H4 FE · CA2 celular: la pantalla propia registra la transferencia y vuelve a Inventario', async () => {
    simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaSalidaNueva />);

    await completarTransferencia(usuario);
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar transferencia' }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/panel/inventario/entradas'),
    );
  });

  it('E11-H4 FE · CA2 transferencia: el destino se elige después del origen', async () => {
    simularBackend();
    const usuario = userEvent.setup();
    await abrirPanel(usuario);

    await elegirTipoYFormato(usuario, 'Transferencia');

    const destino = screen.getByRole('combobox', {
      name: 'Ubicación de destino',
    });
    expect(destino).toBeDisabled();
    expect(destino).toHaveTextContent('Elige primero el origen');
  });

  it('E11-H4 FE · CA1 ajuste: al registrar vuelve a pedir el stock del formato', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    const panel = await abrirPanel(usuario);
    const pedidasDeStock = () =>
      pedidas.filter((peticion) =>
        peticion.url.endsWith('/api/inventario/stock/formatos/21'),
      ).length;

    await completarAjuste(usuario);
    const antes = pedidasDeStock();
    await usuario.click(
      panel.getByRole('button', { name: 'Registrar ajuste' }),
    );

    // El panel lateral sigue montado hasta cerrarse: su consulta de stock se vuelve a pedir
    await waitFor(() => expect(pedidasDeStock()).toBeGreaterThan(antes));
  });

  it('E11-H4 FE · CA1 celular: la pantalla propia registra el ajuste y vuelve a Inventario', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaSalidaNueva />);

    await completarAjuste(usuario);
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar ajuste' }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/panel/inventario/entradas'),
    );
    expect(await cuerpoDelPost(pedidas)).toMatchObject({ cantidad: -2 });
  });
});
