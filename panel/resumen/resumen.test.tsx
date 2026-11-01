import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { FormatoBajoMinimo } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { AvisoStockBajo } from './avisoStockBajo';

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

const simularBackend = (responder: () => Response) => {
  const fetch = vi.fn(async (peticion: Request) => {
    const ruta = new URL(peticion.url).pathname;
    if (ruta !== '/api/inventario/stock/bajo-minimo') {
      throw new Error(`Petición no simulada: ${ruta}`);
    }
    return responder();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <AvisoStockBajo />
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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Resumen del panel: aviso de stock bajo (SCRUM-115)', () => {
  it('E11-H6 FE · CA1 aviso en el resumen: muestra el total y los formatos que más faltan con su stock y mínimo', async () => {
    simularBackend(() => Response.json(BAJO_MINIMO));
    iniciarSesion('bodeguero');
    mostrar();

    const indicador = await screen.findByText('Formatos con stock bajo');
    expect(indicador.parentElement).toHaveTextContent(
      '6Formatos con stock bajo',
    );
    expect(
      screen.getByRole('heading', { name: 'Stock bajo el mínimo' }),
    ).toBeVisible();

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

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/panel/inventario',
    );
  });

  it('E11-H6 FE · CA1 aviso en el resumen: también lo ve administración', async () => {
    simularBackend(() => Response.json(BAJO_MINIMO.slice(0, 1)));
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
    const fetch = simularBackend(() => Response.json([]));
    iniciarSesion('bodeguero');
    const { container } = mostrar();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByText('Formatos con stock bajo')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('E11-H6 FE · el vendedor no ve el aviso ni se pide al backend', async () => {
    const fetch = simularBackend(() => Response.json(BAJO_MINIMO));
    iniciarSesion('vendedor');
    const { container } = mostrar();

    expect(container).toBeEmptyDOMElement();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('E11-H6 FE · un error del servidor no muestra detalles técnicos', async () => {
    simularBackend(() =>
      Response.json(
        { statusCode: 500, message: 'relation "existencia" does not exist' },
        { status: 500 },
      ),
    );
    iniciarSesion('bodeguero');
    mostrar();

    // Un 5xx se reintenta dos veces antes de mostrarse
    const alerta = await screen.findByRole('alert', {}, { timeout: 5000 });
    expect(alerta).not.toHaveTextContent('existencia');
  }, 10_000);
});
