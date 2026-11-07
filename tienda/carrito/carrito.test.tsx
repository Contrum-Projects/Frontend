import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { CarritoCuenta, LineaCarrito } from '@/compartido/api/respuestas';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { responder, simularBackend } from '@/tienda/cuenta/cuentaDePrueba';
import { CarritoHeader } from '@/tienda/diseno/carritoHeader';
import { Compra } from '@/tienda/ficha/compra';
import { cerrarPanelCarrito } from './estadoPanelCarrito';
import { PanelCarrito } from './panelCarrito';
import { PantallaCarrito } from './pantallaCarrito';

// El cliente con una base absoluta, para que `fetch` reciba un Request (como en misDatos.test)
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

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/productos/10',
}));
const toast = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

afterEach(() => {
  act(() => cerrarPanelCarrito());
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
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

const mostrar = (ui: ReactElement) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {ui}
    </QueryClientProvider>,
  );

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

const carrito = (
  items: LineaCarrito[],
  extra: Partial<CarritoCuenta> = {},
): CarritoCuenta => ({
  items,
  total: items.reduce((suma, item) => suma + (item.subtotal ?? 0), 0),
  puedeCrearPedido:
    items.length > 0 && items.every((item) => !item.impideCrearPedido),
  ...extra,
});

const resumen = () => screen.getByRole('region', { name: 'Resumen' });

describe('SCRUM-116 · Agregar desde la ficha', () => {
  it('E5-H1 FE · agregar y cambiar: «Agregar al carrito» envía el formato y la cantidad, y abre el panel del carrito', async () => {
    iniciarSesion();
    // Como el backend: después de agregar, el carrito trae la línea
    let agregado = false;
    const escrituras = simularBackend({
      'GET /api/carrito': () =>
        responder(carrito(agregado ? [linea({ cantidad: 2 })] : [])),
      'POST /api/carrito/items': () => {
        agregado = true;
        return responder(carrito([linea({ cantidad: 2 })]), 201);
      },
    });
    const persona = userEvent.setup();
    mostrar(
      <>
        <Compra
          articuloId={11}
          disponibilidad="disponible"
          articulo="Shampoo reparador 300 ml"
        />
        <PanelCarrito />
      </>,
    );

    await persona.click(
      screen.getByRole('button', { name: 'Agregar una unidad' }),
    );
    await persona.click(
      screen.getByRole('button', { name: /Agregar al carrito/ }),
    );

    const panel = await screen.findByRole('dialog', { name: 'Tu carrito' });
    expect(escrituras).toEqual([
      {
        peticion: 'POST /api/carrito/items',
        cuerpo: { articuloId: 11, cantidad: 2 },
      },
    ]);
    expect(
      within(panel).getByRole('list', { name: 'Productos del carrito' }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole('link', { name: 'Ver carrito' }),
    ).toHaveAttribute('href', '/carrito');
  });

  it('E5-H1 FE · agregar y cambiar: si el backend rechaza (stock), su mensaje queda bajo el botón', async () => {
    iniciarSesion();
    simularBackend({
      'POST /api/carrito/items': () =>
        responder(
          {
            statusCode: 400,
            message: 'No hay stock suficiente para esa cantidad.',
          },
          400,
        ),
    });
    const persona = userEvent.setup();
    mostrar(
      <Compra
        articuloId={11}
        disponibilidad="disponible"
        articulo="Shampoo reparador 300 ml"
      />,
    );

    await persona.click(
      screen.getByRole('button', { name: /Agregar al carrito/ }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay stock suficiente para esa cantidad.',
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});

describe('SCRUM-116 · Pantalla del carrito', () => {
  it('E5-H1 FE · agregar y cambiar: muestra las líneas, el total del backend con «IVA incluido» y continúa al checkout', async () => {
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () =>
        responder(
          carrito([
            linea(),
            linea({
              articuloId: 20,
              tipo: 'pack',
              nombre: 'Pack reparación',
              nombreFormato: null,
              cantidad: 1,
              precioUnitario: 24990,
              subtotal: 24990,
            }),
          ]),
        ),
    });
    mostrar(<PantallaCarrito />);

    await screen.findByRole('list', { name: 'Productos del carrito' });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tu carrito' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, elemento) =>
          elemento?.tagName === 'P' &&
          elemento.textContent === '2 productos · 3 unidades',
      ),
    ).toBeInTheDocument();
    const lineas = within(
      screen.getByRole('list', { name: 'Productos del carrito' }),
    ).getAllByRole('listitem');
    expect(lineas).toHaveLength(2);
    expect(within(lineas[0]).getByText('$12.990 c/u')).toBeInTheDocument();
    expect(within(lineas[0]).getByText('$25.980')).toBeInTheDocument();
    expect(
      within(resumen()).getByText('$50.970', { selector: 'dd.texto-precio' }),
    ).toBeInTheDocument();
    expect(within(resumen()).getByText('IVA incluido')).toBeInTheDocument();
    expect(
      within(resumen()).getByRole('link', { name: /Continuar con la compra/ }),
    ).toHaveAttribute('href', '/checkout');
  });

  it('E5-H1 FE · agregar y cambiar: cambiar la cantidad la envía y muestra los totales que devuelve el backend', async () => {
    iniciarSesion();
    const escrituras = simularBackend({
      'GET /api/carrito': () => responder(carrito([linea()])),
      'PATCH /api/carrito/items/11': () =>
        responder(carrito([linea({ cantidad: 3, subtotal: 38970 })])),
    });
    const persona = userEvent.setup();
    mostrar(<PantallaCarrito />);

    const cantidad = await screen.findByRole('group', {
      name: 'Cantidad de Shampoo reparador 300 ml',
    });
    await persona.click(
      within(cantidad).getByRole('button', { name: 'Agregar una unidad' }),
    );

    await waitFor(() =>
      expect(within(resumen()).getAllByText('$38.970')).toHaveLength(2),
    );
    expect(within(cantidad).getByText('3')).toBeInTheDocument();
    expect(escrituras).toEqual([
      { peticion: 'PATCH /api/carrito/items/11', cuerpo: { cantidad: 3 } },
    ]);
  });

  it('E5-H1 FE · agregar y cambiar: si el backend rechaza la cantidad, muestra su mensaje en la línea y vuelve a la guardada', async () => {
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () => responder(carrito([linea()])),
      'PATCH /api/carrito/items/11': () =>
        responder(
          {
            statusCode: 400,
            message: 'No hay stock suficiente para esa cantidad.',
          },
          400,
        ),
    });
    const persona = userEvent.setup();
    mostrar(<PantallaCarrito />);

    const cantidad = await screen.findByRole('group', {
      name: 'Cantidad de Shampoo reparador 300 ml',
    });
    await persona.click(
      within(cantidad).getByRole('button', { name: 'Agregar una unidad' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay stock suficiente para esa cantidad.',
    );
    expect(within(cantidad).getByText('2')).toBeInTheDocument();
  });

  it('E5-H1 FE · agregar y cambiar: quitar el último artículo deja el carrito vacío', async () => {
    iniciarSesion();
    const escrituras = simularBackend({
      'GET /api/carrito': () => responder(carrito([linea()])),
      'DELETE /api/carrito/items/11': () => responder(carrito([])),
    });
    const persona = userEvent.setup();
    mostrar(<PantallaCarrito />);

    await persona.click(
      await screen.findByRole('button', {
        name: 'Quitar Shampoo reparador 300 ml del carrito',
      }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      { peticion: 'DELETE /api/carrito/items/11', cuerpo: undefined },
    ]);
  });

  it('E5-H1 FE · artículo con problema: sin stock para la cantidad, la línea avisa y «Continuar con la compra» queda bloqueado', async () => {
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () =>
        responder(
          carrito([
            linea({ stockSuficiente: false, impideCrearPedido: true }),
            linea({
              articuloId: 12,
              nombre: 'Acondicionador',
              aLaVenta: false,
              precioUnitario: null,
              subtotal: null,
              stockSuficiente: null,
              impideCrearPedido: true,
            }),
          ]),
        ),
    });
    mostrar(<PantallaCarrito />);

    const lineas = within(
      await screen.findByRole('list', { name: 'Productos del carrito' }),
    ).getAllByRole('listitem');
    // El aviso se lee al llegar a los controles de la línea
    expect(
      within(lineas[0]).getByRole('group', { name: /Cantidad de/ }),
    ).toHaveAccessibleDescription(
      'No hay stock para esta cantidad. Baja la cantidad o quítalo del carrito.',
    );
    expect(
      within(lineas[1]).getByRole('button', { name: /Quitar/ }),
    ).toHaveAccessibleDescription(
      'Este producto ya no está disponible. Quítalo del carrito.',
    );
    // Lo que ya no se vende solo se puede quitar
    expect(within(lineas[1]).queryByRole('group')).not.toBeInTheDocument();
    expect(
      screen.getByText('Hay productos que debes ajustar para continuar.'),
    ).toBeInTheDocument();
    expect(
      within(resumen()).queryByRole('link', { name: /Continuar/ }),
    ).not.toBeInTheDocument();
    expect(
      within(resumen()).getByRole('button', {
        name: /Continuar con la compra/,
      }),
    ).toBeDisabled();
    expect(
      within(resumen()).getByText(
        'Ajusta los productos marcados para continuar.',
      ),
    ).toBeInTheDocument();
  });

  it('E5-H1 FE · carrito vacío: muestra el mensaje y el botón al catálogo', async () => {
    iniciarSesion();
    simularBackend({ 'GET /api/carrito': () => responder(carrito([])) });
    mostrar(<PantallaCarrito />);

    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Busca un producto o explora las categorías para empezar.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute(
      'href',
      '/catalogo',
    );
  });

  it('E5-H1 FE · un error del servidor no muestra detalles y ofrece reintentar', async () => {
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () =>
        responder({ statusCode: 500, message: 'PrismaClientError' }, 500),
    });
    mostrar(<PantallaCarrito />);

    expect(
      await screen.findByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
  });

  it('E5-H1 FE · el personal de tienda no tiene carrito: ve un aviso y no se pide a la API', () => {
    iniciarSesion('vendedor');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    mostrar(<PantallaCarrito />);

    expect(
      screen.getByText('No tienes permiso para hacer esto.'),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('SCRUM-116 · Contador del header', () => {
  it('E5-H1 FE · agregar y cambiar: el header muestra las unidades del carrito de la cuenta', async () => {
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () =>
        responder(
          carrito([
            linea({ cantidad: 2 }),
            linea({ articuloId: 12, cantidad: 3 }),
          ]),
        ),
    });
    mostrar(<CarritoHeader />);

    expect(
      await screen.findByRole('link', { name: 'Carrito, 5 unidades' }),
    ).toHaveAttribute('href', '/carrito');
  });

  it('E5-H1 FE · carrito vacío: el header muestra solo el ícono', async () => {
    iniciarSesion();
    simularBackend({ 'GET /api/carrito': () => responder(carrito([])) });
    mostrar(<CarritoHeader />);

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Carrito' })).toBeInTheDocument(),
    );
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

describe('SCRUM-119 · Sin mínimo de unidades para el peluquero (SCRUM-146)', () => {
  it('E5-H4 FE · sin mínimo: el peluquero agrega 1 unidad desde la ficha', async () => {
    iniciarSesion('profesional');
    const escrituras = simularBackend({
      'GET /api/carrito': () => responder(carrito([])),
      'POST /api/carrito/items': () =>
        responder(carrito([linea({ cantidad: 1 })]), 201),
    });
    const persona = userEvent.setup();
    mostrar(
      <>
        <Compra
          articuloId={11}
          disponibilidad="disponible"
          articulo="Shampoo reparador 300 ml"
        />
        <PanelCarrito />
      </>,
    );

    expect(screen.queryByText(/mínimo/)).not.toBeInTheDocument();
    await persona.click(
      screen.getByRole('button', { name: 'Agregar al carrito' }),
    );

    expect(
      await screen.findByRole('dialog', { name: 'Tu carrito' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      {
        peticion: 'POST /api/carrito/items',
        cuerpo: { articuloId: 11, cantidad: 1 },
      },
    ]);
  });

  it('E5-H4 FE · sin mínimo: con 1 unidad, la línea del peluquero no lleva aviso y «Continuar con la compra» está habilitado', async () => {
    iniciarSesion('profesional');
    simularBackend({
      'GET /api/carrito': () =>
        responder(
          carrito([
            linea({ cantidad: 1, precioUnitario: 8490, subtotal: 8490 }),
          ]),
        ),
    });
    mostrar(<PantallaCarrito />);

    const [unica] = within(
      await screen.findByRole('list', { name: 'Productos del carrito' }),
    ).getAllByRole('listitem');
    expect(
      within(unica).getByRole('group', { name: /Cantidad de/ }),
    ).not.toHaveAccessibleDescription();
    expect(within(unica).getByText(/precio profesional/)).toBeInTheDocument();
    expect(
      screen.queryByText('Hay productos que debes ajustar para continuar.'),
    ).not.toBeInTheDocument();
    expect(
      within(resumen()).getByRole('link', { name: /Continuar con la compra/ }),
    ).toBeInTheDocument();
  });
});

describe('Panel lateral del carrito', () => {
  it('el ícono del header abre el panel con las líneas, el total del backend y los botones', async () => {
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () => responder(carrito([linea({ cantidad: 2 })])),
    });
    const persona = userEvent.setup();
    mostrar(
      <>
        <CarritoHeader />
        <PanelCarrito />
      </>,
    );

    await persona.click(await screen.findByRole('link', { name: /Carrito/ }));

    const panel = await screen.findByRole('dialog', { name: 'Tu carrito' });
    expect(
      await within(panel).findByRole('list', { name: 'Productos del carrito' }),
    ).toBeInTheDocument();
    expect(within(panel).getByText('2 unidades')).toBeInTheDocument();
    expect(
      within(panel).getByRole('link', { name: /Continuar con la compra/ }),
    ).toHaveAttribute('href', '/checkout');
    // La navegación del panel no salió de la página
    expect(push).not.toHaveBeenCalled();
  });

  it('sin productos, el panel lo dice y ofrece el catálogo', async () => {
    iniciarSesion();
    simularBackend({ 'GET /api/carrito': () => responder(carrito([])) });
    const persona = userEvent.setup();
    mostrar(
      <>
        <CarritoHeader />
        <PanelCarrito />
      </>,
    );

    await persona.click(screen.getByRole('link', { name: 'Carrito' }));

    const panel = await screen.findByRole('dialog', { name: 'Tu carrito' });
    expect(
      await within(panel).findByText('Tu carrito está vacío'),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole('link', { name: 'Ver catálogo' }),
    ).toHaveAttribute('href', '/catalogo');
  });
});
