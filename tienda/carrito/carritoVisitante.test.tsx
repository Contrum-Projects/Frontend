import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CarritoCuenta,
  CarritoUnido,
  LineaCarrito,
} from '@/compartido/api/respuestas';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { responder, simularBackend } from '@/tienda/cuenta/cuentaDePrueba';
import { CarritoHeader } from '@/tienda/diseno/carritoHeader';
import { Compra } from '@/tienda/ficha/compra';
import { textosDeAjustes } from './avisoUnion';
import { reiniciarCarritoNavegadorParaPruebas } from './carritoNavegador';
import { PantallaCarrito } from './pantallaCarrito';
import { UnionCarrito } from './unionCarrito';

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

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/productos/10',
}));
const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  dismiss: vi.fn(),
}));
vi.mock('sonner', () => ({ toast }));
const { abrirPanelCarrito } = vi.hoisted(() => ({
  abrirPanelCarrito: vi.fn(),
}));
vi.mock('./estadoPanelCarrito', async (original) => ({
  ...(await original<typeof import('./estadoPanelCarrito')>()),
  abrirPanelCarrito,
}));

const CLAVE = 'cp:carrito';

beforeEach(() => {
  window.localStorage.clear();
  reiniciarCarritoNavegadorParaPruebas();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
});

const sinSesion = () => act(() => olvidarSesion());

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

/** Lo que el visitante dejó en el navegador en una visita anterior. */
const guardarEnNavegador = (
  articulos: { articuloId: number; cantidad: number }[],
) =>
  window.localStorage.setItem(CLAVE, JSON.stringify({ version: 1, articulos }));

const leerNavegador = (): unknown => {
  const texto = window.localStorage.getItem(CLAVE);
  return texto ? (JSON.parse(texto) as { articulos: unknown }).articulos : [];
};

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

const carrito = (items: LineaCarrito[]): CarritoCuenta => ({
  items,
  total: items.reduce((suma, item) => suma + (item.subtotal ?? 0), 0),
  puedeCrearPedido:
    items.length > 0 && items.every((item) => !item.impideCrearPedido),
});

const resumen = () => screen.getByRole('region', { name: 'Resumen' });

describe('SCRUM-117 · Carrito del visitante en el navegador', () => {
  it('E5-H2 FE · sin sesión: lo agregado desde la ficha sigue en el carrito al volver a abrir el navegador', async () => {
    sinSesion();
    const escrituras = simularBackend({
      'POST /api/carrito/cotizar': () => responder(carrito([linea()])),
    });
    const persona = userEvent.setup();
    const ficha = mostrar(
      <Compra
        articuloId={11}
        disponibilidad="disponible"
        articulo="Shampoo reparador 300 ml"
      />,
    );

    await persona.click(
      screen.getByRole('button', { name: 'Agregar una unidad' }),
    );
    await persona.click(
      screen.getByRole('button', { name: /Agregar al carrito/ }),
    );

    // Agregar abre el panel lateral (decisión del 7 nov 2026), no lleva a otra página
    expect(abrirPanelCarrito).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(escrituras).toEqual([]);

    // Se cierra el navegador: no queda nada en memoria, solo lo guardado
    ficha.unmount();
    reiniciarCarritoNavegadorParaPruebas();
    mostrar(<PantallaCarrito />);

    expect(
      await screen.findByRole('heading', { name: 'Shampoo reparador' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      {
        peticion: 'POST /api/carrito/cotizar',
        cuerpo: { articulos: [{ articuloId: 11, cantidad: 2 }] },
      },
    ]);
    expect(within(resumen()).getByText('IVA incluido')).toBeInTheDocument();
    expect(
      within(resumen()).getByRole('link', { name: /Continuar con la compra/ }),
    ).toHaveAttribute('href', '/ingresar?volver=%2Fcarrito');
  });

  it('E5-H2 FE · sin sesión: agregar otra vez el mismo formato suma las unidades en el navegador', async () => {
    sinSesion();
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
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

    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 3 }]);
  });

  it('E5-H2 FE · sin sesión: con 50 artículos distintos no agrega otro y lo dice bajo el botón', async () => {
    sinSesion();
    guardarEnNavegador(
      Array.from({ length: 50 }, (_, i) => ({
        articuloId: i + 100,
        cantidad: 1,
      })),
    );
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

    expect(screen.getByRole('alert')).toHaveTextContent(
      'El carrito tiene hasta 50 artículos distintos.',
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('E5-H2 FE · sin sesión: cambiar la cantidad la guarda en el navegador y vuelve a cotizar', async () => {
    sinSesion();
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    const escrituras = simularBackend({
      'POST /api/carrito/cotizar': (cuerpo) => {
        const [{ cantidad }] = (cuerpo as { articulos: { cantidad: number }[] })
          .articulos;
        return responder(
          carrito([linea({ cantidad, subtotal: 12990 * cantidad })]),
        );
      },
    });
    const persona = userEvent.setup();
    mostrar(<PantallaCarrito />);

    await persona.click(
      await screen.findByRole('button', { name: 'Agregar una unidad' }),
    );

    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 3 }]);
    await waitFor(() =>
      expect(within(resumen()).getAllByText('$38.970')).not.toHaveLength(0),
    );
    expect(escrituras.at(-1)).toEqual({
      peticion: 'POST /api/carrito/cotizar',
      cuerpo: { articulos: [{ articuloId: 11, cantidad: 3 }] },
    });
  });

  it('E5-H2 FE · sin sesión: un artículo que ya no se vende dice «Producto no disponible» y se puede quitar', async () => {
    sinSesion();
    guardarEnNavegador([{ articuloId: 99, cantidad: 1 }]);
    simularBackend({
      'POST /api/carrito/cotizar': () =>
        responder({
          items: [
            linea({
              articuloId: 99,
              cantidad: 1,
              tipo: null,
              nombre: '',
              nombreFormato: null,
              precioUnitario: null,
              subtotal: null,
              aLaVenta: false,
              stockSuficiente: null,
              impideCrearPedido: true,
            }),
          ],
          total: 0,
          puedeCrearPedido: false,
        }),
    });
    const persona = userEvent.setup();
    mostrar(<PantallaCarrito />);

    expect(
      await screen.findByRole('heading', { name: 'Producto no disponible' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Este producto ya no está disponible. Quítalo del carrito.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continuar con la compra/ }),
    ).toBeDisabled();

    await persona.click(
      screen.getByRole('button', {
        name: 'Quitar Producto no disponible del carrito',
      }),
    );

    expect(leerNavegador()).toEqual([]);
    expect(
      screen.getByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
  });

  it('E5-H2 FE · sin sesión: un error del servidor al cotizar no muestra detalles y ofrece reintentar', async () => {
    sinSesion();
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    simularBackend({
      'POST /api/carrito/cotizar': () =>
        responder({ statusCode: 500, message: 'PrismaClientError' }, 500),
    });
    mostrar(<PantallaCarrito />);

    expect(
      await screen.findByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 2 }]);
  });

  it('E5-H2 FE · sin sesión y sin artículos: muestra el carrito vacío sin pedir nada a la API', () => {
    sinSesion();
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    mostrar(<PantallaCarrito />);

    expect(
      screen.getByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('E5-H2 FE · sin sesión: un dato dañado en el navegador se trata como carrito vacío', () => {
    sinSesion();
    window.localStorage.setItem(CLAVE, '{"version":1,"articulos":[{"x":1}]}');
    mostrar(<PantallaCarrito />);

    expect(
      screen.getByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
  });

  it('E5-H2 FE · sin sesión: el header cuenta las unidades del navegador sin pedir nada a la API', () => {
    sinSesion();
    guardarEnNavegador([
      { articuloId: 11, cantidad: 2 },
      { articuloId: 12, cantidad: 1 },
    ]);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    mostrar(<CarritoHeader />);

    expect(
      screen.getByRole('link', { name: 'Carrito, 3 unidades' }),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('SCRUM-117 · Unir al iniciar sesión', () => {
  const unido = (extra: Partial<CarritoUnido> = {}): CarritoUnido => ({
    ...carrito([
      linea({ cantidad: 3, subtotal: 38970 }),
      linea({
        articuloId: 12,
        nombre: 'Acondicionador',
        cantidad: 1,
        subtotal: 9990,
      }),
    ]),
    ajustes: [],
    ...extra,
  });

  it('E5-H2 FE · al iniciar sesión: envía los artículos del navegador, los quita de ahí y muestra el carrito unido', async () => {
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    iniciarSesion();
    const escrituras = simularBackend({
      // El carrito que la cuenta tenía antes de unir
      'GET /api/carrito': () =>
        responder(
          carrito([
            linea({ cantidad: 1, subtotal: 12990 }),
            linea({ articuloId: 12, nombre: 'Acondicionador', cantidad: 1 }),
          ]),
        ),
      'POST /api/carrito/unir': () => responder(unido()),
    });
    mostrar(
      <>
        <UnionCarrito />
        <PantallaCarrito />
      </>,
    );

    await waitFor(() =>
      expect(screen.getByText('4 unidades')).toBeInTheDocument(),
    );
    expect(escrituras).toEqual([
      {
        peticion: 'POST /api/carrito/unir',
        cuerpo: { articulos: [{ articuloId: 11, cantidad: 2 }] },
      },
    ]);
    expect(leerNavegador()).toEqual([]);
    expect(
      screen.getByRole('heading', { name: 'Acondicionador' }),
    ).toBeInTheDocument();
    expect(
      within(resumen()).getByRole('link', { name: /Continuar con la compra/ }),
    ).toHaveAttribute('href', '/checkout');
  });

  it('E5-H2 FE · al iniciar sesión: con la pantalla abierta como visitante, une al ingresar', async () => {
    sinSesion();
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    const escrituras = simularBackend({
      'POST /api/carrito/cotizar': () => responder(carrito([linea()])),
      'GET /api/carrito': () => responder(carrito([])),
      'POST /api/carrito/unir': () => responder(unido()),
    });
    mostrar(
      <>
        <UnionCarrito />
        <PantallaCarrito />
      </>,
    );
    await screen.findByRole('heading', { name: 'Shampoo reparador' });

    iniciarSesion();

    expect(
      await screen.findByRole('heading', { name: 'Acondicionador' }),
    ).toBeInTheDocument();
    expect(escrituras.map((e) => e.peticion)).toEqual([
      'POST /api/carrito/cotizar',
      'POST /api/carrito/unir',
    ]);
    expect(leerNavegador()).toEqual([]);
  });

  it('E5-H2 FE · al iniciar sesión: avisa lo que el backend quitó o ajustó al unir', async () => {
    guardarEnNavegador([
      { articuloId: 11, cantidad: 2 },
      { articuloId: 98, cantidad: 1 },
      { articuloId: 99, cantidad: 1 },
    ]);
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () => responder(carrito([])),
      'POST /api/carrito/unir': () =>
        responder(
          unido({
            ajustes: [
              { articuloId: 98, motivo: 'agotado' },
              { articuloId: 99, motivo: 'no_disponible' },
            ],
          }),
        ),
    });
    mostrar(
      <>
        <UnionCarrito />
        <PantallaCarrito />
      </>,
    );

    expect(
      await screen.findByText(
        'Quitamos 2 productos que ya no están disponibles.',
      ),
    ).toBeInTheDocument();
  });

  it('E5-H2 FE · al iniciar sesión: si la unión falla, avisa con «Reintentar» y los artículos siguen en el navegador', async () => {
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    iniciarSesion();
    let falla = true;
    const escrituras = simularBackend({
      'GET /api/carrito': () => responder(carrito([])),
      'POST /api/carrito/unir': () =>
        falla
          ? responder({ statusCode: 500, message: 'PrismaClientError' }, 500)
          : responder(unido()),
    });
    const persona = userEvent.setup();
    mostrar(
      <>
        <UnionCarrito />
        <PantallaCarrito />
      </>,
    );

    const mensaje =
      'No pudimos sumar a tu carrito los productos que agregaste sin sesión.';
    expect(await screen.findByText(mensaje)).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 2 }]);
    const [textoToast, opciones] = toast.error.mock.calls[0];
    expect(textoToast).toBe(mensaje);
    expect(opciones.action.label).toBe('Reintentar');

    falla = false;
    await persona.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('heading', { name: 'Acondicionador' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(mensaje)).not.toBeInTheDocument();
    expect(leerNavegador()).toEqual([]);
    expect(escrituras).toHaveLength(2);
  });

  it('E5-H2 FE · al iniciar sesión: si el backend rechaza la unión (4xx), muestra su mensaje', async () => {
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () => responder(carrito([])),
      'POST /api/carrito/unir': () =>
        responder(
          {
            statusCode: 400,
            message:
              'Cada artículo debe aparecer una sola vez: indica su cantidad.',
          },
          400,
        ),
    });
    mostrar(
      <>
        <UnionCarrito />
        <PantallaCarrito />
      </>,
    );

    expect(
      await screen.findByText(
        'Cada artículo debe aparecer una sola vez: indica su cantidad.',
      ),
    ).toBeInTheDocument();
    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 2 }]);
  });

  it('E5-H2 FE · al iniciar sesión: si al unir se quitó todo, el aviso explica el carrito vacío', async () => {
    guardarEnNavegador([{ articuloId: 98, cantidad: 1 }]);
    iniciarSesion();
    simularBackend({
      'GET /api/carrito': () => responder(carrito([])),
      'POST /api/carrito/unir': () =>
        responder({
          ...carrito([]),
          ajustes: [{ articuloId: 98, motivo: 'agotado' }],
        }),
    });
    mostrar(
      <>
        <UnionCarrito />
        <PantallaCarrito />
      </>,
    );

    expect(
      await screen.findByText(
        'Quitamos un producto que ya no está disponible.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
  });

  it('E5-H2 FE · con la sesión abierta, lo que otra pestaña agrega como visitante no se une a esta cuenta', async () => {
    iniciarSesion();
    const escrituras = simularBackend({
      'GET /api/carrito': () => responder(carrito([])),
    });
    mostrar(<UnionCarrito />);

    act(() => {
      guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
      window.dispatchEvent(new StorageEvent('storage', { key: CLAVE }));
    });

    await new Promise((resolver) => setTimeout(resolver, 50));
    expect(escrituras).toEqual([]);
    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 2 }]);
  });

  it('E5-H2 FE · el personal de tienda no une nada y el carrito del navegador queda intacto', () => {
    guardarEnNavegador([{ articuloId: 11, cantidad: 2 }]);
    iniciarSesion('vendedor');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    mostrar(<UnionCarrito />);

    expect(fetch).not.toHaveBeenCalled();
    expect(leerNavegador()).toEqual([{ articuloId: 11, cantidad: 2 }]);
  });

  it('E5-H2 FE · textos del aviso: singular, plural y cantidad ajustada al máximo', () => {
    expect(textosDeAjustes([{ articuloId: 1, motivo: 'agotado' }])).toEqual([
      'Quitamos un producto que ya no está disponible.',
    ]);
    expect(
      textosDeAjustes([
        { articuloId: 1, motivo: 'cantidad_ajustada' },
        { articuloId: 2, motivo: 'cantidad_ajustada' },
      ]),
    ).toEqual(['Ajustamos la cantidad de 2 productos al máximo de 999.']);
  });
});
