import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { FormatoPanel } from '@/compartido/api/respuestas';
import {
  error,
  formato,
  iniciarSesion,
  mostrar,
  producto,
  simularBackend,
} from './apiDePrueba';
import {
  PantallaEditarProducto,
  PantallaProductoNuevo,
} from './pantallaProducto';

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
  useRouter: () => ({ replace: vi.fn() }),
}));

const LITRO = formato({
  id: 22,
  sku: 'SH-REP-1000',
  codigoBarras: null,
  nombreFormato: '1 L',
  contenido: 1000,
  stockMinimo: 3,
  fechaVencimiento: '2027-12-31',
  esPredeterminado: false,
});

/**
 * Backend con el producto 7 y sus formatos. `formatos` es la lista que responde cada GET, en
 * orden (la última se repite).
 */
const conFormatos = (
  formatos: FormatoPanel[][],
  extra: Parameters<typeof simularBackend>[0] = {},
) => {
  let pedido = 0;
  return simularBackend({
    'GET /api/catalogo/productos/7': () => Response.json(producto()),
    'GET /api/catalogo/productos/7/formatos': () =>
      Response.json(formatos[Math.min(pedido++, formatos.length - 1)]),
    ...extra,
  });
};

/** En jsdom se dibujan la tabla (escritorio) y la lista (celular): se usa la tabla. */
const tabla = async () => within(await screen.findByRole('table'));

const campo = (etiqueta: string) =>
  screen.getByLabelText(new RegExp(`^${etiqueta}`));

const escribir = async (etiqueta: string, texto: string) => {
  await userEvent.clear(campo(etiqueta));
  await userEvent.type(campo(etiqueta), texto);
};

const llenarObligatorios = async () => {
  await escribir('SKU', 'SH-REP-500');
  await escribir('Nombre del formato', '500 ml');
  await escribir('Peso', '540');
  await escribir('Alto', '20,5');
  await escribir('Ancho', '7');
  await escribir('Largo', '5');
};

const panelFormato = () => within(screen.getByRole('dialog'));

beforeEach(() => {
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Tabla de formatos (SCRUM-101)', () => {
  it('E3-H2 FE · tabla: muestra cada formato con su SKU, stock mínimo y vencimiento', async () => {
    conFormatos([[formato(), LITRO]]);
    mostrar(<PantallaEditarProducto id="7" />);

    const filas = (await tabla()).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('300 ml')).toBeInTheDocument();
    expect(within(filas[0]).getByText('SH-REP-300')).toBeInTheDocument();
    expect(within(filas[0]).getByText('5')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Sin fecha')).toBeInTheDocument();
    expect(within(filas[1]).getByText('1 L')).toBeInTheDocument();
    expect(within(filas[1]).getByText('31 dic 2027')).toBeInTheDocument();
  });

  it('E3-H2 FE · sin formatos: lo explica y deja agregar el primero', async () => {
    conFormatos([[]]);
    mostrar(<PantallaEditarProducto id="7" />);

    expect(
      await screen.findByText(/Este producto aún no tiene formatos/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Agregar formato' }),
    ).toBeInTheDocument();
  });

  it('E3-H2 FE · producto nuevo: pide guardarlo antes de agregar formatos', () => {
    simularBackend({});
    mostrar(<PantallaProductoNuevo />);

    expect(
      screen.getByText('Guarda el producto para agregar sus formatos.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Agregar formato' }),
    ).not.toBeInTheDocument();
  });

  it('E3-H2 FE · criterio 1, agregar: envía SKU, código, nombre, contenido, peso, medidas y stock mínimo, sin vencimiento', async () => {
    const nuevo = LITRO;
    const { enviados, pedidas } = conFormatos(
      [[formato()], [formato(), nuevo]],
      {
        'POST /api/catalogo/productos/7/formatos': () =>
          Response.json(nuevo, { status: 201 }),
      },
    );
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Agregar formato' }),
    );
    await llenarObligatorios();
    await escribir('Código de barras', '78012345');
    await escribir('Contenido', '500');
    await userEvent.click(screen.getByRole('combobox', { name: /^Unidad/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'ml' }));
    await escribir('Stock mínimo', '4');
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Agregar' }),
    );

    await waitFor(() =>
      expect(enviados).toEqual([
        {
          sku: 'SH-REP-500',
          codigoBarras: '78012345',
          nombreFormato: '500 ml',
          contenido: 500,
          unidadMedida: 'ml',
          fechaVencimiento: null,
          stockMinimo: 4,
          pesoGramos: 540,
          altoCm: 20.5,
          anchoCm: 7,
          largoCm: 5,
        },
      ]),
    );
    expect(pedidas).toContain('POST /api/catalogo/productos/7/formatos');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(await (await tabla()).findByText('1 L')).toBeInTheDocument();
  });

  it('E3-H2 FE · criterio 1, agregar: sin datos marca los obligatorios y no envía nada', async () => {
    const { enviados } = conFormatos([[formato()]]);
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Agregar formato' }),
    );
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Agregar' }),
    );

    expect(await screen.findByText('El SKU es obligatorio.')).toBeVisible();
    expect(
      screen.getByText('El nombre del formato es obligatorio.'),
    ).toBeVisible();
    expect(screen.getByText('El peso es obligatorio.')).toBeVisible();
    expect(enviados).toEqual([]);
  });

  it('E3-H2 FE · criterio 1, editar: abre el formato con sus datos y envía los cambios', async () => {
    const { enviados, pedidas } = conFormatos([[formato(), LITRO]], {
      'PATCH /api/catalogo/formatos/22': () =>
        Response.json({ ...LITRO, stockMinimo: 8 }),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      (await tabla()).getByRole('button', { name: 'Editar 1 L' }),
    );
    expect(campo('SKU')).toHaveValue('SH-REP-1000');
    expect(campo('Alto')).toHaveValue('18,5');
    await escribir('Stock mínimo', '8');
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() =>
      expect(pedidas).toContain('PATCH /api/catalogo/formatos/22'),
    );
    expect(enviados[0]).toEqual({
      sku: 'SH-REP-1000',
      codigoBarras: null,
      nombreFormato: '1 L',
      contenido: 1000,
      unidadMedida: 'ml',
      fechaVencimiento: '2027-12-31',
      stockMinimo: 8,
      pesoGramos: 320,
      altoCm: 18.5,
      anchoCm: 6,
      largoCm: 4,
    });
  });

  it('E3-H2 FE · criterio 1, contenido sin unidad: lo marca antes de enviar', async () => {
    const { enviados } = conFormatos([[formato()]]);
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Agregar formato' }),
    );
    await llenarObligatorios();
    await escribir('Contenido', '500');
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Agregar' }),
    );

    expect(
      await screen.findByText(
        'Indica el contenido junto con su unidad de medida.',
      ),
    ).toBeVisible();
    expect(enviados).toEqual([]);
  });

  it.each([
    ['El SKU ya pertenece a otro artículo.', ['SKU']],
    ['El código de barras ya pertenece a otro artículo.', ['Código de barras']],
    [
      'El SKU y el código de barras ya pertenecen a otro artículo.',
      ['SKU', 'Código de barras'],
    ],
  ])(
    'E3-H2 FE · criterio 2, dato repetido: «%s» queda junto a su campo sin perder lo escrito',
    async (mensaje, campos) => {
      conFormatos([[formato()]], {
        'POST /api/catalogo/productos/7/formatos': () => error(409, mensaje),
      });
      mostrar(<PantallaEditarProducto id="7" />);

      await userEvent.click(
        await screen.findByRole('button', { name: 'Agregar formato' }),
      );
      await llenarObligatorios();
      await escribir('Código de barras', '7801234567890');
      await userEvent.click(
        panelFormato().getByRole('button', { name: 'Agregar' }),
      );

      for (const etiqueta of campos) {
        await waitFor(() =>
          expect(campo(etiqueta)).toHaveAccessibleDescription(mensaje),
        );
        expect(campo(etiqueta)).toHaveAttribute('aria-invalid', 'true');
      }
      expect(campo('SKU')).toHaveValue('SH-REP-500');
      expect(campo('Código de barras')).toHaveValue('7801234567890');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    },
  );

  it('E3-H2 FE · criterio 2, dato repetido al editar: el error queda junto al SKU', async () => {
    const mensaje = 'El SKU ya pertenece a otro artículo.';
    conFormatos([[formato(), LITRO]], {
      'PATCH /api/catalogo/formatos/22': () => error(409, mensaje),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      (await tabla()).getByRole('button', { name: 'Editar 1 L' }),
    );
    await escribir('SKU', 'SH-REP-300');
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() =>
      expect(campo('SKU')).toHaveAccessibleDescription(mensaje),
    );
    expect(campo('SKU')).toHaveValue('SH-REP-300');
  });

  it('E3-H2 FE · criterio 3, predeterminado: marca otro y la tabla muestra una sola marca', async () => {
    const { enviados } = conFormatos(
      [
        [formato(), LITRO],
        [
          { ...LITRO, esPredeterminado: true },
          formato({ esPredeterminado: false }),
        ],
      ],
      {
        'PATCH /api/catalogo/formatos/22': () =>
          Response.json({ ...LITRO, esPredeterminado: true }),
      },
    );
    mostrar(<PantallaEditarProducto id="7" />);

    const antes = await tabla();
    expect(antes.getAllByText('Predeterminado')).toHaveLength(1);
    expect(
      within(antes.getAllByRole('row')[1]).getByText('Predeterminado'),
    ).toBeInTheDocument();

    await userEvent.click(antes.getByRole('button', { name: 'Editar 1 L' }));
    await userEvent.click(
      screen.getByRole('switch', { name: 'Formato predeterminado' }),
    );
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() =>
      expect(enviados[0]).toMatchObject({ esPredeterminado: true }),
    );
    await waitFor(async () => {
      const filas = (await tabla()).getAllByRole('row');
      expect(within(filas[1]).getByText('1 L')).toBeInTheDocument();
    });
    const despues = await tabla();
    expect(despues.getAllByText('Predeterminado')).toHaveLength(1);
    expect(
      within(despues.getAllByRole('row')[1]).getByText('Predeterminado'),
    ).toBeInTheDocument();
  });

  it('E3-H2 FE · criterio 3, predeterminado: no se puede desmarcar, se marca otro', async () => {
    conFormatos([[formato(), LITRO]]);
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      (await tabla()).getByRole('button', { name: 'Editar 300 ml' }),
    );

    const interruptor = screen.getByRole('switch', {
      name: 'Formato predeterminado',
    });
    expect(interruptor).toBeChecked();
    expect(interruptor).toBeDisabled();
    expect(interruptor).toHaveAccessibleDescription(
      'Para cambiarlo, marca otro formato como predeterminado.',
    );
  });

  it('E3-H2 FE · criterio 3, editar el predeterminado: no lo vuelve a marcar', async () => {
    const { enviados } = conFormatos([[formato(), LITRO]], {
      'PATCH /api/catalogo/formatos/21': () => Response.json(formato()),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      (await tabla()).getByRole('button', { name: 'Editar 300 ml' }),
    );
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(enviados[0]).not.toHaveProperty('esPredeterminado');
  });

  it('E3-H2 FE · error del servidor: muestra el mensaje sin detalles técnicos', async () => {
    conFormatos([[formato()]], {
      'POST /api/catalogo/productos/7/formatos': () =>
        error(500, 'PrismaClientKnownRequestError'),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Agregar formato' }),
    );
    await llenarObligatorios();
    await userEvent.click(
      panelFormato().getByRole('button', { name: 'Agregar' }),
    );

    expect(
      await panelFormato().findByText(/No pudimos completar la acción/),
    ).toBeVisible();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
  });
});
