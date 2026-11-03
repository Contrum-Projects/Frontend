import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { responder, simularBackend } from '@/tienda/cuenta/cuentaDePrueba';
import { leerPagoId } from './consultasPago';
import { PantallaRegresoPago } from './pantallaRegresoPago';

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

const ruta = vi.hoisted(() => ({ consulta: '' }));
const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/pedidos/K7M2Q9XA4BCD/pago',
  useSearchParams: () => new URLSearchParams(ruta.consulta),
}));
const navegacion = vi.hoisted(() => ({ irAUrlExterna: vi.fn() }));
vi.mock('@/tienda/checkout/navegacion', () => navegacion);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
  ruta.consulta = '';
});

const CODIGO = 'K7M2Q9XA4BCD';
const URL_PAGO = 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=2';
const CONFIRMAR = `POST /api/pedidos/${CODIGO}/pago/confirmar`;
const PAGAR = `POST /api/pedidos/${CODIGO}/pago`;
const PEDIDO_GET = `GET /api/pedidos/${CODIGO}`;

const pedido = (
  extra: Partial<DetallePedidoCuenta> = {},
): DetallePedidoCuenta => ({
  codigoPublico: CODIGO,
  fechaPedido: '2026-11-03T13:14:00Z',
  estado: 'pendiente_pago',
  // 10:29 en Chile
  pagarHasta: '2026-11-03T13:29:00Z',
  tipoEntrega: 'retiro',
  tipoDocumento: 'boleta',
  porcentajeIva: 19,
  montos: { neto: 21008, iva: 3992, total: 25000 },
  items: [],
  envio: null,
  documento: null,
  idTransaccionPago: null,
  historial: [{ estado: 'pendiente_pago', fecha: '2026-11-03T13:14:00Z' }],
  ...extra,
});

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

const mostrar = (consulta = '') => {
  ruta.consulta = consulta;
  const clienteConsultas = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={clienteConsultas}>
      <PantallaRegresoPago codigo={CODIGO} />
    </QueryClientProvider>,
  );
};

const tituloNoCompletado = () =>
  screen.findByRole('heading', { level: 1, name: 'El pago no se completó' });

describe('Regreso desde Mercado Pago (SCRUM-120)', () => {
  it('E6-H1 FE · pago rechazado: confirma el pago con el backend y muestra el aviso y la hora límite de la reserva', async () => {
    const escrituras = simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'rechazado', pedido: pedido() }),
    });
    iniciarSesion();
    // El `status` de la URL no se usa: el resultado lo da el backend
    mostrar(
      'payment_id=1234567890&status=approved&external_reference=K7M2Q9XA4BCD',
    );

    expect(await tituloNoCompletado()).toHaveFocus();
    expect(
      screen.getByText(
        /mercado pago no aprobó el pago del pedido K7M2Q9XA4BCD/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tus productos siguen reservados hasta las/i),
    ).toHaveTextContent('Tus productos siguen reservados hasta las 10:29.');
    expect(escrituras).toEqual([
      { peticion: CONFIRMAR, cuerpo: { pagoId: '1234567890' } },
    ]);
    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByRole('link', { name: 'Seguir comprando' }),
    ).toHaveAttribute('href', '/catalogo');
  });

  it('E6-H1 FE · pago rechazado: «Intentar de nuevo» pide otra vez el cobro del mismo pedido y lleva a Mercado Pago', async () => {
    let soltarCobro: () => void = () => undefined;
    const escrituras = simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'rechazado', pedido: pedido() }),
    });
    // El cobro tarda: el botón queda deshabilitado mientras tanto
    const fetchBase = globalThis.fetch;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (peticion: Request) => {
        if (`${peticion.method} ${new URL(peticion.url).pathname}` === PAGAR) {
          await new Promise<void>((resolver) => (soltarCobro = resolver));
          return responder({
            urlPago: URL_PAGO,
            pagarHasta: '2026-11-03T13:29:00Z',
          });
        }
        return fetchBase(peticion);
      }),
    );
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloNoCompletado();
    const boton = screen.getByRole('button', { name: /intentar de nuevo/i });
    await userEvent.click(boton);
    await waitFor(() => expect(boton).toBeDisabled());
    await userEvent.click(boton);
    act(() => soltarCobro());

    await waitFor(() =>
      expect(navegacion.irAUrlExterna).toHaveBeenCalledWith(URL_PAGO),
    );
    expect(navegacion.irAUrlExterna).toHaveBeenCalledTimes(1);
    expect(escrituras.map((e) => e.peticion)).toEqual([CONFIRMAR]);
  });

  it('E6-H1 FE · pago rechazado: si el reintento falla, muestra el mensaje del backend y no sale de la tienda', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'rechazado', pedido: pedido() }),
      [PAGAR]: () =>
        responder(
          {
            message:
              'No pudimos conectar con Mercado Pago. Intenta de nuevo en unos minutos.',
          },
          503,
        ),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloNoCompletado();
    await userEvent.click(
      screen.getByRole('button', { name: /intentar de nuevo/i }),
    );

    // Un 5xx no muestra detalles: el mensaje genérico
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
    expect(navegacion.irAUrlExterna).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /intentar de nuevo/i }),
    ).toBeEnabled();
  });

  it('E6-H1 FE · pago rechazado: una URL de pago fuera de Mercado Pago no se abre', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'rechazado', pedido: pedido() }),
      [PAGAR]: () =>
        responder({
          urlPago: 'https://otro.cl/pagar',
          pagarHasta: '2026-11-03T13:29:00Z',
        }),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloNoCompletado();
    await userEvent.click(
      screen.getByRole('button', { name: /intentar de nuevo/i }),
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(navegacion.irAUrlExterna).not.toHaveBeenCalled();
  });

  it('E6-H1 FE · volver sin pagar: lee el pedido y, si sigue pendiente, muestra el aviso con la reserva', async () => {
    const escrituras = simularBackend({
      [PEDIDO_GET]: () => responder(pedido()),
    });
    iniciarSesion();
    // Mercado Pago devuelve «null» cuando el comprador vuelve sin pagar
    mostrar('payment_id=null&status=null');

    await tituloNoCompletado();
    // No hubo un pago rechazado: no dice que Mercado Pago no lo aprobó
    expect(
      screen.getByText(`El pago del pedido ${CODIGO} no se completó.`),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no se hizo ningún cargo/i)).toBeNull();
    expect(screen.getByRole('note')).toHaveTextContent(
      'Tus productos siguen reservados hasta las 10:29.',
    );
    expect(escrituras).toEqual([]);
  });

  it('E6-H1 FE · pedido ya pagado: al abrir el pago lleva al detalle del pedido', async () => {
    const escrituras = simularBackend({
      [PEDIDO_GET]: () =>
        responder(pedido({ estado: 'pagado', pagarHasta: null })),
    });
    iniciarSesion();
    mostrar();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/cuenta/pedidos/${CODIGO}`),
    );
    expect(
      screen.queryByRole('button', { name: /intentar de nuevo/i }),
    ).toBeNull();
    expect(escrituras).toEqual([]);
  });

  it('E6-H1 FE · pedido ya pagado: si el backend responde 409 al confirmar, lee el pedido y lleva al detalle', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ message: 'Este pedido ya está pagado.' }, 409),
      [PEDIDO_GET]: () =>
        responder(pedido({ estado: 'pagado', pagarHasta: null })),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/cuenta/pedidos/${CODIGO}`),
    );
  });

  it('E6-H1 FE · pago aprobado al volver: lleva al detalle del pedido', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({
          estadoPago: 'aprobado',
          pedido: pedido({ estado: 'pagado', pagarHasta: null }),
        }),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/cuenta/pedidos/${CODIGO}`),
    );
  });

  it('E6-H1 FE · pedido ya pagado: si al reintentar el backend dice que ya no se puede pagar, relee el pedido', async () => {
    let pagado = false;
    simularBackend({
      [PEDIDO_GET]: () =>
        responder(
          pagado ? pedido({ estado: 'pagado', pagarHasta: null }) : pedido(),
        ),
      [PAGAR]: () => {
        pagado = true;
        return responder({ message: 'Este pedido ya está pagado.' }, 409);
      },
    });
    iniciarSesion();
    mostrar();

    await tituloNoCompletado();
    await userEvent.click(
      screen.getByRole('button', { name: /intentar de nuevo/i }),
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/cuenta/pedidos/${CODIGO}`),
    );
  });

  it('E6-H1 FE · sin sesión: lleva a ingresar y vuelve con el mismo id de pago', async () => {
    simularBackend({});
    act(() => olvidarSesion());
    mostrar('payment_id=1234567890&status=rejected');

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/ingresar?volver=${encodeURIComponent(`/pedidos/${CODIGO}/pago?payment_id=1234567890`)}`,
      ),
    );
  });

  it('E6-H1 FE · error al leer el pedido: muestra el mensaje del backend', async () => {
    simularBackend({
      [PEDIDO_GET]: () => responder({ message: 'El pedido no existe.' }, 404),
    });
    iniciarSesion();
    mostrar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El pedido no existe.',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Resultado del pago' }),
    ).toBeInTheDocument();
  });

  it('E6-H1 FE · pago que no corresponde al pedido: muestra el mensaje del backend y no dice que no hubo cargo', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder(
          { message: 'El pago indicado no corresponde a este pedido.' },
          400,
        ),
      [PEDIDO_GET]: () => responder(pedido()),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloNoCompletado();
    expect(
      screen.getByText('El pago indicado no corresponde a este pedido.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no se hizo ningún cargo/i)).toBeNull();
  });
});

describe('leerPagoId()', () => {
  it('acepta solo ids numéricos de Mercado Pago', () => {
    expect(leerPagoId(new URLSearchParams('payment_id=123'))).toBe('123');
    expect(leerPagoId(new URLSearchParams('collection_id=456'))).toBe('456');
    expect(leerPagoId(new URLSearchParams('payment_id=null'))).toBeNull();
    expect(leerPagoId(new URLSearchParams('payment_id=1;DROP'))).toBeNull();
    expect(leerPagoId(new URLSearchParams(''))).toBeNull();
  });
});
