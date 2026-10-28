import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  FormatoParaPack,
  ListadoFormatosParaPack,
  PackPanel,
} from '@/compartido/api/respuestas';
import {
  error,
  iniciarSesion,
  mostrar,
  precios,
  simularBackend,
} from '@/panel/productos/apiDePrueba';
import { PantallaEditarPack, PantallaPackNuevo } from './pantallaPack';

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

const reemplazar = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: reemplazar }),
}));

const shampoo: FormatoParaPack = {
  formatoId: 21,
  sku: 'SH-REP-300',
  nombreFormato: '300 ml',
  producto: { id: 7, nombre: 'Shampoo reparador' },
  canalVenta: 'general',
  stockTotal: 2,
  precioMinoristaNeto: 10916,
  precioMinoristaConIva: 12990,
};

const acondicionador: FormatoParaPack = {
  formatoId: 31,
  sku: 'ACO-HID-300',
  nombreFormato: '300 ml',
  producto: { id: 8, nombre: 'Acondicionador hidratante' },
  canalVenta: 'general',
  stockTotal: 22,
  precioMinoristaNeto: 10076,
  precioMinoristaConIva: 11990,
};

const listadoFormatos = (
  items: FormatoParaPack[],
): ListadoFormatosParaPack => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
});

const componente = ({ canalVenta: _canal, ...formato }: FormatoParaPack) => ({
  ...formato,
  cantidad: 1,
});

const pack = (extra: Partial<PackPanel> = {}): PackPanel => ({
  id: 40,
  sku: 'PK-REP-01',
  nombre: 'Pack reparación',
  descripcion: 'Shampoo y acondicionador juntos.',
  canalVenta: 'general',
  fechaInicioVigencia: null,
  fechaFinVigencia: null,
  vigente: true,
  activo: true,
  fechaCreacion: '2026-10-28T15:00:00.000Z',
  componentes: [componente(shampoo), componente(acondicionador)],
  imagenes: [
    { id: 1, url: 'https://img.test/1.webp', orden: 1, esPrincipal: true },
    { id: 2, url: 'https://img.test/2.webp', orden: 2, esPrincipal: false },
  ],
  disponibilidad: 2,
  componenteLimitante: { formatoId: 21, stockTotal: 2 },
  precioMinoristaPorSeparadoConIva: 24980,
  ...extra,
});

const preciosPack = precios({
  articuloId: 40,
  precioMinoristaNeto: 19319,
  precioMayoristaNeto: 15958,
  precioMinoristaConIva: 22990,
  precioMayoristaConIva: 18990,
});

/** Backend con la búsqueda de formatos; `extra` agrega o reemplaza rutas. */
const conBusqueda = (extra: Parameters<typeof simularBackend>[0] = {}) =>
  simularBackend({
    'GET /api/catalogo/formatos': (peticion) =>
      new URL(peticion.url).searchParams.get('buscar') === 'acond'
        ? Response.json(listadoFormatos([acondicionador]))
        : Response.json(listadoFormatos([shampoo, acondicionador])),
    ...extra,
  });

const escribir = async (etiqueta: string | RegExp, texto: string) => {
  const campo = screen.getByLabelText(etiqueta);
  await userEvent.clear(campo);
  if (texto) await userEvent.type(campo, texto);
};

const agregarFormatos = async (...nombres: string[]) => {
  await userEvent.click(
    screen.getAllByRole('button', { name: 'Agregar formato' })[0],
  );
  const panel = within(await screen.findByRole('dialog'));
  for (const nombre of nombres) {
    await userEvent.click(
      await panel.findByRole('button', { name: `Agregar ${nombre}` }),
    );
  }
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
};

const tablaComponentes = () =>
  within(screen.getByRole('table', { name: 'Componentes del pack' }));

/** La celda de la columna «Stock disponible» (la tercera). */
const celdaStock = (fila: ReturnType<typeof within>) =>
  fila.getAllByRole('cell')[2];

const llenarDatos = async () => {
  await escribir(/^Nombre/, 'Pack reparación');
  await escribir(/^SKU/, 'PK-REP-01');
  await escribir(/^Descripción del pack/, 'Shampoo y acondicionador juntos.');
};

const guardar = () =>
  userEvent.click(screen.getAllByRole('button', { name: 'Guardar pack' })[0]);

beforeEach(() => {
  iniciarSesion();
  reemplazar.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Pack nuevo (SCRUM-105)', () => {
  it('E3-H6 FE · componentes: agrega formatos con su cantidad y la tabla muestra el stock de cada uno', async () => {
    conBusqueda();
    mostrar(<PantallaPackNuevo />);

    await agregarFormatos(
      'Shampoo reparador · 300 ml',
      'Acondicionador hidratante · 300 ml',
    );

    const filas = tablaComponentes().getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    const [primera, segunda] = filas.map((fila) => within(fila));
    expect(primera.getByText('Shampoo reparador · 300 ml')).toBeInTheDocument();
    expect(primera.getByText('SH-REP-300')).toBeInTheDocument();
    expect(celdaStock(primera)).toHaveTextContent(/Stock disponible\s*2$/);
    expect(primera.getByText('con IVA $12.990')).toBeInTheDocument();
    expect(celdaStock(segunda)).toHaveTextContent(/Stock disponible\s*22$/);

    const cantidad = primera.getByRole('spinbutton', {
      name: 'Cantidad de Shampoo reparador · 300 ml',
    });
    expect(cantidad).toHaveValue(1);
    await userEvent.clear(cantidad);
    await userEvent.type(cantidad, '3');
    expect(cantidad).toHaveValue(3);
  });

  it('E3-H6 FE · componentes: quitar un formato lo saca de la tabla', async () => {
    conBusqueda();
    mostrar(<PantallaPackNuevo />);
    await agregarFormatos('Shampoo reparador · 300 ml');

    await userEvent.click(
      screen.getByRole('button', { name: 'Quitar Shampoo reparador · 300 ml' }),
    );

    expect(
      screen.queryByRole('table', { name: 'Componentes del pack' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Agrega los formatos que lleva el pack.'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'Agregar formato' })[0],
      ).toHaveFocus(),
    );
  });

  it('E3-H6 FE · solo formatos: si la búsqueda falla, muestra el mensaje del backend', async () => {
    conBusqueda({
      'GET /api/catalogo/formatos': () =>
        error(403, 'No tienes permiso para gestionar el catálogo.'),
    });
    mostrar(<PantallaPackNuevo />);

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Agregar formato' })[0],
    );
    const panel = within(await screen.findByRole('dialog'));

    expect(
      await panel.findByText('No tienes permiso para gestionar el catálogo.'),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · solo formatos: al escribir busca en los formatos de producto y no repite los ya agregados', async () => {
    const { pedidas } = conBusqueda();
    mostrar(<PantallaPackNuevo />);
    await agregarFormatos('Shampoo reparador · 300 ml');

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Agregar formato' })[0],
    );
    const panel = within(await screen.findByRole('dialog'));
    expect(
      await panel.findByRole('button', {
        name: 'Shampoo reparador · 300 ml ya está en el pack',
      }),
    ).toHaveAttribute('aria-disabled', 'true');

    await userEvent.type(panel.getByLabelText('Buscar formato'), 'acond');

    await waitFor(() =>
      expect(pedidas).toContain('GET /api/catalogo/formatos?buscar=acond'),
    );
    expect(
      await panel.findByRole('button', {
        name: 'Agregar Acondicionador hidratante · 300 ml',
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        panel.queryByRole('button', {
          name: 'Shampoo reparador · 300 ml ya está en el pack',
        }),
      ).not.toBeInTheDocument(),
    );
    expect(
      panel.getByText(
        'Solo se agregan formatos de producto; un pack no puede contener otro pack.',
      ),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · solo formatos: una búsqueda sin resultados lo dice', async () => {
    conBusqueda({
      'GET /api/catalogo/formatos': () => Response.json(listadoFormatos([])),
    });
    mostrar(<PantallaPackNuevo />);

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Agregar formato' })[0],
    );
    const panel = within(await screen.findByRole('dialog'));

    expect(
      await panel.findByText('No encontramos formatos con esa búsqueda.'),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · disponibilidad y vigencia: guarda el pack con sus componentes y su vigencia, y abre su página', async () => {
    const { enviados } = conBusqueda({
      'POST /api/catalogo/packs': () => Response.json(pack(), { status: 201 }),
    });
    mostrar(<PantallaPackNuevo />);
    await llenarDatos();
    await escribir(/^Vigente desde/, '2026-11-01');
    await escribir(/^Vigente hasta/, '2026-11-30');
    await agregarFormatos(
      'Shampoo reparador · 300 ml',
      'Acondicionador hidratante · 300 ml',
    );

    await guardar();

    await waitFor(() =>
      expect(reemplazar).toHaveBeenCalledWith('/panel/packs/40'),
    );
    expect(enviados).toEqual([
      {
        sku: 'PK-REP-01',
        nombre: 'Pack reparación',
        descripcion: 'Shampoo y acondicionador juntos.',
        canalVenta: 'general',
        fechaInicioVigencia: '2026-11-01',
        fechaFinVigencia: '2026-11-30',
        componentes: [
          { formatoId: 21, cantidad: 1 },
          { formatoId: 31, cantidad: 1 },
        ],
      },
    ]);
  });

  it('E3-H6 FE · disponibilidad y vigencia: sin vigencia y exclusivo, envía las fechas en null y el canal profesional', async () => {
    const { enviados } = conBusqueda({
      'POST /api/catalogo/packs': () => Response.json(pack(), { status: 201 }),
    });
    mostrar(<PantallaPackNuevo />);
    await llenarDatos();
    await userEvent.click(
      screen.getByRole('switch', { name: 'Exclusivo para profesionales' }),
    );
    await agregarFormatos('Shampoo reparador · 300 ml');
    await escribir('Cantidad de Shampoo reparador · 300 ml', '2');

    await guardar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(enviados[0]).toMatchObject({
      canalVenta: 'profesional',
      fechaInicioVigencia: null,
      fechaFinVigencia: null,
      componentes: [{ formatoId: 21, cantidad: 2 }],
    });
  });

  it('E3-H6 FE · disponibilidad y vigencia: un término anterior al inicio se marca junto al campo, sin enviar', async () => {
    const { enviados } = conBusqueda();
    mostrar(<PantallaPackNuevo />);
    await llenarDatos();
    await escribir(/^Vigente desde/, '2026-11-30');
    await escribir(/^Vigente hasta/, '2026-11-01');
    await agregarFormatos(
      'Shampoo reparador · 300 ml',
      'Acondicionador hidratante · 300 ml',
    );

    await guardar();

    expect(
      await screen.findByLabelText(/^Vigente hasta/),
    ).toHaveAccessibleDescription(
      'La fecha de término de la vigencia no puede ser anterior a la de inicio.',
    );
    expect(enviados).toEqual([]);
  });

  it('E3-H6 FE · componentes: sin formatos, o con una sola unidad, lo dice bajo la tabla', async () => {
    const { enviados } = conBusqueda();
    mostrar(<PantallaPackNuevo />);
    await llenarDatos();

    await guardar();
    expect(
      await screen.findByText('Indica los formatos del pack.'),
    ).toBeInTheDocument();

    await agregarFormatos('Shampoo reparador · 300 ml');
    await guardar();
    expect(
      await screen.findByText(
        'Un pack debe sumar al menos 2 unidades: agrega otro formato o aumenta la cantidad.',
      ),
    ).toBeInTheDocument();
    expect(enviados).toEqual([]);
  });

  it('E3-H6 FE · errores: el SKU repetido se muestra junto a su campo, sin perder lo escrito', async () => {
    conBusqueda({
      'POST /api/catalogo/packs': () =>
        error(409, 'El SKU ya pertenece a otro artículo.'),
    });
    mostrar(<PantallaPackNuevo />);
    await llenarDatos();
    await agregarFormatos(
      'Shampoo reparador · 300 ml',
      'Acondicionador hidratante · 300 ml',
    );

    await guardar();

    const sku = await screen.findByLabelText(/^SKU/);
    await waitFor(() =>
      expect(sku).toHaveAccessibleDescription(
        'El SKU ya pertenece a otro artículo.',
      ),
    );
    expect(sku).toHaveValue('PK-REP-01');
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue('Pack reparación');
    expect(tablaComponentes().getAllByRole('row')).toHaveLength(3);
    expect(reemplazar).not.toHaveBeenCalled();
  });

  it('E3-H6 FE · solo formatos: si el backend rechaza un componente, el mensaje queda bajo la tabla', async () => {
    conBusqueda({
      'POST /api/catalogo/packs': () =>
        error(400, [
          'Un pack solo admite formatos de producto como componentes, no otros packs.',
        ]),
    });
    mostrar(<PantallaPackNuevo />);
    await llenarDatos();
    await agregarFormatos(
      'Shampoo reparador · 300 ml',
      'Acondicionador hidratante · 300 ml',
    );

    await guardar();

    expect(
      await screen.findByText(
        'Un pack solo admite formatos de producto como componentes, no otros packs.',
      ),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · pack nuevo: las fotos y los precios piden guardar el pack primero', async () => {
    conBusqueda();
    mostrar(<PantallaPackNuevo />);

    expect(
      screen.getAllByText('Guarda el pack para agregar fotos y precios.'),
    ).not.toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /Agregar foto/ }),
    ).not.toBeInTheDocument();
  });
});

describe('Pack guardado (SCRUM-105)', () => {
  const conPack = (
    datos: PackPanel = pack(),
    extra: Parameters<typeof simularBackend>[0] = {},
  ) =>
    conBusqueda({
      'GET /api/catalogo/packs/40': () => Response.json(datos),
      'GET /api/catalogo/articulos/40/precios': () =>
        Response.json(preciosPack),
      ...extra,
    });

  it('E3-H6 FE · disponibilidad y vigencia: muestra la disponibilidad del componente más escaso', async () => {
    conPack();
    mostrar(<PantallaEditarPack id="40" />);

    const tarjeta = within(
      await screen.findByRole('region', {
        name: 'Disponibilidad en la tienda',
      }),
    );
    expect(tarjeta.getByText('2 packs')).toBeInTheDocument();
    expect(
      tarjeta.getByText(
        /Limitada por Shampoo reparador · 300 ml, que tiene 2 unidades\./,
      ),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · disponibilidad y vigencia: muestra los precios con su valor con IVA y lo que cuesta por separado', async () => {
    conPack();
    mostrar(<PantallaEditarPack id="40" />);

    const tarjeta = within(
      await screen.findByRole('region', { name: 'Precios del pack' }),
    );
    expect(await tarjeta.findByText('$19.319')).toBeInTheDocument();
    expect(tarjeta.getByText('con IVA $22.990')).toBeInTheDocument();
    expect(tarjeta.getByText('$15.958')).toBeInTheDocument();
    expect(tarjeta.getByText('con IVA $18.990')).toBeInTheDocument();
    expect(
      tarjeta.getByText('Por separado, con IVA: $24.980.'),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · disponibilidad y vigencia: muestra las fotos propias del pack', async () => {
    conPack();
    mostrar(<PantallaEditarPack id="40" />);

    const tarjeta = within(
      await screen.findByRole('region', { name: 'Fotos del pack' }),
    );
    expect(
      tarjeta.getByRole('button', {
        name: 'Foto 1 de Pack reparación, principal',
      }),
    ).toBeInTheDocument();
    expect(
      tarjeta.getByRole('button', { name: 'Foto 2 de Pack reparación' }),
    ).toBeInTheDocument();
  });

  it('E3-H6 FE · disponibilidad y vigencia: carga la vigencia y los componentes guardados', async () => {
    conPack(
      pack({
        fechaInicioVigencia: '2026-11-01',
        fechaFinVigencia: '2026-11-30',
      }),
    );
    mostrar(<PantallaEditarPack id="40" />);

    expect(await screen.findByLabelText(/^Vigente desde/)).toHaveValue(
      '2026-11-01',
    );
    expect(screen.getByLabelText(/^Vigente hasta/)).toHaveValue('2026-11-30');
    expect(tablaComponentes().getAllByRole('row')).toHaveLength(3);
  });

  it('E3-H6 FE · edición: guardar envía todo con PATCH, y una vigencia borrada va en null', async () => {
    const { enviados } = conPack(pack({ fechaFinVigencia: '2026-11-30' }), {
      'PATCH /api/catalogo/packs/40': () => Response.json(pack()),
    });
    mostrar(<PantallaEditarPack id="40" />);
    await screen.findByLabelText(/^Vigente hasta/);
    await escribir(/^Vigente hasta/, '');

    await guardar();

    expect(
      await screen.findByText('Guardamos los cambios de Pack reparación.'),
    ).toBeInTheDocument();
    expect(enviados).toEqual([
      expect.objectContaining({
        sku: 'PK-REP-01',
        fechaInicioVigencia: null,
        fechaFinVigencia: null,
        componentes: [
          { formatoId: 21, cantidad: 1 },
          { formatoId: 31, cantidad: 1 },
        ],
      }),
    ]);
  });

  it('E3-H6 FE · sin los datos pedidos al backend, el stock y la disponibilidad no se inventan', async () => {
    const sinDatos = pack({
      componentes: pack().componentes.map(
        ({
          stockTotal: _s,
          precioMinoristaNeto: _n,
          precioMinoristaConIva: _i,
          ...resto
        }) => resto,
      ),
      disponibilidad: undefined,
      componenteLimitante: undefined,
      precioMinoristaPorSeparadoConIva: undefined,
    });
    conPack(sinDatos);
    mostrar(<PantallaEditarPack id="40" />);

    const tarjeta = within(
      await screen.findByRole('region', {
        name: 'Disponibilidad en la tienda',
      }),
    );
    expect(tarjeta.queryByText(/packs?$/)).not.toBeInTheDocument();
    const fila = within(tablaComponentes().getAllByRole('row')[1]);
    expect(celdaStock(fila)).toHaveTextContent(/Sin dato$/);
    expect(screen.queryByText(/Por separado/)).not.toBeInTheDocument();
  });

  it('E3-H6 FE · sin el permiso de precios, la tarjeta de precios no se muestra', async () => {
    iniciarSesion('vendedor');
    conPack();
    mostrar(<PantallaEditarPack id="40" />);

    await screen.findByRole('region', { name: 'Disponibilidad en la tienda' });
    expect(
      screen.queryByRole('region', { name: 'Precios del pack' }),
    ).not.toBeInTheDocument();
  });

  it('E3-H6 FE · un pack que no existe lo dice', async () => {
    simularBackend({
      'GET /api/catalogo/packs/99': () => error(404, 'El pack no existe.'),
    });
    mostrar(<PantallaEditarPack id="99" />);

    expect(
      await screen.findByRole('heading', { name: 'Pack no encontrado' }),
    ).toBeInTheDocument();
  });
});
