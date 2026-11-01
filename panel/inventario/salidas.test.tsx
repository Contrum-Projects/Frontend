import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  FormatoParaPack,
  SalidaRegistrada,
  StockFormato,
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

    // Solo los tipos que no son venta; ajuste y transferencia son de SCRUM-113
    expect(
      panel.getAllByRole('radio').map((opcion) => opcion.textContent),
    ).toEqual([
      'Merma por vencimiento',
      'Merma por daño',
      'Consumo en peluquería',
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
      await panel.findByText('Elige el tipo de salida.'),
    ).toBeInTheDocument();
    expect(panel.getByText('Elige el formato que sale.')).toBeInTheDocument();
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
