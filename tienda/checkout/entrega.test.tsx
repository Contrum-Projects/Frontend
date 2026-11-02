import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CarritoCuenta,
  DireccionCuenta,
} from '@/compartido/api/respuestas';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { responder } from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaCheckout } from './pantallaCheckout';

// El cliente con una base absoluta, para que `fetch` reciba un Request (como en checkout.test)
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
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/checkout',
}));
vi.mock('./navegacion', () => ({ irAUrlExterna: vi.fn() }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
});

const CARRITO: CarritoCuenta = {
  items: [
    {
      articuloId: 11,
      tipo: 'formato',
      nombre: 'Shampoo reparador',
      nombreFormato: '300 ml',
      imagen: null,
      cantidad: 2,
      precioUnitario: 12990,
      subtotal: 25980,
      aLaVenta: true,
      stockSuficiente: true,
      impideCrearPedido: false,
    },
  ],
  total: 25980,
  puedeCrearPedido: true,
};

const PEDIDO = { codigoPublico: 'K7M2Q9XA4BCD' };

const direccion = (extra: Partial<DireccionCuenta> = {}): DireccionCuenta => ({
  id: 7,
  calle: 'Av. Providencia',
  numero: '1234',
  referencia: 'Depto. 501',
  esPrincipal: true,
  comuna: {
    codigoCut: '13123',
    nombre: 'Providencia',
    region: { codigoCut: '13', nombre: 'Región Metropolitana' },
  },
  ...extra,
});

const DIRECCIONES = [
  direccion(),
  direccion({
    id: 9,
    calle: 'Los Aromos',
    numero: '55',
    referencia: null,
    esPrincipal: false,
    comuna: {
      codigoCut: '8101',
      nombre: 'Concepción',
      region: { codigoCut: '8', nombre: 'Región del Biobío' },
    },
  }),
];

/** Costo y total con IVA que cotiza el backend para cada dirección. */
const COTIZACIONES: Record<string, { costo: number; total: number }> = {
  '7': { costo: 3990, total: 29970 },
  '9': { costo: 5490, total: 31470 },
};

const cotizacionDe = (id: string) =>
  responder({ ...COTIZACIONES[id], totalCarrito: CARRITO.total });

/** El backend con direcciones y cotización; registra las cotizaciones y las escrituras. */
const simularBackend = ({
  direcciones = DIRECCIONES,
  cotizar = cotizacionDe,
}: {
  direcciones?: DireccionCuenta[];
  cotizar?: (direccionId: string) => Response | Promise<Response>;
} = {}) => {
  const cotizadas: string[] = [];
  const escrituras: { ruta: string; cuerpo: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const url = new URL(peticion.url);
      const ruta = `${peticion.method} ${url.pathname}`;
      const texto = await peticion.text();
      if (peticion.method !== 'GET') {
        escrituras.push({ ruta, cuerpo: texto ? JSON.parse(texto) : null });
      }
      if (ruta === 'GET /api/carrito') return responder(CARRITO);
      if (ruta === 'GET /api/cuentas/yo/direcciones') {
        return responder(direcciones);
      }
      if (ruta === 'GET /api/despacho/cotizacion') {
        const id = url.searchParams.get('direccionId') ?? '';
        cotizadas.push(id);
        return cotizar(id);
      }
      if (ruta === 'POST /api/pedidos') return responder(PEDIDO, 201);
      if (ruta === `POST /api/pedidos/${PEDIDO.codigoPublico}/pago`) {
        return responder({
          urlPago: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=1',
          pagarHasta: '2026-11-02T15:15:00Z',
        });
      }
      return responder({ message: 'No existe.' }, 404);
    }),
  );
  return { cotizadas, escrituras };
};

const mostrar = () => {
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Camila',
        apellido: 'Rojas',
        rol: 'cliente',
      },
    }),
  );
  const clienteConsultas = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={clienteConsultas}>
      <PantallaCheckout />
    </QueryClientProvider>,
  );
};

const resumen = () => screen.getByRole('region', { name: 'Tu pedido' });
const filaTotal = () => within(resumen()).getByText('Total').parentElement;
const botonPagar = () =>
  screen.findByRole('button', { name: /pagar con mercado pago/i });
const elegirDespacho = async () =>
  userEvent.click(
    await screen.findByRole('radio', { name: /despacho a domicilio/i }),
  );
/** El primer cuerpo enviado a `POST /api/pedidos`. */
const pedidoEnviado = async (
  escrituras: { ruta: string; cuerpo: unknown }[],
) => {
  await userEvent.click(await botonPagar());
  await waitFor(() => expect(escrituras).not.toHaveLength(0));
  return escrituras[0]?.cuerpo;
};

describe('Elegir despacho o retiro en el checkout (SCRUM-122)', () => {
  it('E7-H1 FE · retiro en tienda: el resumen no suma envío', async () => {
    const { cotizadas, escrituras } = simularBackend();
    mostrar();

    // Parte con retiro: no se cotiza con Chilexpress
    const retiro = await screen.findByRole('radio', {
      name: /retiro en tienda/i,
    });
    expect(retiro).toBeChecked();
    expect(within(resumen()).queryByText('Despacho')).not.toBeInTheDocument();
    expect(filaTotal()).toHaveTextContent('Total$25.980');

    // Al pasar de despacho a retiro, el envío deja de sumarse
    await elegirDespacho();
    expect(await within(resumen()).findByText('$29.970')).toBeInTheDocument();
    await userEvent.click(retiro);
    expect(within(resumen()).queryByText('Despacho')).not.toBeInTheDocument();
    expect(filaTotal()).toHaveTextContent('Total$25.980');
    expect(cotizadas).toEqual(['7']);

    expect(await pedidoEnviado(escrituras)).toEqual({
      claveIdempotencia: expect.any(String),
      tipoEntrega: 'retiro',
      tipoDocumento: 'boleta',
    });
  });

  it('E7-H1 FE · despacho a domicilio: usa la dirección principal y muestra el costo de envío', async () => {
    const { escrituras } = simularBackend();
    mostrar();

    await elegirDespacho();
    expect(
      await screen.findByText('Av. Providencia 1234 · Principal'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Depto. 501 · Providencia, Región Metropolitana'),
    ).toBeInTheDocument();
    // El costo con IVA que cotizó el backend, en la opción y en el resumen, con el total
    expect(
      await screen.findByRole('radio', {
        name: /despacho a domicilio.*\$3\.990/i,
      }),
    ).toBeChecked();
    expect(
      within(resumen()).getByText('Despacho').parentElement,
    ).toHaveTextContent('Despacho$3.990');
    expect(within(resumen()).getByText('$29.970')).toBeInTheDocument();
    expect(await botonPagar()).toBeEnabled();

    expect(await pedidoEnviado(escrituras)).toEqual({
      claveIdempotencia: expect.any(String),
      tipoEntrega: 'despacho',
      direccionId: 7,
      tipoDocumento: 'boleta',
    });
  });

  it('E7-H1 FE · despacho a domicilio: permite elegir otra dirección y la cotiza', async () => {
    const { cotizadas, escrituras } = simularBackend();
    mostrar();

    await elegirDespacho();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Cambiar dirección' }),
    );
    await userEvent.click(
      screen.getByRole('radio', { name: /los aromos 55/i }),
    );
    // Marcar no cotiza: se cotiza al usar la dirección
    expect(cotizadas).toEqual(['7']);
    await userEvent.click(
      screen.getByRole('button', { name: 'Usar esta dirección' }),
    );

    expect(await within(resumen()).findByText('$31.470')).toBeInTheDocument();
    expect(within(resumen()).getByText('$5.490')).toBeInTheDocument();
    expect(cotizadas).toEqual(['7', '9']);

    expect(await pedidoEnviado(escrituras)).toMatchObject({
      tipoEntrega: 'despacho',
      direccionId: 9,
    });
  });

  it('E7-H1 FE · despacho a domicilio: sin direcciones, pide agregar una y no deja pagar', async () => {
    const { cotizadas } = simularBackend({ direcciones: [] });
    mostrar();

    await elegirDespacho();
    expect(
      await screen.findByText(/agrega la dirección donde quieres recibir/i),
    ).toBeInTheDocument();
    expect(await botonPagar()).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Agregar dirección' }),
    );
    expect(
      await screen.findByRole('dialog', { name: 'Agregar dirección' }),
    ).toBeInTheDocument();
    expect(cotizadas).toEqual([]);
  });

  it('E7-H1 FE · despacho a domicilio: mientras cotiza no deja pagar, y si no se puede cotizar muestra el mensaje del backend', async () => {
    let responderCotizacion: (respuesta: Response) => void = () => undefined;
    simularBackend({
      cotizar: () =>
        new Promise<Response>((resolver) => (responderCotizacion = resolver)),
    });
    mostrar();

    await elegirDespacho();
    await waitFor(() => expect(resumen()).toHaveTextContent('Despacho'));
    expect(await botonPagar()).toBeDisabled();

    act(() =>
      responderCotizacion(
        responder(
          {
            statusCode: 409,
            message:
              'Chilexpress no tiene despacho disponible para esta dirección y este pedido. Puedes elegir retiro en tienda.',
          },
          409,
        ),
      ),
    );
    expect(
      await screen.findByText(/chilexpress no tiene despacho disponible/i),
    ).toBeInTheDocument();
    expect(await botonPagar()).toBeDisabled();
    // No queda como si siguiera cotizando
    expect(within(resumen()).getAllByText('Sin cotizar')).toHaveLength(2);
    expect(
      within(resumen()).queryByText('Cotizando el despacho'),
    ).not.toBeInTheDocument();
  });

  it('E7-H1 FE · despacho a domicilio: con el teclado, marca otra dirección sin cotizarla, la usa y vuelve a «Cambiar»', async () => {
    const { cotizadas } = simularBackend();
    mostrar();

    await elegirDespacho();
    const cambiar = await screen.findByRole('button', {
      name: 'Cambiar dirección',
    });
    cambiar.focus();
    await userEvent.keyboard('{Enter}');
    // Radix no mueve la selección con flechas en jsdom: se marca con espacio, también teclado
    screen.getByRole('radio', { name: /los aromos 55/i }).focus();
    await userEvent.keyboard(' ');
    // La lista sigue abierta con la otra dirección marcada
    expect(screen.getByRole('radio', { name: /los aromos 55/i })).toBeChecked();
    await userEvent.tab();
    expect(
      screen.getByRole('button', { name: 'Usar esta dirección' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(await screen.findByText('Los Aromos 55')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cambiar dirección' }),
    ).toHaveFocus();
    await waitFor(() => expect(cotizadas).toEqual(['7', '9']));
  });

  it('E7-H1 FE · despacho a domicilio: si fallan las direcciones, muestra el aviso sin detalles técnicos', async () => {
    simularBackend();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (peticion: Request) => {
        const ruta = `${peticion.method} ${new URL(peticion.url).pathname}`;
        if (ruta === 'GET /api/carrito') return responder(CARRITO);
        return responder({ statusCode: 500, message: 'TypeError: boom' }, 500);
      }),
    );
    mostrar();

    await elegirDespacho();
    expect(await screen.findByRole('alert')).not.toHaveTextContent('boom');
    expect(await botonPagar()).toBeDisabled();
  });
});
