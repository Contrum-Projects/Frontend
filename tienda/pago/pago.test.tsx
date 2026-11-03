import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
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
import {
  DATOS,
  responder,
  simularBackend,
} from '@/tienda/cuenta/cuentaDePrueba';
import { INTERVALO_SEGUIMIENTO_MS, leerPagoId } from './consultasPago';
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
  vi.useRealTimers();
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
const MIS_DATOS = 'GET /api/cuentas/yo';

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
    // SCRUM-121 · Pudo haber un cargo: no ofrece pagar de nuevo
    expect(
      screen.queryByRole('button', { name: /intentar de nuevo/i }),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Ver mis pedidos' }),
    ).toHaveAttribute('href', '/cuenta/pedidos');
  });
});

const pagado = (extra: Partial<DetallePedidoCuenta> = {}) =>
  pedido({
    estado: 'pagado',
    pagarHasta: null,
    tipoEntrega: 'despacho',
    montos: { neto: 24345, iva: 4625, total: 28970 },
    items: [
      {
        articuloId: 11,
        tipo: 'formato',
        nombre: 'Shampoo reparador',
        nombreFormato: '300 ml',
        imagen: null,
        cantidad: 1,
        precioUnitario: 12990,
        subtotal: 12990,
      },
      {
        articuloId: 12,
        tipo: 'formato',
        nombre: 'Acondicionador hidratante',
        nombreFormato: '300 ml',
        imagen: null,
        cantidad: 1,
        precioUnitario: 11990,
        subtotal: 11990,
      },
    ],
    envio: {
      servicio: 'Chilexpress',
      costo: 3990,
      estado: 'pendiente',
      codigoSeguimiento: null,
      fechaEstimada: null,
      destinatario: 'Camila Rojas',
      telefonoContacto: null,
      calle: 'Irarrázaval',
      numero: '1000',
      referencia: null,
      comuna: { codigoCut: '13120', nombre: 'Ñuñoa' },
    },
    ...extra,
  });

const tituloAprobado = () =>
  screen.findByRole('heading', { level: 1, name: 'Recibimos tu pago' });
const tituloPendiente = () =>
  screen.findByRole('heading', {
    level: 1,
    name: 'Estamos confirmando tu pago',
  });
const tituloCancelado = () =>
  screen.findByRole('heading', { level: 1, name: 'Tu pedido se canceló' });

/** Avanza el reloj simulado lo que tarda una lectura del seguimiento. */
const esperarSeguimiento = (veces = 1) =>
  act(() => vi.advanceTimersByTimeAsync(INTERVALO_SEGUIMIENTO_MS * veces));

describe('Resultado del pago (SCRUM-121)', () => {
  it('E6-H2 FE · pago aprobado: muestra el resumen del pedido y que la confirmación llega al correo', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'aprobado', pedido: pagado() }),
      [MIS_DATOS]: () => responder(DATOS),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    expect(await tituloAprobado()).toHaveFocus();
    expect(
      await screen.findByText(
        `Pedido ${CODIGO} · Te enviamos la confirmación a camila@correo.cl`,
      ),
    ).toBeInTheDocument();
    const productos = screen.getByRole('list', {
      name: 'Productos del pedido',
    });
    expect(within(productos).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(productos).getByRole('listitem', { name: 'Shampoo reparador' }),
    ).toHaveTextContent('300 ml · 1 unidad$12.990');
    // Montos del backend, sin calcular nada
    expect(screen.getByText('Despacho a Ñuñoa').nextSibling).toHaveTextContent(
      '$3.990',
    );
    expect(screen.getByText('Total pagado').nextSibling).toHaveTextContent(
      '$28.970',
    );
    expect(
      screen.getByText(
        'Te avisaremos por correo cuando tu pedido salga a despacho.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi pedido' })).toHaveAttribute(
      'href',
      `/cuenta/pedidos/${CODIGO}`,
    );
    expect(
      screen.getByRole('link', { name: 'Seguir comprando' }),
    ).toHaveAttribute('href', '/catalogo');
    expect(replace).not.toHaveBeenCalled();
  });

  it('E6-H2 FE · pago aprobado con retiro en tienda: sin despacho y avisa cuando esté listo para retiro', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({
          estadoPago: 'aprobado',
          // Sin líneas (caso borde): solo el total
          pedido: pagado({ tipoEntrega: 'retiro', envio: null, items: [] }),
        }),
      // Sin el correo de la cuenta, la frase igual, sin la dirección
      [MIS_DATOS]: () => responder({ message: 'Error' }, 500),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloAprobado();
    expect(
      screen.getByText(
        `Pedido ${CODIGO} · Te enviamos la confirmación a tu correo`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/despacho a/i)).toBeNull();
    expect(
      screen.queryByRole('list', { name: 'Productos del pedido' }),
    ).toBeNull();
    expect(screen.getByText('Total pagado').nextSibling).toHaveTextContent(
      '$28.970',
    );
    expect(
      screen.getByText(
        'Te avisaremos por correo cuando tu pedido esté listo para retiro.',
      ),
    ).toBeInTheDocument();
  });

  it('E6-H2 FE · pago pendiente: muestra el estado pendiente, sin ofrecer pagar de nuevo', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'pendiente', pedido: pedido() }),
      [PEDIDO_GET]: () => responder(pedido()),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    expect(await tituloPendiente()).toHaveFocus();
    expect(
      screen.getByText(
        `Aún no se confirma el pago del pedido ${CODIGO}. Esta pantalla se actualiza sola cuando llegue.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /intentar de nuevo/i }),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Ver mis pedidos' }),
    ).toHaveAttribute('href', '/cuenta/pedidos');
  });

  it('E6-H2 FE · pago pendiente: la pantalla se actualiza al llegar la confirmación', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let confirmado = false;
    let lecturas = 0;
    const escrituras = simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'pendiente', pedido: pedido() }),
      [PEDIDO_GET]: () => {
        lecturas += 1;
        return responder(confirmado ? pagado() : pedido());
      },
      [MIS_DATOS]: () => responder(DATOS),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloPendiente();
    await esperarSeguimiento();
    // Aún sin confirmar: lo releyó y sigue pendiente
    await waitFor(() => expect(lecturas).toBe(1));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Estamos confirmando tu pago',
    );

    confirmado = true;
    await esperarSeguimiento();

    expect(await tituloAprobado()).toHaveFocus();
    expect(screen.getByText('Total pagado').nextSibling).toHaveTextContent(
      '$28.970',
    );
    // Confirmar el pago se pide una sola vez: después solo se lee el pedido
    expect(escrituras.map((e) => e.peticion)).toEqual([CONFIRMAR]);
    expect(replace).not.toHaveBeenCalled();

    // Ya confirmado, deja de leer el pedido
    await esperarSeguimiento(3);
    expect(lecturas).toBe(2);
  });

  it('E6-H2 FE · pago pendiente: si leer el pedido falla, deja de insistir y permite reintentar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let lecturas = 0;
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'pendiente', pedido: pedido() }),
      [PEDIDO_GET]: () => {
        lecturas += 1;
        return responder({ message: 'Error' }, 500);
      },
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloPendiente();
    // La lectura y sus dos reintentos (una falla pasajera no detiene el seguimiento)
    await esperarSeguimiento(2);

    // Un 5xx no muestra detalles: el mensaje genérico
    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(lecturas).toBe(3);
    // Ya no promete actualizarse sola
    expect(screen.queryByText(/se actualiza sola/i)).toBeNull();
    await esperarSeguimiento(3);
    expect(lecturas).toBe(3);

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(lecturas).toBeGreaterThan(3));
  });

  it('E6-H2 FE · pago pendiente: si el plazo vence mientras espera, informa la cancelación', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let vencido = false;
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ estadoPago: 'pendiente', pedido: pedido() }),
      [PEDIDO_GET]: () =>
        responder(
          vencido
            ? pedido({ estado: 'cancelado', pagarHasta: null })
            : pedido(),
        ),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloPendiente();
    vencido = true;
    await esperarSeguimiento();

    expect(await tituloCancelado()).toHaveFocus();
  });

  it('E6-H2 FE · pedido vencido: al abrir el pedido, la pantalla informa la cancelación', async () => {
    simularBackend({
      [PEDIDO_GET]: () =>
        responder(pedido({ estado: 'cancelado', pagarHasta: null })),
    });
    iniciarSesion();
    mostrar();

    expect(await tituloCancelado()).toHaveFocus();
    expect(
      screen.getByText(
        `El pedido ${CODIGO} se canceló. Si aún quieres los productos, puedes volver a comprarlos.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir al catálogo' }),
    ).toHaveAttribute('href', '/catalogo');
    expect(
      screen.getByRole('link', { name: 'Ver mis pedidos' }),
    ).toHaveAttribute('href', '/cuenta/pedidos');
    expect(
      screen.queryByRole('button', { name: /intentar de nuevo/i }),
    ).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('E6-H2 FE · pedido vencido: si el backend responde 409 al confirmar, lee el pedido e informa la cancelación', async () => {
    simularBackend({
      [CONFIRMAR]: () =>
        responder({ message: 'El pedido fue cancelado.' }, 409),
      [PEDIDO_GET]: () =>
        responder(pedido({ estado: 'cancelado', pagarHasta: null })),
    });
    iniciarSesion();
    mostrar('payment_id=1234567890');

    await tituloCancelado();
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
