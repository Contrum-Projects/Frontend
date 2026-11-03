import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CarritoCuenta,
  DatosFacturacionCuenta,
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

const facturacion = (
  extra: Partial<DatosFacturacionCuenta> = {},
): DatosFacturacionCuenta => ({
  id: 3,
  rut: '76086429-3',
  razonSocial: 'Peluquería Los Aromos SpA',
  giro: 'Peluquería',
  direccion: 'Los Aromos 55',
  correoFacturacion: null,
  comuna: {
    codigoCut: '13123',
    nombre: 'Providencia',
    region: { codigoCut: '13', nombre: 'Metropolitana de Santiago' },
  },
  ...extra,
});

const DATOS = [
  facturacion(),
  facturacion({
    id: 5,
    rut: '77123456-9',
    razonSocial: 'Salón Concepción Ltda.',
    giro: 'Venta de cosméticos',
    comuna: {
      codigoCut: '08101',
      nombre: 'Concepción',
      region: { codigoCut: '08', nombre: 'Biobío' },
    },
  }),
];

const REGIONES = [{ codigoCut: '13', nombre: 'Metropolitana de Santiago' }];
const COMUNAS = [
  { codigoCut: '13120', nombre: 'Ñuñoa' },
  { codigoCut: '13123', nombre: 'Providencia' },
];

/** Los datos que crea el backend desde el checkout (id 8). */
const DATOS_NUEVOS = facturacion({
  id: 8,
  rut: '76123456-0',
  razonSocial: 'Estudio Capilar SpA',
  giro: 'Servicios de peluquería',
  direccion: 'Irarrázaval 3200',
  comuna: {
    codigoCut: '13120',
    nombre: 'Ñuñoa',
    region: { codigoCut: '13', nombre: 'Metropolitana de Santiago' },
  },
});

/** El backend con los datos de facturación; registra las lecturas y las escrituras. */
const simularBackend = ({
  datos = DATOS,
  rechazarPedido = false,
  fallasLectura = 0,
}: {
  /** Cuántas veces falla (500) la lectura de los datos de facturación antes de responder. */
  fallasLectura?: number;
  datos?: DatosFacturacionCuenta[];
  /** El pedido responde 409 y el segundo registro ya no está (se eliminó en otra pestaña). */
  rechazarPedido?: boolean;
} = {}) => {
  const lecturas: string[] = [];
  const escrituras: { ruta: string; cuerpo: unknown }[] = [];
  let lista = datos;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const url = new URL(peticion.url);
      const ruta = `${peticion.method} ${url.pathname}`;
      const texto = await peticion.text();
      if (peticion.method === 'GET') lecturas.push(ruta);
      else escrituras.push({ ruta, cuerpo: texto ? JSON.parse(texto) : null });
      if (ruta === 'GET /api/carrito') return responder(CARRITO);
      if (ruta === 'GET /api/cuentas/yo/direcciones') return responder([]);
      if (ruta === 'GET /api/cuentas/yo/facturacion') {
        if (fallasLectura-- > 0) return responder({ message: 'Error' }, 500);
        return responder(lista);
      }
      if (ruta === 'POST /api/cuentas/yo/facturacion') {
        lista = [...lista, DATOS_NUEVOS];
        return responder(DATOS_NUEVOS, 201);
      }
      const edicion = /^PATCH \/api\/cuentas\/yo\/facturacion\/(\d+)$/.exec(
        ruta,
      );
      if (edicion) {
        const editado = {
          ...lista.find((registro) => String(registro.id) === edicion[1]),
          ...(texto ? JSON.parse(texto) : {}),
        } as DatosFacturacionCuenta;
        lista = lista.map((registro) =>
          registro.id === editado.id ? editado : registro,
        );
        return responder(editado);
      }
      if (ruta === 'GET /api/territorio/regiones') return responder(REGIONES);
      if (ruta === 'GET /api/territorio/regiones/13/comunas') {
        return responder(COMUNAS);
      }
      if (ruta === 'POST /api/pedidos' && rechazarPedido) {
        lista = lista.slice(0, 1);
        return responder(
          { message: 'Los datos de facturación no están disponibles.' },
          409,
        );
      }
      if (ruta === 'POST /api/pedidos') return responder(PEDIDO, 201);
      if (ruta === `POST /api/pedidos/${PEDIDO.codigoPublico}/pago`) {
        return responder({
          urlPago: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=1',
          pagarHasta: '2026-11-03T15:15:00Z',
        });
      }
      return responder({ message: 'No existe.' }, 404);
    }),
  );
  return { lecturas, escrituras };
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

const seccionDocumento = () =>
  screen.findByRole('region', { name: '2. Documento' });
const interruptor = async () =>
  within(await seccionDocumento()).getByRole('switch', {
    name: 'Necesito factura',
  });
const botonPagar = () =>
  screen.findByRole('button', { name: /pagar con mercado pago/i });
/** El cuerpo enviado a `POST /api/pedidos`. */
const pedidoEnviado = async (
  escrituras: { ruta: string; cuerpo: unknown }[],
) => {
  await userEvent.click(await botonPagar());
  await waitFor(() =>
    expect(escrituras.some((e) => e.ruta === 'POST /api/pedidos')).toBe(true),
  );
  return escrituras.find((e) => e.ruta === 'POST /api/pedidos')?.cuerpo;
};

const elegirOpcion = async (
  contenedor: HTMLElement,
  campo: RegExp,
  opcion: string,
) => {
  await userEvent.click(
    await within(contenedor).findByRole('combobox', { name: campo }),
  );
  await userEvent.click(await screen.findByRole('option', { name: opcion }));
};

describe('Interruptor «Necesito factura» en el checkout (SCRUM-125)', () => {
  it('E9-H1 FE · comprobante por defecto: informa el comprobante electrónico de pago y lo pide sin datos de facturación', async () => {
    const { lecturas, escrituras } = simularBackend();
    mostrar();

    const factura = await interruptor();
    expect(factura).not.toBeChecked();
    expect(factura).toHaveAccessibleDescription(
      'Si no, recibes el comprobante electrónico de pago en tu correo.',
    );
    // Sin pedir factura no se piden los datos de facturación
    expect(await pedidoEnviado(escrituras)).toEqual({
      claveIdempotencia: expect.any(String),
      tipoEntrega: 'retiro',
      tipoDocumento: 'boleta',
    });
    expect(lecturas).not.toContain('GET /api/cuentas/yo/facturacion');
  });

  it('E9-H1 FE · con datos guardados: los muestra para elegir cuál usar y envía el elegido', async () => {
    const { escrituras } = simularBackend();
    mostrar();

    await userEvent.click(await interruptor());
    expect(await interruptor()).toHaveAccessibleDescription(
      'Con los datos de facturación de tu cuenta.',
    );
    const lista = await screen.findByRole('group', {
      name: 'Datos de facturación',
    });
    // El primero de la lista (el orden del backend) queda elegido
    expect(
      within(lista).getByRole('radio', { name: /Peluquería Los Aromos SpA/ }),
    ).toBeChecked();
    expect(
      within(lista).getByText(
        'RUT 76.086.429-3 · Giro: Peluquería · Providencia',
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      within(lista).getByRole('radio', { name: /Salón Concepción Ltda\./ }),
    );
    expect(await pedidoEnviado(escrituras)).toEqual({
      claveIdempotencia: expect.any(String),
      tipoEntrega: 'retiro',
      tipoDocumento: 'factura',
      datosFacturacionId: 5,
    });
  });

  it('E9-H1 FE · con datos guardados: «Editar» abre los datos en un diálogo y los guarda sin salir del checkout', async () => {
    const { escrituras } = simularBackend();
    mostrar();

    await userEvent.click(await interruptor());
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Editar Salón Concepción Ltda.',
      }),
    );
    const dialogo = await screen.findByRole('dialog', {
      name: 'Editar datos de facturación',
    });
    const giro = within(dialogo).getByRole('textbox', { name: /Giro/ });
    expect(giro).toHaveValue('Venta de cosméticos');
    await userEvent.clear(giro);
    await userEvent.type(giro, 'Peluquería');
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(escrituras[0]).toMatchObject({
      ruta: 'PATCH /api/cuentas/yo/facturacion/5',
      cuerpo: { giro: 'Peluquería' },
    });
    // Los datos editados quedan elegidos
    expect(
      await screen.findByRole('radio', { name: /Salón Concepción Ltda\./ }),
    ).toBeChecked();
  });

  it('E9-H1 FE · sin datos: pide registrarlos antes de seguir y, al guardarlos, quedan elegidos', async () => {
    const { escrituras } = simularBackend({ datos: [] });
    mostrar();

    await userEvent.click(await interruptor());
    expect(
      await screen.findByText(
        'Debes registrar tus datos de facturación antes de pedir factura.',
      ),
    ).toBeInTheDocument();
    expect(await botonPagar()).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Agregar datos de facturación' }),
    );
    const dialogo = await screen.findByRole('dialog', {
      name: 'Agregar datos de facturación',
    });
    await userEvent.type(
      within(dialogo).getByRole('textbox', { name: /RUT/ }),
      '76.123.456-0',
    );
    await userEvent.type(
      within(dialogo).getByRole('textbox', { name: /Razón social/ }),
      'Estudio Capilar SpA',
    );
    await userEvent.type(
      within(dialogo).getByRole('textbox', { name: /Giro/ }),
      'Servicios de peluquería',
    );
    await userEvent.type(
      within(dialogo).getByRole('textbox', { name: /Dirección/ }),
      'Irarrázaval 3200',
    );
    await elegirOpcion(dialogo, /Región/, 'Metropolitana de Santiago');
    await elegirOpcion(dialogo, /Comuna/, 'Ñuñoa');
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(escrituras[0]).toMatchObject({
      ruta: 'POST /api/cuentas/yo/facturacion',
      cuerpo: { rut: '76123456-0', comuna: '13120' },
    });
    expect(
      await screen.findByRole('radio', { name: /Estudio Capilar SpA/ }),
    ).toBeChecked();
    expect(await botonPagar()).toBeEnabled();
    expect(await pedidoEnviado(escrituras)).toMatchObject({
      tipoDocumento: 'factura',
      datosFacturacionId: 8,
    });
  });

  it('E9-H1 FE · al apagar el interruptor vuelve al comprobante electrónico de pago', async () => {
    const { escrituras } = simularBackend({ datos: [] });
    mostrar();

    await userEvent.click(await interruptor());
    expect(await botonPagar()).toBeDisabled();
    await userEvent.click(await interruptor());
    expect(
      screen.queryByText(/debes registrar tus datos de facturación/i),
    ).not.toBeInTheDocument();
    expect(await pedidoEnviado(escrituras)).toMatchObject({
      tipoDocumento: 'boleta',
    });
  });

  it('E9-H1 FE · con datos guardados: si los elegidos ya no están, no elige otros en silencio y no deja pagar', async () => {
    const { escrituras } = simularBackend({ rechazarPedido: true });
    mostrar();

    await userEvent.click(await interruptor());
    await userEvent.click(
      await screen.findByRole('radio', { name: /Salón Concepción Ltda\./ }),
    );
    await pedidoEnviado(escrituras);

    // Tras el 409 se vuelven a pedir los datos: queda solo el primero, sin marcar
    await waitFor(() =>
      expect(
        screen.queryByRole('radio', { name: /Salón Concepción Ltda\./ }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('radio', { name: /Peluquería Los Aromos SpA/ }),
    ).not.toBeChecked();
    expect(await botonPagar()).toBeDisabled();
  });

  it('E9-H1 FE · si fallan los datos de facturación, muestra el aviso sin detalles técnicos y permite reintentar', async () => {
    simularBackend({ fallasLectura: 1 });
    mostrar();

    await userEvent.click(await interruptor());
    expect(
      await screen.findByRole('button', { name: 'Reintentar' }),
    ).toBeVisible();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
    expect(await botonPagar()).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(
      await screen.findByRole('radio', { name: /Peluquería Los Aromos SpA/ }),
    ).toBeChecked();
    expect(await botonPagar()).toBeEnabled();
  });
});
