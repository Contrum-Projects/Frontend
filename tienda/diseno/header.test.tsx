import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Header } from './header';

// Las partes que leen la API van en <Suspense> y se prueban aparte (inicio.test.tsx y
// menuCelular.test.tsx); aquí se reemplazan para probar el resto del header.
vi.mock('./navegacionCategorias', () => ({
  NavegacionCategorias: () => <span>Categorías</span>,
}));
vi.mock('./menuCelularCargado', () => ({
  MenuCelularCargado: () => <button type="button">Abrir menú</button>,
  MenuCelularEsqueleto: () => null,
}));
// El buscador lee la URL para mostrar lo buscado (SCRUM-107)
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const mostrarHeader = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Header />
    </QueryClientProvider>,
  );

afterEach(() => {
  reiniciarParaPruebas();
});

describe('SCRUM-106 · Header de la tienda', () => {
  it('E2-H1 FE · header: el buscador envía la búsqueda a /buscar con el campo q', () => {
    act(() => olvidarSesion());
    mostrarHeader();

    const buscadores = screen.getAllByRole('search');
    expect(buscadores).toHaveLength(2); // escritorio y celular
    for (const buscador of buscadores) {
      expect(buscador).toHaveAttribute('action', '/buscar');
    }
    expect(
      screen.getByPlaceholderText('Busca por producto, marca o categoría'),
    ).toHaveAttribute('name', 'q');
    expect(screen.getAllByLabelText('Buscar')).toHaveLength(2);
  });

  it('E2-H1 FE · header: sin sesión ofrece «Ingresar» y el carrito', () => {
    act(() => olvidarSesion());
    mostrarHeader();

    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar',
    );
    expect(screen.getByRole('link', { name: 'Carrito' })).toHaveAttribute(
      'href',
      '/carrito',
    );
  });

  it('E2-H1 FE · header: con sesión muestra el nombre y lleva a la cuenta', () => {
    act(() =>
      guardarSesion({
        tokenAcceso: 't',
        expiraEn: 900,
        usuario: {
          codigoPublico: 'c-1',
          nombre: 'Camila',
          apellido: 'Rojas',
          rol: 'cliente',
        },
      }),
    );
    mostrarHeader();

    expect(screen.getByRole('link', { name: 'Camila' })).toHaveAttribute(
      'href',
      '/cuenta/datos',
    );
    expect(
      screen.queryByRole('link', { name: 'Ingresar' }),
    ).not.toBeInTheDocument();
  });

  it('E2-H1 FE · header: mientras se conoce la sesión, muestra un esqueleto y no «Ingresar»', () => {
    mostrarHeader();

    expect(
      screen.queryByRole('link', { name: 'Ingresar' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Carrito' })).toBeInTheDocument();
  });
});
