import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { CarritoCuenta, LineaCarrito } from '@/compartido/api/respuestas';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { responder, simularBackend } from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaCheckout } from './pantallaCheckout';

// El cliente con una base absoluta, para que `fetch` reciba un Request (como en carrito.test)
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

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/checkout',
}));
const navegacion = vi.hoisted(() => ({ irAUrlExterna: vi.fn() }));
vi.mock('./navegacion', () => navegacion);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
});

const URL_PAGO = 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=1';

const linea = (extra: Partial<LineaCarrito> = {}): LineaCarrito => ({
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
  ...extra,
});

const CARRITO: CarritoCuenta = {
  items: [
    linea(),
    linea({
      articuloId: 12,
      nombre: 'Acondicionador hidratante',
      cantidad: 1,
      precioUnitario: 11990,
      subtotal: 11990,
    }),
  ],
  total: 37970,
  puedeCrearPedido: true,
};

const PEDIDO = { codigoPublico: 'K7M2Q9XA4BCD' };

const iniciarSesion = (rol: Rol = 'cliente') =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Camila',
        apellido: 'Rojas',
        rol,
      },
    }),
  );

const mostrar = () => {
  const clienteConsultas = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={clienteConsultas}>
      <PantallaCheckout />
    </QueryClientProvider>,
  );
  return { clienteConsultas };
};

const botonPagar = () =>
  screen.findByRole('button', { name: /pagar con mercado pago/i });

describe('Pantalla de checkout (SCRUM-118)', () => {
  it('E5-H3 FE · resumen: muestra la entrega, el documento, el total con IVA y la reserva de 15 minutos', async () => {
    simularBackend({ 'GET /api/carrito': () => responder(CARRITO) });
    iniciarSesion();
    mostrar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Finalizar compra' }),
    ).toBeInTheDocument();
    const entrega = await screen.findByRole('region', {
      name: /cómo quieres recibirlo/i,
    });
    expect(
      within(entrega).getByRole('radio', { name: /retiro en tienda/i }),
    ).toBeChecked();
    const documento = screen.getByRole('region', { name: /documento/i });
    expect(
      within(documento).getByText(/comprobante electrónico de pago/i),
    ).toBeInTheDocument();

    const resumen = screen.getByRole('region', { name: 'Tu pedido' });
    const productos = within(resumen).getByRole('list', {
      name: 'Productos del pedido',
    });
    expect(
      within(productos).getByRole('listitem', { name: 'Shampoo reparador' }),
    ).toHaveTextContent('300 ml · 2 unidades$25.980');
    // El total es el que entrega el backend, con IVA
    expect(within(resumen).getAllByText('$37.970')).toHaveLength(2);
    expect(within(resumen).getByText('Productos (3)')).toBeInTheDocument();
    expect(within(resumen).getByText('IVA incluido')).toBeInTheDocument();
    expect(
      within(resumen).getByText(/reservamos tus productos por 15 minutos/i),
    ).toBeInTheDocument();
  });

  it('E5-H3 FE · E6-H1 FE · ir a pagar: deshabilita el botón mientras se envía y lleva al pago en Mercado Pago', async () => {
    let soltarPedido: () => void = () => undefined;
    const escrituras: { ruta: string; cuerpo: unknown }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (peticion: Request) => {
        const ruta = `${peticion.method} ${new URL(peticion.url).pathname}`;
        const texto = await peticion.text();
        if (peticion.method !== 'GET') {
          escrituras.push({ ruta, cuerpo: texto ? JSON.parse(texto) : null });
        }
        if (ruta === 'GET /api/carrito') return responder(CARRITO);
        if (ruta === 'POST /api/pedidos') {
          await new Promise<void>((resolver) => (soltarPedido = resolver));
          return responder(PEDIDO, 201);
        }
        if (ruta === `POST /api/pedidos/${PEDIDO.codigoPublico}/pago`) {
          return responder({
            urlPago: URL_PAGO,
            pagarHasta: '2026-11-02T15:15:00Z',
          });
        }
        return responder({ message: 'No existe.' }, 404);
      }),
    );
    iniciarSesion();
    mostrar();

    const boton = await botonPagar();
    await userEvent.click(boton);
    await waitFor(() => expect(boton).toBeDisabled());
    // Un segundo clic mientras se envía no crea otro pedido
    await userEvent.click(boton);

    act(() => soltarPedido());
    await waitFor(() =>
      expect(navegacion.irAUrlExterna).toHaveBeenCalledWith(URL_PAGO),
    );
    expect(boton).toBeDisabled();
    expect(escrituras.map((e) => e.ruta)).toEqual([
      'POST /api/pedidos',
      `POST /api/pedidos/${PEDIDO.codigoPublico}/pago`,
    ]);
    // Sin precios: el backend recalcula todo
    expect(escrituras[0]?.cuerpo).toEqual({
      claveIdempotencia: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
      tipoEntrega: 'retiro',
      tipoDocumento: 'boleta',
    });
  });

  it('E5-H3 FE · confirmar: si falla ir al pago, conserva el resumen y reintenta solo el pago del mismo pedido', async () => {
    let pedidoCreado = false;
    let intentosPago = 0;
    const escrituras = simularBackend({
      // Al crear el pedido el backend vacía el carrito
      'GET /api/carrito': () =>
        responder(
          pedidoCreado
            ? { items: [], total: 0, puedeCrearPedido: false }
            : CARRITO,
        ),
      'POST /api/pedidos': () => {
        pedidoCreado = true;
        return responder(PEDIDO, 201);
      },
      [`POST /api/pedidos/${PEDIDO.codigoPublico}/pago`]: () =>
        ++intentosPago === 1
          ? responder(
              { message: 'Error interno: timeout de Mercado Pago' },
              503,
            )
          : responder({
              urlPago: URL_PAGO,
              pagarHasta: '2026-11-02T15:15:00Z',
            }),
    });
    iniciarSesion();
    const { clienteConsultas } = mostrar();

    await userEvent.click(await botonPagar());
    // Un 5xx no muestra detalles técnicos
    expect(
      await screen.findByText(/no pudimos completar la acción/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/timeout/i)).not.toBeInTheDocument();

    // Aunque el carrito ya venga vacío, se sigue viendo lo que se confirmó
    await act(() => clienteConsultas.refetchQueries());
    expect(
      screen.getByRole('listitem', { name: 'Shampoo reparador' }),
    ).toBeInTheDocument();

    await userEvent.click(await botonPagar());
    await waitFor(() =>
      expect(navegacion.irAUrlExterna).toHaveBeenCalledWith(URL_PAGO),
    );
    expect(escrituras.map((e) => e.peticion)).toEqual([
      'POST /api/pedidos',
      `POST /api/pedidos/${PEDIDO.codigoPublico}/pago`,
      `POST /api/pedidos/${PEDIDO.codigoPublico}/pago`,
    ]);
  });

  it('E5-H3 FE · confirmar: no abre una URL de pago fuera de Mercado Pago', async () => {
    simularBackend({
      'GET /api/carrito': () => responder(CARRITO),
      'POST /api/pedidos': () => responder(PEDIDO, 201),
      [`POST /api/pedidos/${PEDIDO.codigoPublico}/pago`]: () =>
        responder({
          urlPago: 'https://mercadopago.cl.otro-sitio.com/pagar',
          pagarHasta: '2026-11-02T15:15:00Z',
        }),
    });
    iniciarSesion();
    mostrar();

    await userEvent.click(await botonPagar());
    expect(
      await screen.findByText(/no pudimos completar la acción/i),
    ).toBeInTheDocument();
    expect(navegacion.irAUrlExterna).not.toHaveBeenCalled();
  });

  it('E5-H3 FE · errores: sin stock, indica el artículo y lleva al carrito', async () => {
    simularBackend({
      'GET /api/carrito': () => responder(CARRITO),
      'POST /api/pedidos': () =>
        responder(
          {
            statusCode: 409,
            message: 'No hay stock suficiente de Shampoo reparador 300 ml.',
          },
          409,
        ),
    });
    iniciarSesion();
    mostrar();

    await userEvent.click(await botonPagar());
    expect(
      await screen.findByText(
        'No hay stock suficiente de Shampoo reparador 300 ml.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /volver al carrito/i }),
    ).toHaveAttribute('href', '/carrito');
    expect(navegacion.irAUrlExterna).not.toHaveBeenCalled();
    expect(await botonPagar()).toBeEnabled();
  });

  it('E5-H3 FE · errores: correo sin confirmar, pide confirmarlo', async () => {
    simularBackend({
      'GET /api/carrito': () => responder(CARRITO),
      'POST /api/pedidos': () =>
        responder(
          {
            statusCode: 403,
            message: 'Debes confirmar tu correo antes de comprar.',
          },
          403,
        ),
    });
    iniciarSesion();
    mostrar();

    await userEvent.click(await botonPagar());
    expect(
      await screen.findByText('Debes confirmar tu correo antes de comprar.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /volver al carrito/i }),
    ).not.toBeInTheDocument();
    expect(navegacion.irAUrlExterna).not.toHaveBeenCalled();
  });

  it('E5-H3 FE · resumen: con productos que ajustar, no deja pagar y lleva al carrito', async () => {
    simularBackend({
      'GET /api/carrito': () =>
        responder({
          ...CARRITO,
          items: [linea({ stockSuficiente: false, impideCrearPedido: true })],
          puedeCrearPedido: false,
        }),
    });
    iniciarSesion();
    mostrar();

    expect(
      await screen.findByText(
        'Hay productos que debes ajustar para continuar.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /volver al carrito/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /pagar con mercado pago/i }),
    ).not.toBeInTheDocument();
  });

  it('E5-H3 FE · resumen: con el carrito vacío, no muestra el pago', async () => {
    simularBackend({
      'GET /api/carrito': () =>
        responder({ items: [], total: 0, puedeCrearPedido: false }),
    });
    iniciarSesion();
    mostrar();

    expect(
      await screen.findByRole('heading', { name: /tu carrito está vacío/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /pagar con mercado pago/i }),
    ).not.toBeInTheDocument();
  });

  it('E5-H3 FE · resumen: si falla cargar el carrito, muestra el aviso sin detalles técnicos y permite reintentar', async () => {
    let intentos = 0;
    simularBackend({
      'GET /api/carrito': () =>
        ++intentos === 1
          ? responder({ message: 'TypeError: prisma' }, 500)
          : responder(CARRITO),
    });
    iniciarSesion();
    mostrar();

    expect(
      await screen.findByText(/no pudimos completar la acción/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/prisma/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await botonPagar()).toBeEnabled();
  });

  it('E5-H3 FE · sin sesión, lleva a ingresar y de vuelta al checkout', async () => {
    simularBackend({});
    act(() => olvidarSesion());
    mostrar();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/ingresar?volver=%2Fcheckout'),
    );
  });

  it('E5-H3 FE · el personal de tienda no puede comprar', async () => {
    const escrituras = simularBackend({});
    iniciarSesion('administrador');
    mostrar();

    expect(
      await screen.findByText('No tienes permiso para hacer esto.'),
    ).toBeInTheDocument();
    expect(escrituras).toHaveLength(0);
  });
});
