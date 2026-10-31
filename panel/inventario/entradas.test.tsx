import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  EntradaListado,
  EntradaRegistrada,
  FormatoParaPack,
  Proveedor,
  UbicacionInventario,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { destinoDelError } from './esquemaEntrada';
import { PantallaEntradaNueva } from './pantallaEntradaNueva';
import { PantallaEntradas } from './pantallaEntradas';

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
  usePathname: () => '/panel/inventario/entradas',
}));

const PROVEEDOR: Proveedor = {
  id: 3,
  rut: '76086428-5',
  razonSocial: 'Distribuidora Capilar SpA',
  nombreContacto: null,
  telefono: null,
  email: null,
  activo: true,
};

const UBICACIONES: UbicacionInventario[] = [
  { id: 1, codigo: 'A-01', bodega: { id: 1, nombre: 'Bodega principal' } },
  { id: 4, codigo: 'S-01', bodega: { id: 2, nombre: 'Sala de ventas' } },
];

const SHAMPOO: FormatoParaPack = {
  formatoId: 11,
  sku: 'SH-REP-300',
  nombreFormato: '300 ml',
  producto: { id: 1, nombre: 'Shampoo reparador' },
  canalVenta: 'general',
};
const TINTE: FormatoParaPack = {
  formatoId: 12,
  sku: 'TIN-71-60',
  nombreFormato: 'Tono 7.1',
  producto: { id: 2, nombre: 'Tinte permanente' },
  canalVenta: 'general',
};

const ENTRADA: EntradaListado = {
  id: 7,
  fechaRecepcion: '2026-09-28',
  tipoDocumento: 'factura',
  numeroDocumento: 'F-004398',
  proveedor: { id: 3, razonSocial: 'Distribuidora Capilar SpA' },
  ubicacion: { id: 1, codigo: 'A-01', bodega: 'Bodega principal' },
  cantidadFormatos: 2,
  unidades: 60,
  costoNetoTotal: 160200.5,
  registradoPor: { nombre: 'Jorge Pino' },
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de las dos pantallas; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: Request[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/inventario/entradas': () =>
      Response.json({ items: [ENTRADA], total: 1, pagina: 1, limite: 20 }),
    'GET /api/inventario/ubicaciones': () => Response.json(UBICACIONES),
    'GET /api/inventario/proveedores': () => Response.json([PROVEEDOR]),
    'GET /api/catalogo/formatos': () =>
      Response.json({
        items: [SHAMPOO, TINTE],
        total: 2,
        pagina: 1,
        limite: 20,
      }),
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

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

describe('Entradas de inventario · lista (SCRUM-111)', () => {
  it('E11-H2 FE · CA1 lista: muestra fecha, documento, proveedor, ubicación, formatos, unidades, costo neto y quién la registró', async () => {
    simularBackend();
    mostrar(<PantallaEntradas />);

    const tabla = await screen.findByRole('table', {
      name: 'Entradas de inventario',
    });
    expect(
      within(tabla)
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual([
      'Fecha',
      'Documento',
      'Proveedor',
      'Ubicación',
      'Formatos',
      'Unidades',
      'Costo neto',
      'Registró',
    ]);
    const celdas = within(within(tabla).getAllByRole('row')[1])
      .getAllByRole('cell')
      .map((celda) => celda.textContent);
    expect(celdas).toEqual([
      '28 sept 2026',
      'Factura F-004398',
      'Distribuidora Capilar SpA',
      'A-01Bodega principal',
      '2',
      '60',
      expect.stringMatching(/^\$160\.200,50$/),
      'Jorge Pino',
    ]);
    // Celular: la misma entrada como tarjeta
    const lista = screen.getByRole('list', { name: 'Entradas de inventario' });
    expect(
      within(lista).getByText(
        /Factura F-004398 · A-01 · 2 formatos · 60 unid\./,
      ),
    ).toBeInTheDocument();
  });

  it('E11-H2 FE · CA1 lista: sin entradas, lo dice', async () => {
    simularBackend({
      'GET /api/inventario/entradas': () =>
        Response.json({ items: [], total: 0, pagina: 1, limite: 20 }),
    });
    mostrar(<PantallaEntradas />);

    expect(
      await screen.findByText('Aún no hay entradas registradas.'),
    ).toBeInTheDocument();
  });

  it('E11-H2 FE · CA1 filtros: envía al backend la bodega, la búsqueda y las fechas', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradas />);
    await screen.findByRole('table', { name: 'Entradas de inventario' });

    await usuario.click(screen.getByRole('combobox', { name: 'Bodega' }));
    await usuario.click(
      await screen.findByRole('option', { name: 'Sala de ventas' }),
    );
    await usuario.type(
      screen.getByLabelText('Buscar entradas por proveedor o documento'),
      'F-0043',
    );
    await usuario.click(
      screen.getByRole('button', { name: /Fechas de recepción/ }),
    );
    await usuario.type(screen.getByLabelText('Desde'), '2026-09-01');

    await waitFor(() => {
      const consulta = new URL(pedidas.at(-1)!.url).searchParams;
      expect(Object.fromEntries(consulta)).toEqual({
        bodegaId: '2',
        buscar: 'F-0043',
        desde: '2026-09-01',
      });
    });
  });

  it('E11-H2 FE · CA1 lista: si el backend falla, muestra su mensaje', async () => {
    simularBackend({
      'GET /api/inventario/entradas': () =>
        error(403, 'No tienes permiso para registrar inventario.'),
    });
    mostrar(<PantallaEntradas />);

    expect(
      await screen.findByText('No tienes permiso para registrar inventario.'),
    ).toBeInTheDocument();
  });
});

const elegir = async (
  usuario: ReturnType<typeof userEvent.setup>,
  etiqueta: string,
  opcion: string,
) => {
  await usuario.click(await screen.findByRole('combobox', { name: etiqueta }));
  await usuario.click(await screen.findByRole('option', { name: opcion }));
};

const agregarFormato = async (
  usuario: ReturnType<typeof userEvent.setup>,
  nombre: string,
) => {
  await usuario.click(screen.getByRole('button', { name: 'Agregar formato' }));
  const panel = within(await screen.findByRole('dialog'));
  await usuario.click(
    await panel.findByRole('button', { name: `Agregar ${nombre}` }),
  );
  await usuario.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
};

/** Completa la recepción y un formato con su cantidad y costo. */
const completarEntrada = async (
  usuario: ReturnType<typeof userEvent.setup>,
) => {
  await elegir(usuario, 'Proveedor', 'Distribuidora Capilar SpA');
  await usuario.type(
    screen.getByLabelText(/^Fecha de recepción/),
    '2026-10-12',
  );
  await elegir(usuario, 'Documento', 'Factura');
  await usuario.type(
    screen.getByLabelText(/^Número de factura o guía/),
    'F-004512',
  );
  await elegir(usuario, 'Ubicación', 'Bodega principal · A-01');
  await agregarFormato(usuario, 'Shampoo reparador · 300 ml');
  await usuario.type(
    screen.getByLabelText('Cantidad de Shampoo reparador · 300 ml'),
    '24',
  );
  await usuario.type(
    screen.getByLabelText('Costo unitario neto de Shampoo reparador · 300 ml'),
    '4200,5',
  );
};

const registrar = (usuario: ReturnType<typeof userEvent.setup>) =>
  usuario.click(
    screen.getAllByRole('button', { name: 'Registrar entrada' })[0],
  );

const REGISTRADA: EntradaRegistrada = {
  id: 9,
  proveedor: {
    id: 3,
    rut: '76086428-5',
    razonSocial: 'Distribuidora Capilar SpA',
  },
  fechaRecepcion: '2026-10-12',
  tipoDocumento: 'factura',
  numeroDocumento: 'F-004512',
  observacion: null,
  ubicacion: { id: 1, codigo: 'A-01', bodega: 'Bodega principal' },
  detalles: [
    {
      formatoId: 11,
      cantidad: 24,
      costoUnitarioNeto: 4200.5,
      movimientoId: 31,
      subtotalNeto: 100812,
    },
  ],
  unidades: 24,
  costoNetoTotal: 100812,
};

describe('Entradas de inventario · nueva (SCRUM-111)', () => {
  it('E11-H2 FE · CA2 nueva entrada: envía la recepción y los formatos, y confirma con los subtotales del backend', async () => {
    const { pedidas } = simularBackend({
      'POST /api/inventario/entradas': () =>
        Response.json(REGISTRADA, { status: 201 }),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);

    await completarEntrada(usuario);
    await registrar(usuario);

    expect(
      await screen.findByRole('heading', { name: 'Entrada registrada' }),
    ).toBeInTheDocument();
    const post = pedidas.find((pedida) => pedida.method === 'POST')!;
    expect(await post.json()).toEqual({
      proveedorId: 3,
      fechaRecepcion: '2026-10-12',
      tipoDocumento: 'factura',
      numeroDocumento: 'F-004512',
      ubicacionId: 1,
      detalles: [{ formatoId: 11, cantidad: 24, costoUnitarioNeto: 4200.5 }],
    });
    const tabla = screen.getByRole('table', {
      name: 'Formatos de la entrada registrada',
    });
    const fila = within(tabla).getAllByRole('row')[1];
    expect(
      within(fila).getByText('Shampoo reparador · 300 ml'),
    ).toBeInTheDocument();
    expect(within(fila).getAllByText('$100.812')).not.toHaveLength(0);
    expect(
      await screen.findByText('Registramos la entrada de Factura F-004512.'),
    ).toBeInTheDocument();
  });

  it('E11-H2 FE · CA2 confirmación: si el backend aún no envía los subtotales, no los inventa', async () => {
    const { subtotalNeto: _s, ...detalle } = REGISTRADA.detalles[0];
    simularBackend({
      'POST /api/inventario/entradas': () =>
        Response.json(
          {
            ...REGISTRADA,
            detalles: [detalle],
            unidades: undefined,
            costoNetoTotal: undefined,
          },
          { status: 201 },
        ),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);

    await completarEntrada(usuario);
    await registrar(usuario);

    const tabla = await screen.findByRole('table', {
      name: 'Formatos de la entrada registrada',
    });
    expect(within(tabla).getAllByText('Sin dato')).toHaveLength(3);
    expect(within(tabla).queryByText('$100.812')).not.toBeInTheDocument();
  });

  it('E11-H2 FE · CA3 falta un dato: señala cada campo y la lista vacía sin llamar al backend', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await screen.findByRole('combobox', { name: 'Proveedor' });

    await registrar(usuario);

    expect(
      await screen.findByText('El proveedor es obligatorio.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La fecha de recepción es obligatoria.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('El número de documento es obligatorio.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La ubicación de destino es obligatoria.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Agrega los formatos recibidos.'),
    ).toBeInTheDocument();
    expect(pedidas.some((pedida) => pedida.method === 'POST')).toBe(false);
  });

  it('E11-H2 FE · CA3 fila inválida: señala la cantidad de esa fila', async () => {
    simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await completarEntrada(usuario);
    const cantidad = screen.getByLabelText(
      'Cantidad de Shampoo reparador · 300 ml',
    );
    await usuario.clear(cantidad);
    await usuario.type(cantidad, '0');

    await registrar(usuario);

    expect(
      await screen.findByText('La cantidad debe ser un número entero desde 1.'),
    ).toBeInTheDocument();
    expect(cantidad).toHaveAttribute('aria-invalid', 'true');
  });

  it('E11-H2 FE · CA3 el servidor rechaza: el documento repetido va junto a su campo y no se pierde lo escrito', async () => {
    simularBackend({
      'POST /api/inventario/entradas': () =>
        error(
          409,
          'Ya hay una entrada registrada con ese documento del proveedor.',
        ),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await completarEntrada(usuario);

    await registrar(usuario);

    const numero = screen.getByLabelText(/^Número de factura o guía/);
    expect(
      await screen.findByText(
        'Ya hay una entrada registrada con ese documento del proveedor.',
      ),
    ).toBeInTheDocument();
    expect(numero).toHaveAttribute('aria-invalid', 'true');
    expect(numero).toHaveValue('F-004512');
    expect(
      screen.getByLabelText('Cantidad de Shampoo reparador · 300 ml'),
    ).toHaveValue(24);
  });

  it('E11-H2 FE · CA3 el servidor rechaza un formato: señala su fila', async () => {
    simularBackend({
      'POST /api/inventario/entradas': () =>
        error(400, ['El formato 11 no existe.']),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await completarEntrada(usuario);

    await registrar(usuario);

    expect(
      await screen.findByText('El formato 11 no existe.'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Cantidad de Shampoo reparador · 300 ml'),
    ).toHaveAttribute('aria-invalid', 'true');
  });

  it('E11-H2 FE · CA3 formato repetido: un formato ya agregado no se puede agregar otra vez', async () => {
    simularBackend();
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await screen.findByRole('combobox', { name: 'Proveedor' });
    await agregarFormato(usuario, 'Shampoo reparador · 300 ml');

    await usuario.click(
      screen.getByRole('button', { name: 'Agregar formato' }),
    );
    const panel = within(await screen.findByRole('dialog'));

    expect(
      await panel.findByRole('button', {
        name: 'Shampoo reparador · 300 ml ya está en la entrada',
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Entradas de inventario · errores del servidor (SCRUM-111)', () => {
  it('E11-H2 FE · CA3 formato repetido según el servidor: el mensaje va bajo la lista de formatos', async () => {
    simularBackend({
      'POST /api/inventario/entradas': () =>
        error(400, ['Cada formato debe aparecer una sola vez en la entrada.']),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await completarEntrada(usuario);

    await registrar(usuario);

    const seccion = screen
      .getByRole('heading', { name: 'Formatos recibidos' })
      .closest('section') as HTMLElement;
    expect(
      await within(seccion).findByText(
        'Cada formato debe aparecer una sola vez en la entrada.',
      ),
    ).toBeInTheDocument();
  });

  it('E11-H2 FE · CA3 falla del servidor: muestra el mensaje genérico sin detalles y conserva lo escrito', async () => {
    simularBackend({
      'POST /api/inventario/entradas': () =>
        error(500, 'TypeError: detalle interno'),
    });
    const usuario = userEvent.setup();
    mostrar(<PantallaEntradaNueva />);
    await completarEntrada(usuario);

    await registrar(usuario);

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/detalle interno/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Número de factura o guía/)).toHaveValue(
      'F-004512',
    );
  });
});

describe('destinoDelError (SCRUM-111)', () => {
  it('E11-H2 FE · CA3 reconoce a qué parte del formulario apunta cada mensaje del backend', () => {
    expect(
      destinoDelError(
        'El proveedor está desactivado: no se le pueden registrar entradas.',
      ),
    ).toEqual({ tipo: 'campo', campo: 'proveedorId' });
    expect(
      destinoDelError('La fecha de recepción no puede ser posterior a hoy.'),
    ).toEqual({ tipo: 'campo', campo: 'fechaRecepcion' });
    expect(
      destinoDelError(
        'La ubicación o su bodega está desactivada: elige otra ubicación.',
      ),
    ).toEqual({ tipo: 'campo', campo: 'ubicacionId' });
    expect(
      destinoDelError('Cada formato debe aparecer una sola vez en la entrada.'),
    ).toEqual({ tipo: 'repetidos' });
    expect(destinoDelError('Los formatos 11, 12 no existen.')).toEqual({
      tipo: 'filas',
      formatoIds: [11, 12],
    });
    expect(
      destinoDelError(
        'El stock del formato 12 en esa ubicación superaría el máximo permitido.',
      ),
    ).toEqual({ tipo: 'filas', formatoIds: [12] });
    expect(
      destinoDelError(
        'La cantidad recibida debe ser un número entero desde 1 y hasta 1000000.',
      ),
    ).toEqual({ tipo: 'formatos' });
    expect(destinoDelError('Algo inesperado.')).toBeNull();
  });
});
