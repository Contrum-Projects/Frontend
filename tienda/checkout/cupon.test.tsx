import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { responder, simularBackend } from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaCheckout } from './pantallaCheckout';

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
const navegacion = vi.hoisted(() => ({ irAUrlExterna: vi.fn() }));
vi.mock('./navegacion', () => navegacion);

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
      precioUnitario: 10000,
      subtotal: 20000,
      aLaVenta: true,
      stockSuficiente: true,
      impideCrearPedido: false,
    },
  ],
  total: 20000,
  puedeCrearPedido: true,
};

const CUPON = {
  codigo: 'LOREAL20',
  descripcion: '20 % en la marca',
  descuento: 4000,
  totalProductos: 16000,
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
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <PantallaCheckout />
    </QueryClientProvider>,
  );
};

const aplicar = async (codigo: string) => {
  await userEvent.click(
    await screen.findByRole('button', { name: '¿Tienes un cupón?' }),
  );
  await userEvent.type(screen.getByLabelText('Código del cupón'), codigo);
  await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
};

describe('Cupón en el checkout (SCRUM-150)', () => {
  it('SCRUM-150 · aplicar: muestra el descuento y el total que calcula el backend, y lo envía al crear el pedido', async () => {
    const escrituras = simularBackend({
      'GET /api/carrito': () => responder(CARRITO),
      'POST /api/carrito/cupon': () => responder(CUPON),
      'POST /api/pedidos': () =>
        responder({ codigoPublico: 'K7M2Q9XA4BCD' }, 201),
      'POST /api/pedidos/K7M2Q9XA4BCD/pago': () =>
        responder({
          urlPago: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=1',
          pagarHasta: '2026-11-07T15:15:00Z',
        }),
    });
    mostrar();

    await aplicar('loreal20');

    const resumen = await screen.findByRole('region', { name: 'Tu pedido' });
    expect(
      await within(resumen).findByText('Cupón LOREAL20'),
    ).toBeInTheDocument();
    expect(within(resumen).getAllByText('−$4.000').length).toBeGreaterThan(0);
    // El total es el que descontó el backend, no una resta del navegador
    expect(within(resumen).getByText('$16.000')).toBeInTheDocument();
    expect(
      escrituras.find((e) => e.peticion === 'POST /api/carrito/cupon')?.cuerpo,
    ).toEqual({
      codigo: 'loreal20',
    });

    await userEvent.click(
      screen.getByRole('button', { name: /pagar con mercado pago/i }),
    );
    await waitFor(() =>
      expect(
        escrituras.find((e) => e.peticion === 'POST /api/pedidos')?.cuerpo,
      ).toMatchObject({ codigoCupon: 'LOREAL20' }),
    );
  });

  it('SCRUM-150 · un cupón que no aplica muestra el mensaje del backend bajo el campo, sin perder lo escrito', async () => {
    simularBackend({
      'GET /api/carrito': () => responder(CARRITO),
      'POST /api/carrito/cupon': () =>
        responder(
          {
            statusCode: 400,
            message: 'El cupón ya venció.',
            errores: [{ campo: 'codigoCupon', mensaje: 'El cupón ya venció.' }],
          },
          400,
        ),
    });
    mostrar();

    await aplicar('VIEJO10');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El cupón ya venció.',
    );
    expect(screen.getByLabelText('Código del cupón')).toHaveValue('VIEJO10');
    expect(screen.getByLabelText('Código del cupón')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('SCRUM-150 · quitar el cupón vuelve al total sin descuento', async () => {
    simularBackend({
      'GET /api/carrito': () => responder(CARRITO),
      'POST /api/carrito/cupon': () => responder(CUPON),
    });
    mostrar();

    await aplicar('LOREAL20');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Quitar el cupón LOREAL20' }),
    );

    const resumen = screen.getByRole('region', { name: 'Tu pedido' });
    expect(within(resumen).queryByText('Cupón LOREAL20')).toBeNull();
    expect(within(resumen).getAllByText('$20.000')).toHaveLength(3);
  });
});
