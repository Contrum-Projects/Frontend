import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  DetallePedidoCuenta,
  EnvioPedido,
  HistorialPedidos,
  ResumenPedido,
} from '@/compartido/api/respuestas';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  mostrarPantallaCuenta,
  responder,
  simularBackend,
} from '@/tienda/cuenta/cuentaDePrueba';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { nombreDeArchivo, paginaSiguiente } from './consultasPedidos';
import { PantallaDetallePedido } from './pantallaDetallePedido';
import { PantallaMisPedidos } from './pantallaMisPedidos';

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
  usePathname: () => '/cuenta/pedidos',
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
});

const LISTA = 'GET /api/pedidos';

const resumen = (
  codigoPublico: string,
  extra: Partial<ResumenPedido> = {},
): ResumenPedido => ({
  codigoPublico,
  // 10 oct 2026, 14:32 en Chile
  fechaPedido: '2026-10-10T17:32:00Z',
  total: 28970,
  estado: 'despachado',
  ...extra,
});

const historial = (
  items: ResumenPedido[],
  extra: Partial<HistorialPedidos> = {},
): HistorialPedidos => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
  ...extra,
});

const CODIGO = 'K7M2Q9XA4BCD';

const ENVIO: EnvioPedido = {
  servicio: 'Chilexpress',
  costo: 3990,
  estado: 'en_transito',
  codigoSeguimiento: '7891234560',
  fechaEstimada: null,
  destinatario: 'Camila Rojas',
  telefonoContacto: null,
  calle: 'Av. Ejemplo',
  numero: '1234',
  referencia: 'depto. 56',
  comuna: { codigoCut: '13120', nombre: 'Ñuñoa' },
};

const detalle = (
  extra: Partial<DetallePedidoCuenta> = {},
): DetallePedidoCuenta => ({
  codigoPublico: CODIGO,
  fechaPedido: '2026-10-10T17:20:00Z',
  estado: 'despachado',
  pagarHasta: null,
  tipoEntrega: 'despacho',
  tipoDocumento: 'boleta',
  porcentajeIva: 19,
  montos: { neto: 24345, iva: 4625, total: 28970, descuento: 0 },
  cupon: null,
  items: [
    {
      articuloId: 7,
      tipo: 'formato',
      nombre: 'Shampoo reparador',
      nombreFormato: '300 ml',
      imagen: null,
      cantidad: 1,
      precioUnitario: 12990,
      subtotal: 12990,
    },
    {
      articuloId: 9,
      tipo: 'formato',
      nombre: 'Acondicionador hidratante',
      nombreFormato: '300 ml',
      imagen: null,
      cantidad: 2,
      precioUnitario: 5995,
      subtotal: 11990,
    },
  ],
  envio: ENVIO,
  documento: null,
  idTransaccionPago: '1234567890',
  historial: [
    { estado: 'pendiente_pago', fecha: '2026-10-10T17:20:00Z' },
    { estado: 'pagado', fecha: '2026-10-10T17:32:00Z' },
    { estado: 'en_preparacion', fecha: '2026-10-11T12:10:00Z' },
    { estado: 'despachado', fecha: '2026-10-11T20:05:00Z' },
  ],
  ...extra,
});

describe('Mis pedidos (SCRUM-129)', () => {
  it('E8-H1 FE · listado: muestra fecha, total y estado de cada pedido, con enlace a su detalle', async () => {
    simularBackend({
      [LISTA]: () =>
        responder(
          historial([
            resumen('CP10482AAAAA'),
            resumen('CP10198BBBBB', {
              fechaPedido: '2026-08-30T15:00:00Z',
              total: 12990,
              estado: 'cancelado',
            }),
          ]),
        ),
    });
    mostrarPantallaCuenta(<PantallaMisPedidos />);

    const lista = await screen.findByRole('list', { name: 'Pedidos' });
    const [primero, segundo] = within(lista).getAllByRole('link');
    expect(primero).toHaveTextContent('Pedido CP10482AAAAA');
    expect(primero).toHaveTextContent('10 oct 2026');
    expect(primero).toHaveTextContent('Despachado');
    expect(primero).toHaveTextContent('$28.970');
    expect(primero).toHaveAttribute('href', '/cuenta/pedidos/CP10482AAAAA');
    expect(segundo).toHaveTextContent('30 ago 2026');
    expect(segundo).toHaveTextContent('Cancelado');
    expect(segundo).toHaveTextContent('$12.990');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mis pedidos' }),
    ).toBeInTheDocument();
  });

  it('E8-H1 FE · listado: «Cargar más pedidos» trae la página siguiente sin perder la actual', async () => {
    let paginas = 0;
    simularBackend({
      [LISTA]: () => {
        paginas += 1;
        return paginas === 1
          ? responder(
              historial([resumen('PRIMEROAAAAA')], { total: 2, limite: 1 }),
            )
          : responder(
              historial([resumen('SEGUNDOBBBBB')], {
                total: 2,
                limite: 1,
                pagina: 2,
              }),
            );
      },
    });
    mostrarPantallaCuenta(<PantallaMisPedidos />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cargar más pedidos' }),
    );

    expect(await screen.findByText('Pedido SEGUNDOBBBBB')).toBeInTheDocument();
    expect(screen.getByText('Pedido PRIMEROAAAAA')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cargar más pedidos' }),
    ).not.toBeInTheDocument();
  });

  it('E8-H1 FE · listado: si falla «Cargar más», conserva los pedidos ya leídos y ofrece reintentar', async () => {
    let paginas = 0;
    simularBackend({
      [LISTA]: () => {
        paginas += 1;
        return paginas === 1
          ? responder(
              historial([resumen('PRIMEROAAAAA')], { total: 2, limite: 1 }),
            )
          : responder({ statusCode: 503, message: 'detalle interno' }, 503);
      },
    });
    mostrarPantallaCuenta(<PantallaMisPedidos />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cargar más pedidos' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pedido PRIMEROAAAAA')).toBeInTheDocument();
    expect(screen.queryByText('detalle interno')).not.toBeInTheDocument();
  });

  it('E8-H1 FE · listado: con todos los pedidos leídos no hay página siguiente', () => {
    expect(paginaSiguiente(historial([], { total: 40, pagina: 2 }))).toBe(
      undefined,
    );
    expect(paginaSiguiente(historial([], { total: 41, pagina: 2 }))).toBe(3);
  });

  it('E8-H1 FE · sin pedidos: muestra el mensaje y el botón al catálogo', async () => {
    simularBackend({ [LISTA]: () => responder(historial([])) });
    mostrarPantallaCuenta(<PantallaMisPedidos />);

    expect(
      await screen.findByRole('heading', { name: 'Aún no tienes pedidos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir al catálogo' }),
    ).toHaveAttribute('href', RUTAS.catalogo);
  });

  it('E8-H1 FE · listado: si el backend falla, muestra un mensaje sin detalles técnicos y «Reintentar»', async () => {
    simularBackend({
      [LISTA]: () =>
        responder({ statusCode: 500, message: 'Prisma P2024 timeout' }, 500),
    });
    mostrarPantallaCuenta(<PantallaMisPedidos />);

    expect(
      await screen.findByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
  });
});

describe('Detalle del pedido (SCRUM-129)', () => {
  const PEDIDO = `GET /api/pedidos/${CODIGO}`;

  it('E8-H1 FE · detalle: muestra artículos, montos, entrega y el historial de estados con fechas', async () => {
    simularBackend({ [PEDIDO]: () => responder(detalle()) });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: `Pedido ${CODIGO}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('10 de octubre de 2026')).toBeInTheDocument();

    // Historial, del primero al último, con fecha y hora de Chile
    const pasos = within(
      screen.getByRole('region', { name: 'Historial del pedido' }),
    ).getAllByRole('listitem');
    expect(pasos.map((paso) => paso.textContent)).toEqual([
      'Pendiente de pago10 oct, 14:20',
      'Pagado10 oct, 14:32',
      'En preparación11 oct, 09:10',
      'Despachado11 oct, 17:05',
    ]);

    // Entrega y pago
    const envio = screen.getByRole('region', { name: 'Envío' });
    expect(envio).toHaveTextContent('Chilexpress');
    expect(envio).toHaveTextContent('Av. Ejemplo 1234, depto. 56, Ñuñoa');
    expect(screen.getByRole('region', { name: 'Pago' })).toHaveTextContent(
      'Pagado el 10 oct, 14:32',
    );

    // Artículos y montos, como los entrega el backend
    const productos = screen.getByRole('list', {
      name: 'Productos del pedido',
    });
    expect(within(productos).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(productos).getByRole('listitem', {
        name: 'Acondicionador hidratante',
      }),
    ).toHaveTextContent('300 ml · 2 unidades$11.990');
    const montos = screen.getByRole('region', { name: 'Productos' });
    expect(montos).toHaveTextContent('Despacho$3.990');
    expect(montos).toHaveTextContent('Total$28.970');
  });

  it('SCRUM-150 · detalle: con cupón muestra su código y lo descontado, que entrega el backend', async () => {
    simularBackend({
      [PEDIDO]: () =>
        responder(
          detalle({
            montos: { neto: 20983, iva: 3987, total: 24970, descuento: 4000 },
            cupon: 'LOREAL20',
          }),
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(await screen.findByText('Cupón LOREAL20')).toBeInTheDocument();
    expect(screen.getByText('−$4.000')).toBeInTheDocument();
    expect(screen.getByText('$24.970')).toBeInTheDocument();
  });

  it('E8-H1 FE · detalle: un retiro en tienda sin pagar no muestra despacho ni fecha de pago', async () => {
    simularBackend({
      [PEDIDO]: () =>
        responder(
          detalle({
            estado: 'pendiente_pago',
            tipoEntrega: 'retiro',
            envio: null,
            idTransaccionPago: null,
            historial: [
              { estado: 'pendiente_pago', fecha: '2026-10-10T17:20:00Z' },
            ],
          }),
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(
      await screen.findByRole('region', { name: 'Entrega' }),
    ).toHaveTextContent('Retiro en tienda');
    expect(
      screen.queryByRole('region', { name: 'Pago' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Despacho')).not.toBeInTheDocument();
    expect(screen.getAllByText('Pendiente de pago')).toHaveLength(2);
  });

  it('E8-H3 FE · cliente: en un pedido pendiente de pago no ve opción de cancelar', async () => {
    simularBackend({
      [PEDIDO]: () =>
        responder(
          detalle({
            estado: 'pendiente_pago',
            idTransaccionPago: null,
            historial: [
              { estado: 'pendiente_pago', fecha: '2026-10-10T17:20:00Z' },
            ],
          }),
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: `Pedido ${CODIGO}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cancelar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /cancelar/i }),
    ).not.toBeInTheDocument();
  });

  it('E7-H3 FE · envío registrado: muestra el servicio, el código de seguimiento y el estado del envío', async () => {
    simularBackend({ [PEDIDO]: () => responder(detalle()) });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    const envio = await screen.findByRole('region', { name: 'Envío' });
    expect(envio).toHaveTextContent('Chilexpress');
    // Escritorio: el código en su línea; celular: junto al servicio (jsdom no aplica el CSS)
    expect(envio).toHaveTextContent('Código de seguimiento: 7891234560');
    expect(envio).toHaveTextContent('Chilexpress · Código 7891234560');
    expect(envio).toHaveTextContent('Estado del envío: En tránsito');
    expect(envio).toHaveTextContent('Av. Ejemplo 1234, depto. 56, Ñuñoa');
  });

  it('E7-H3 FE · envío registrado: cada estado del envío se muestra con su nombre', async () => {
    simularBackend({
      [PEDIDO]: () =>
        responder(
          detalle({
            estado: 'entregado',
            envio: { ...ENVIO, estado: 'con_problema' },
          }),
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(
      await screen.findByRole('region', { name: 'Envío' }),
    ).toHaveTextContent('Estado del envío: Con problema');
  });

  it('E7-H3 FE · sin despachar: sin código, la tarjeta muestra solo el servicio y la dirección', async () => {
    simularBackend({
      [PEDIDO]: () =>
        responder(
          detalle({
            estado: 'en_preparacion',
            envio: {
              ...ENVIO,
              estado: 'pendiente',
              codigoSeguimiento: null,
            },
          }),
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    const envio = await screen.findByRole('region', { name: 'Envío' });
    expect(envio).toHaveTextContent('Chilexpress');
    expect(envio).toHaveTextContent('Av. Ejemplo 1234, depto. 56, Ñuñoa');
    expect(envio).not.toHaveTextContent('Código');
    expect(envio).not.toHaveTextContent('Estado del envío');
  });

  it('E7-H3 FE · estado actualizado: al volver a abrir el detalle se ve el estado más reciente', async () => {
    let estadoEnvio = 'en_transito';
    simularBackend({
      [PEDIDO]: () =>
        responder(detalle({ envio: { ...ENVIO, estado: estadoEnvio } })),
    });
    // La misma caché que en el navegador, donde las consultas duran 30 s
    const cliente = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
    });
    const primera = mostrarPantallaCuenta(
      <PantallaDetallePedido codigo={CODIGO} />,
      cliente,
    );
    expect(
      await screen.findByText('Estado del envío: En tránsito'),
    ).toBeInTheDocument();
    primera.unmount();

    // Chilexpress informa que va en reparto y el cliente vuelve al detalle
    estadoEnvio = 'en_reparto';
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />, cliente);

    expect(
      await screen.findByText('Estado del envío: En reparto'),
    ).toBeInTheDocument();
  });

  it('E8-H1 FE · pedido de otra cuenta: la pantalla indica que no existe', async () => {
    // El backend responde 404 igual si no existe o si es de otra cuenta
    simularBackend({
      [PEDIDO]: () =>
        responder({ statusCode: 404, message: 'El pedido no existe.' }, 404),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'No encontramos este pedido',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir a Mis pedidos' }),
    ).toHaveAttribute('href', RUTAS.misPedidos);
    expect(screen.queryByText(CODIGO)).not.toBeInTheDocument();
  });

  it('E8-H1 FE · código con otro formato: indica que no existe sin consultar al backend', async () => {
    simularBackend({});
    mostrarPantallaCuenta(<PantallaDetallePedido codigo=".." />);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'No encontramos este pedido',
      }),
    ).toBeInTheDocument();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([entrada]) =>
          new URL((entrada as Request).url).pathname.startsWith('/api/pedidos'),
        ),
    ).toBe(false);
  });

  it('E8-H1 FE · detalle: si el backend falla, muestra un mensaje sin detalles técnicos y «Reintentar»', async () => {
    simularBackend({
      [`GET /api/pedidos/${CODIGO}`]: () =>
        responder(
          { statusCode: 403, message: 'Esta sección es para clientes.' },
          403,
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    expect(
      await screen.findByText('Esta sección es para clientes.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: `Pedido ${CODIGO}` }),
    ).toBeInTheDocument();
  });
});

describe('Documento del pedido (SCRUM-128)', () => {
  const PEDIDO = `GET /api/pedidos/${CODIGO}`;
  const DOCUMENTO = `GET /api/pedidos/${CODIGO}/documento`;

  const conFactura = (estado: 'pendiente' | 'disponible') =>
    detalle({
      tipoDocumento: 'factura',
      idTransaccionPago: null,
      documento:
        estado === 'disponible'
          ? { tipo: 'factura', estado, folio: 4521, fechaEmision: '2026-10-12' }
          : { tipo: 'factura', estado, folio: null, fechaEmision: null },
    });

  /** jsdom no descarga: se espía el enlace temporal que arma la descarga. */
  const espiarDescarga = () => {
    const crearUrl = vi.fn(() => 'blob:tienda.test/factura');
    // jsdom no implementa createObjectURL: se asigna en cada prueba que descarga
    URL.createObjectURL = crearUrl;
    URL.revokeObjectURL = vi.fn();
    const pulsar = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    return { crearUrl, pulsar };
  };

  it('E9-H4 FE · disponible: al pulsar descargar pide el PDF y se descarga el archivo', async () => {
    const { crearUrl, pulsar } = espiarDescarga();
    simularBackend({
      [PEDIDO]: () => responder(conFactura('disponible')),
      [DOCUMENTO]: () =>
        new Response(new Blob(['%PDF-1.7'], { type: 'application/pdf' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="factura-4521.pdf"',
          },
        }),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    const documento = await screen.findByRole('region', { name: 'Documento' });
    expect(documento).toHaveTextContent('Factura n.º 4521');
    await userEvent.click(
      within(documento).getByRole('button', { name: 'Descargar PDF' }),
    );

    await vi.waitFor(() => expect(pulsar).toHaveBeenCalledOnce());
    const enlace = pulsar.mock.contexts[0] as HTMLAnchorElement;
    expect(enlace.download).toBe('factura-4521.pdf');
    expect(enlace.href).toBe('blob:tienda.test/factura');
    expect(crearUrl).toHaveBeenCalledWith(expect.any(Blob));
    // La descarga lleva el token: pasa por el cliente de la API
    const peticion = vi
      .mocked(fetch)
      .mock.calls.map(([entrada]) => entrada as Request)
      .find((entrada) => entrada.url.endsWith('/documento'));
    expect(peticion?.headers.get('Authorization')).toBe('Bearer token');
  });

  it('E9-H4 FE · pendiente: indica que el documento está pendiente y no ofrece la descarga', async () => {
    simularBackend({ [PEDIDO]: () => responder(conFactura('pendiente')) });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    const documento = await screen.findByRole('region', { name: 'Documento' });
    expect(documento).toHaveTextContent('Factura');
    expect(documento).toHaveTextContent(
      'Pendiente: la descargas aquí cuando esté lista.',
    );
    expect(
      within(documento).queryByRole('button', { name: /Descargar/ }),
    ).not.toBeInTheDocument();
  });

  it('E9-H4 FE · disponible: si la descarga falla, muestra el mensaje del backend y deja reintentar', async () => {
    espiarDescarga();
    simularBackend({
      [PEDIDO]: () => responder(conFactura('disponible')),
      [DOCUMENTO]: () =>
        responder(
          {
            statusCode: 404,
            message: 'El documento del pedido aún no está disponible.',
          },
          404,
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    const documento = await screen.findByRole('region', { name: 'Documento' });
    await userEvent.click(
      within(documento).getByRole('button', { name: 'Descargar PDF' }),
    );

    expect(await within(documento).findByRole('alert')).toHaveTextContent(
      'El documento del pedido aún no está disponible.',
    );
    expect(
      within(documento).getByRole('button', { name: 'Descargar PDF' }),
    ).toBeEnabled();
  });

  it('E9-H4 FE · boleta: muestra el comprobante con el n.º de operación de Mercado Pago, sin descarga', async () => {
    simularBackend({ [PEDIDO]: () => responder(detalle()) });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    const documento = await screen.findByRole('region', { name: 'Documento' });
    expect(documento).toHaveTextContent('Comprobante de pago');
    expect(documento).toHaveTextContent(
      'N.º de operación de Mercado Pago: 1234567890',
    );
    expect(
      within(documento).queryByRole('button', { name: /Descargar/ }),
    ).not.toBeInTheDocument();
  });

  it('E9-H4 FE · sin documento: un pedido sin pagar con boleta no muestra la tarjeta', async () => {
    simularBackend({
      [PEDIDO]: () =>
        responder(
          detalle({ estado: 'pendiente_pago', idTransaccionPago: null }),
        ),
    });
    mostrarPantallaCuenta(<PantallaDetallePedido codigo={CODIGO} />);

    await screen.findByRole('region', { name: 'Envío' });
    expect(
      screen.queryByRole('region', { name: 'Documento' }),
    ).not.toBeInTheDocument();
  });
});

describe('Nombre del archivo descargado (SCRUM-128)', () => {
  it('E9-H4 FE · disponible: usa el nombre del backend solo si es un PDF simple', () => {
    const porDefecto = 'factura-K7M2Q9XA4BCD.pdf';
    expect(
      nombreDeArchivo('attachment; filename="factura-4521.pdf"', porDefecto),
    ).toBe('factura-4521.pdf');
    expect(
      nombreDeArchivo('attachment; filename="pagina.html"', porDefecto),
    ).toBe(porDefecto);
    expect(
      nombreDeArchivo(
        "attachment; filename*=UTF-8''factura-4521.pdf",
        porDefecto,
      ),
    ).toBe(porDefecto);
    expect(nombreDeArchivo(null, porDefecto)).toBe(porDefecto);
  });
});
