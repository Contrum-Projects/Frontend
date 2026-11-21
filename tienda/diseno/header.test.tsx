import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('E2-H1 FE · header: el botón «Buscar» abre el buscador, que envía a /buscar con el campo q', async () => {
    act(() => olvidarSesion());
    const persona = userEvent.setup();
    mostrarHeader();

    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    await persona.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('search')).toHaveAttribute('action', '/buscar');
    const campo = screen.getByRole('searchbox', { name: 'Buscar' });
    expect(campo).toHaveAttribute('name', 'q');
    expect(campo).toHaveAttribute(
      'placeholder',
      'Busca por producto, marca o categoría',
    );
    expect(campo).toHaveFocus();
  });

  it('E2-H1 FE · header: el buscador se cierra con Esc y devuelve el foco al botón', async () => {
    act(() => olvidarSesion());
    const persona = userEvent.setup();
    mostrarHeader();

    await persona.click(screen.getByRole('button', { name: 'Buscar' }));
    await persona.keyboard('{Escape}');

    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveFocus();
  });

  it('E2-H1 FE · header: el buscador se cierra con la X', async () => {
    act(() => olvidarSesion());
    const persona = userEvent.setup();
    mostrarHeader();

    await persona.click(screen.getByRole('button', { name: 'Buscar' }));
    await persona.click(
      screen.getByRole('button', { name: 'Cerrar búsqueda' }),
    );

    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });

  it('E2-H1 FE · header: «Precio profesional» no va en la barra (queda en el footer y el menú)', () => {
    act(() => olvidarSesion());
    mostrarHeader();

    expect(
      screen.queryByRole('link', { name: 'Precio profesional' }),
    ).not.toBeInTheDocument();
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

  it('E2-H1 FE · header: con sesión saluda por el nombre y el menú lleva a la cuenta', async () => {
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
    const persona = userEvent.setup();
    mostrarHeader();

    const cuenta = screen.getByRole('button', { name: 'Tu cuenta: Camila' });
    expect(cuenta).toHaveTextContent('Hola, Camila');
    expect(
      screen.queryByRole('link', { name: 'Ingresar' }),
    ).not.toBeInTheDocument();

    await persona.click(cuenta);
    const menu = screen.getByRole('menu');
    expect(menu).toHaveTextContent('Sesión iniciada comoCamila Rojas');
    expect(screen.getByRole('menuitem', { name: 'Mis datos' })).toHaveAttribute(
      'href',
      '/cuenta/datos',
    );
    expect(
      screen.getByRole('menuitem', { name: 'Mis pedidos' }),
    ).toHaveAttribute('href', '/cuenta/pedidos');
    expect(
      screen.getByRole('menuitem', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Perfil profesional' }),
    ).not.toBeInTheDocument();
  });

  it('Sesión visible · header: una cuenta profesional lo ve en el menú y entra a su perfil', async () => {
    act(() =>
      guardarSesion({
        tokenAcceso: 't',
        expiraEn: 900,
        usuario: {
          codigoPublico: 'c-2',
          nombre: 'Ignacia',
          apellido: 'Muñoz',
          rol: 'profesional',
        },
      }),
    );
    const persona = userEvent.setup();
    mostrarHeader();

    await persona.click(
      screen.getByRole('button', { name: 'Tu cuenta: Ignacia' }),
    );

    expect(screen.getByRole('menu')).toHaveTextContent('Cuenta profesional');
    expect(
      screen.getByRole('menuitem', { name: 'Perfil profesional' }),
    ).toHaveAttribute('href', '/cuenta/perfil-profesional');
  });

  it('E2-H1 FE · header: mientras se conoce la sesión, muestra un esqueleto y no «Ingresar»', () => {
    mostrarHeader();

    expect(
      screen.queryByRole('link', { name: 'Ingresar' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Carrito' })).toBeInTheDocument();
  });

  it.each(['vendedor', 'bodeguero', 'administrador'] as const)(
    'Acceso al panel · header: una cuenta %s ve «Panel» y no «Mi cuenta» de comprador',
    (rol) => {
      act(() =>
        guardarSesion({
          tokenAcceso: 't',
          expiraEn: 900,
          usuario: {
            codigoPublico: 'p-1',
            nombre: 'Paula',
            apellido: 'Soto',
            rol,
          },
        }),
      );
      mostrarHeader();

      expect(screen.getByRole('link', { name: 'Panel' })).toHaveAttribute(
        'href',
        '/panel',
      );
      expect(
        screen.queryByRole('button', { name: /Tu cuenta/ }),
      ).not.toBeInTheDocument();
    },
  );
});
