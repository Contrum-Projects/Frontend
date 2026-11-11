import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import {
  leerCarritoNavegador,
  reiniciarCarritoNavegadorParaPruebas,
} from '@/tienda/carrito/carritoNavegador';
import { BotonAgregarTarjeta } from './botonAgregarTarjeta';

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
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

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

const iniciarSesion = (rol: Rol) =>
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

const boton = (formatos = 1) => (
  <BotonAgregarTarjeta
    productoId={10}
    nombre="Shampoo reparador"
    formatoId={41}
    formatos={formatos}
  />
);

beforeEach(() => {
  window.localStorage.clear();
  reiniciarCarritoNavegadorParaPruebas();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  reiniciarParaPruebas();
});

describe('Botón de la tarjeta de producto (SCRUM-157)', () => {
  it('SCRUM-157 FE · un formato, visitante: agrega una unidad al carrito del navegador y muestra «Agregado»', async () => {
    act(() => olvidarSesion());
    mostrar(boton());

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Agregar Shampoo reparador al carrito',
      }),
    );

    expect(
      await screen.findByRole('button', {
        name: 'Shampoo reparador agregado al carrito',
      }),
    ).toHaveTextContent('Agregado');
    expect(leerCarritoNavegador()).toEqual([{ articuloId: 41, cantidad: 1 }]);
  });

  it('SCRUM-157 FE · un formato, con sesión: lo agrega al carrito de la cuenta', async () => {
    iniciarSesion('cliente');
    const pedidas: unknown[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (peticion: Request) => {
        pedidas.push(await peticion.clone().json());
        return Response.json({ items: [], totales: null });
      }),
    );
    mostrar(boton());

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Agregar Shampoo reparador al carrito',
      }),
    );

    await screen.findByRole('button', {
      name: 'Shampoo reparador agregado al carrito',
    });
    expect(pedidas).toEqual([{ articuloId: 41, cantidad: 1 }]);
  });

  it('SCRUM-157 FE · si el backend lo rechaza, muestra su mensaje y no dice «Agregado»', async () => {
    iniciarSesion('cliente');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { statusCode: 409, message: 'No queda stock de este formato.' },
          { status: 409 },
        ),
      ),
    );
    mostrar(boton());

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Agregar Shampoo reparador al carrito',
      }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No queda stock de este formato.',
      ),
    );
    expect(
      screen.getByRole('button', {
        name: 'Agregar Shampoo reparador al carrito',
      }),
    ).toBeInTheDocument();
  });

  it('SCRUM-157 FE · varios formatos: lleva a la ficha para elegir', () => {
    mostrar(boton(3));

    expect(
      screen.getByRole('link', { name: 'Elegir formato de Shampoo reparador' }),
    ).toHaveAttribute('href', '/productos/10');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('SCRUM-157 FE · el personal de tienda no tiene carrito: no ve el botón', () => {
    iniciarSesion('vendedor');
    mostrar(boton());

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
