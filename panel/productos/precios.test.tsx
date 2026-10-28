import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CambioPrecio,
  PreciosArticulo,
  ProductoPanel,
} from '@/compartido/api/respuestas';
import {
  error,
  formato,
  iniciarSesion,
  mostrar,
  precios,
  producto,
  simularBackend,
} from './apiDePrueba';
import { PantallaEditarProducto } from './pantallaProducto';

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

const RUTA_PRECIOS = '/api/catalogo/articulos/21/precios';

const cambio = (extra: Partial<CambioPrecio> = {}): CambioPrecio => ({
  id: 1,
  tipoPrecio: 'minorista',
  precioNeto: 10916,
  fechaInicioVigencia: '2026-10-20T15:30:00.000Z',
  fechaFinVigencia: null,
  motivo: 'Precio inicial',
  fijadoPor: { nombre: 'Violeta', apellido: 'Ramírez' },
  ...extra,
});

/**
 * Backend con el producto 7, su formato 21 y sus precios. `respuestas` es lo que responde cada
 * GET de precios, en orden (la última se repite).
 */
const conPrecios = (
  respuestas: PreciosArticulo[],
  extra: Parameters<typeof simularBackend>[0] = {},
  datosProducto: ProductoPanel[] = [producto()],
) => {
  let pedidoPrecios = 0;
  let pedidoProducto = 0;
  return simularBackend({
    'GET /api/catalogo/productos/7': () =>
      Response.json(
        datosProducto[Math.min(pedidoProducto++, datosProducto.length - 1)],
      ),
    'GET /api/catalogo/productos/7/formatos': () => Response.json([formato()]),
    [`GET ${RUTA_PRECIOS}`]: () =>
      Response.json(
        respuestas[Math.min(pedidoPrecios++, respuestas.length - 1)],
      ),
    ...extra,
  });
};

/** En jsdom se dibujan la tabla (escritorio) y la lista (celular): se usa la tabla. */
const tabla = async () => within(await screen.findByRole('table'));

const abrirPrecios = async () => {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Precios de 300 ml' }),
  );
  return within(await screen.findByRole('dialog'));
};

const escribir = async (
  panel: ReturnType<typeof within>,
  etiqueta: string,
  texto: string,
) => {
  const campo = await panel.findByLabelText(new RegExp(`^${etiqueta}`));
  await userEvent.clear(campo);
  if (texto) await userEvent.type(campo, texto);
};

beforeEach(() => {
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Precios en el panel (SCRUM-104)', () => {
  it('E3-H5 FE · tabla: muestra el minorista y el mayorista netos con el valor con IVA del backend', async () => {
    conPrecios([precios()]);
    mostrar(<PantallaEditarProducto id="7" />);

    const fila = (await tabla()).getAllByRole('row')[1];
    expect(await within(fila).findByText('$10.916')).toBeInTheDocument();
    expect(within(fila).getByText('con IVA $12.990')).toBeInTheDocument();
    expect(within(fila).getByText('$7.134,45')).toBeInTheDocument();
    expect(within(fila).getByText('con IVA $8.490')).toBeInTheDocument();
  });

  it('E3-H5 FE · tabla: un formato sin precio lo dice', async () => {
    conPrecios([
      precios({
        precioMinoristaNeto: null,
        precioMayoristaNeto: null,
        precioMinoristaConIva: null,
        precioMayoristaConIva: null,
      }),
    ]);
    mostrar(<PantallaEditarProducto id="7" />);

    const fila = (await tabla()).getAllByRole('row')[1];
    await waitFor(() =>
      expect(within(fila).getAllByText('Sin precio')).toHaveLength(2),
    );
  });

  it('E3-H5 FE · criterio 1, precios netos: muestra al lado el valor con IVA mientras escribe', async () => {
    conPrecios([precios()]);
    mostrar(<PantallaEditarProducto id="7" />);

    const panel = await abrirPrecios();
    await escribir(panel, 'Precio minorista neto', '10000');
    expect(panel.getByText('con IVA $11.900')).toBeInTheDocument();
    await escribir(panel, 'Precio mayorista neto', '8403,36');
    expect(panel.getByText('con IVA $10.000')).toBeInTheDocument();
    expect(
      panel.getByLabelText(/^Precio mayorista neto/),
    ).toHaveAccessibleDescription('con IVA $10.000');
  });

  it('E3-H5 FE · criterio 1: sin la tasa del backend no inventa el valor con IVA', async () => {
    conPrecios([
      precios({
        porcentajeIva: undefined,
        precioMinoristaConIva: undefined,
        precioMayoristaConIva: undefined,
      }),
    ]);
    mostrar(<PantallaEditarProducto id="7" />);

    const panel = await abrirPrecios();
    await escribir(panel, 'Precio minorista neto', '10000');
    expect(panel.queryByText(/con IVA/)).not.toBeInTheDocument();
  });

  it('E3-H5 FE · criterio 2, exclusivo: pide solo el precio mayorista', async () => {
    const { enviados } = conPrecios(
      [
        precios({
          exclusivo: true,
          precioMinoristaNeto: null,
          precioMinoristaConIva: null,
        }),
      ],
      {
        [`PUT ${RUTA_PRECIOS}`]: () =>
          Response.json(precios({ exclusivo: true })),
      },
    );
    mostrar(<PantallaEditarProducto id="7" />);

    const fila = (await tabla()).getAllByRole('row')[1];
    expect(await within(fila).findByText('Exclusivo')).toBeInTheDocument();

    const panel = await abrirPrecios();
    expect(
      panel.getByText(
        /exclusivo para profesionales: solo lleva precio mayorista/,
      ),
    ).toBeInTheDocument();
    expect(
      panel.queryByLabelText(/^Precio minorista neto/),
    ).not.toBeInTheDocument();
    await escribir(panel, 'Precio mayorista neto', '7500');
    await escribir(panel, 'Motivo del cambio', 'Precio para peluquerías');
    await userEvent.click(panel.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(enviados).toEqual([
        { precioMayoristaNeto: 7500, motivo: 'Precio para peluquerías' },
      ]),
    );
  });

  it('E3-H5 FE · criterio 2: al marcar el producto como exclusivo, vuelve a pedir sus precios', async () => {
    const { pedidas } = conPrecios(
      [
        precios(),
        precios({
          exclusivo: true,
          precioMinoristaNeto: null,
          precioMinoristaConIva: null,
        }),
      ],
      {
        'PATCH /api/catalogo/productos/7': () =>
          Response.json(producto({ canalVenta: 'profesional' })),
      },
    );
    mostrar(<PantallaEditarProducto id="7" />);

    const fila = (await tabla()).getAllByRole('row')[1];
    expect(await within(fila).findByText('$10.916')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('switch', { name: 'Exclusivo para profesionales' }),
    );
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Guardar producto' })[0],
    );

    expect(await within(fila).findByText('Exclusivo')).toBeInTheDocument();
    expect(
      pedidas.filter((pedida) => pedida === `GET ${RUTA_PRECIOS}`),
    ).toHaveLength(2);
  });

  it('E3-H5 FE · criterio 3, cambio de precio: envía solo lo que cambia con su motivo y muestra el historial', async () => {
    const guardados = precios({
      precioMinoristaNeto: 11500,
      precioMinoristaConIva: 13685,
      historial: [
        cambio({
          id: 2,
          precioNeto: 11500,
          fechaInicioVigencia: '2026-10-28T18:00:00.000Z',
          motivo: 'Alza del proveedor',
        }),
        cambio({ fechaFinVigencia: '2026-10-28T18:00:00.000Z' }),
      ],
    });
    const { enviados } = conPrecios([precios({ historial: [cambio()] })], {
      [`PUT ${RUTA_PRECIOS}`]: () => Response.json(guardados),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    const panel = await abrirPrecios();
    expect(panel.getByText('Precio inicial')).toBeInTheDocument();
    await escribir(panel, 'Precio minorista neto', '11500');
    await escribir(panel, 'Motivo del cambio', 'Alza del proveedor');
    await userEvent.click(panel.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(enviados).toEqual([
        { precioMinoristaNeto: 11500, motivo: 'Alza del proveedor' },
      ]),
    );
    const historial = within(
      await panel.findByRole('region', { name: 'Historial de cambios' }),
    );
    const cambios = await historial.findAllByRole('listitem');
    expect(cambios).toHaveLength(2);
    expect(
      within(cambios[0]).getByText('Alza del proveedor'),
    ).toBeInTheDocument();
    expect(within(cambios[0]).getByText('Vigente')).toBeInTheDocument();
    expect(within(cambios[0]).getByText(/Violeta Ramírez/)).toBeInTheDocument();
    expect(within(cambios[1]).queryByText('Vigente')).not.toBeInTheDocument();
    // El formulario parte de los precios guardados, con el motivo vacío
    expect(panel.getByLabelText(/^Motivo del cambio/)).toHaveValue('');
    expect(panel.getByLabelText(/^Precio minorista neto/)).toHaveValue('11500');
  });

  it('E3-H5 FE · criterio 3: sin motivo no envía y lo marca junto al campo', async () => {
    const { enviados } = conPrecios([precios()]);
    mostrar(<PantallaEditarProducto id="7" />);

    const panel = await abrirPrecios();
    await escribir(panel, 'Precio minorista neto', '11500');
    await userEvent.click(panel.getByRole('button', { name: 'Guardar' }));

    expect(
      await panel.findByText('El motivo es obligatorio.'),
    ).toBeInTheDocument();
    expect(enviados).toEqual([]);
  });

  it('E3-H5 FE · sin cambios: avisa y no envía', async () => {
    const { enviados } = conPrecios([precios()]);
    mostrar(<PantallaEditarProducto id="7" />);

    const panel = await abrirPrecios();
    await escribir(panel, 'Motivo del cambio', 'Revisión');
    await userEvent.click(panel.getByRole('button', { name: 'Guardar' }));

    expect(
      await panel.findByText(/iguales a los vigentes/),
    ).toBeInTheDocument();
    expect(enviados).toEqual([]);
  });

  it('E3-H5 FE · error del backend: queda junto a su campo sin perder lo escrito', async () => {
    conPrecios([precios()], {
      [`PUT ${RUTA_PRECIOS}`]: () =>
        error(400, [
          'El precio mayorista neto debe ser un número con hasta dos decimales mayor que 0 y hasta 9999999999.99.',
        ]),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    const panel = await abrirPrecios();
    await escribir(panel, 'Precio mayorista neto', '7000');
    await escribir(panel, 'Motivo del cambio', 'Ajuste');
    await userEvent.click(panel.getByRole('button', { name: 'Guardar' }));

    expect(
      await panel.findByText(/^El precio mayorista neto debe ser/),
    ).toBeInTheDocument();
    expect(panel.getByLabelText(/^Precio mayorista neto/)).toHaveValue('7000');
    expect(panel.getByLabelText(/^Motivo del cambio/)).toHaveValue('Ajuste');
  });

  it('E3-H5 FE · celular: la tarjeta muestra los netos con IVA y abre el panel de precios', async () => {
    conPrecios([
      precios({
        exclusivo: true,
        precioMinoristaNeto: null,
        precioMinoristaConIva: null,
      }),
    ]);
    mostrar(<PantallaEditarProducto id="7" />);

    const tarjeta = within(
      (await screen.findByText('SKU SH-REP-300')).closest('li')!,
    );
    expect(await tarjeta.findByText('Exclusivo')).toBeInTheDocument();
    expect(tarjeta.getByText('$7.134,45 (con IVA $8.490)')).toBeInTheDocument();
    await userEvent.click(
      tarjeta.getByRole('button', { name: 'Gestionar precios de 300 ml' }),
    );
    expect(
      await screen.findByRole('dialog', { name: 'Precios de 300 ml' }),
    ).toBeInTheDocument();
  });

  it('E3-H5 FE · error al cargar: la tabla lo dice y el panel muestra el mensaje del backend', async () => {
    conPrecios([], {
      [`GET ${RUTA_PRECIOS}`]: () => error(404, 'El artículo no existe.'),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    const fila = (await tabla()).getAllByRole('row')[1];
    await waitFor(() =>
      expect(within(fila).getAllByText('No se pudo cargar')).toHaveLength(2),
    );
    const panel = await abrirPrecios();
    expect(
      await panel.findByText('El artículo no existe.'),
    ).toBeInTheDocument();
  });

  it('E3-H5 FE · sin el permiso de precios (vendedor): no muestra ni pide los precios', async () => {
    iniciarSesion('vendedor');
    const { pedidas } = conPrecios([precios()]);
    mostrar(<PantallaEditarProducto id="7" />);

    const encabezados = (await tabla()).getAllByRole('columnheader');
    expect(
      encabezados.map((encabezado) => encabezado.textContent),
    ).not.toContain('Minorista neto');
    expect(
      screen.queryByRole('button', { name: 'Precios de 300 ml' }),
    ).not.toBeInTheDocument();
    expect(pedidas).not.toContain(`GET ${RUTA_PRECIOS}`);
  });
});
