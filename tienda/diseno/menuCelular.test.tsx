import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { categoria } from '@/tienda/catalogo/apiDePrueba';
import { MenuCelular } from './menuCelular';

const CATEGORIAS = [
  categoria(1, 'Shampoo', [
    categoria(2, 'Reparación'),
    categoria(3, 'Hidratación'),
  ]),
  categoria(5, 'Styling'),
];
const MARCAS = [
  { id: 4, nombre: 'Marca A' },
  { id: 7, nombre: 'Marca B' },
];

const abrirMenu = async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MenuCelular categorias={CATEGORIAS} marcas={MARCAS} />
    </QueryClientProvider>,
  );
  const usuario = userEvent.setup();
  await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));
  return { usuario, menu: screen.getByRole('dialog', { name: 'Menú' }) };
};

beforeEach(() => {
  reiniciarParaPruebas();
  act(() => olvidarSesion());
});

afterEach(() => {
  reiniciarParaPruebas();
});

describe('SCRUM-106 · Menú del celular', () => {
  it('E2-H1 FE · celular: el menú muestra categorías, packs, marcas, precio profesional, ayuda y cuenta', async () => {
    const { menu } = await abrirMenu();

    expect(
      within(menu).getByRole('button', { name: 'Shampoo' }),
    ).toBeInTheDocument();
    expect(within(menu).getByRole('link', { name: 'Styling' })).toHaveAttribute(
      'href',
      '/catalogo?categoria=5',
    );
    expect(
      within(menu).getByRole('link', { name: 'Packs' }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('button', { name: 'Marcas' }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('link', { name: 'Precio profesional' }),
    ).toBeInTheDocument();
    const ayuda = within(menu).getByRole('navigation', { name: 'Ayuda' });
    expect(
      within(ayuda).getByRole('link', { name: 'Contacto' }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('link', { name: 'Ingresar' }),
    ).toHaveAttribute('href', '/ingresar');
  });

  it('E2-H1 FE · celular: una categoría abre sus subcategorías y se puede volver', async () => {
    const { usuario, menu } = await abrirMenu();

    await usuario.click(within(menu).getByRole('button', { name: 'Shampoo' }));

    expect(
      within(menu).getByRole('heading', { name: 'Shampoo' }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('link', { name: 'Ver todo en Shampoo' }),
    ).toHaveAttribute('href', '/catalogo?categoria=1');
    expect(
      within(menu).getByRole('link', { name: 'Hidratación' }),
    ).toHaveAttribute('href', '/catalogo?categoria=3');

    await usuario.click(within(menu).getByRole('button', { name: 'Volver' }));
    expect(
      within(menu).getByRole('button', { name: 'Marcas' }),
    ).toBeInTheDocument();
  });

  it('E2-H1 FE · celular: «Marcas» lista las marcas con su catálogo', async () => {
    const { usuario, menu } = await abrirMenu();

    await usuario.click(within(menu).getByRole('button', { name: 'Marcas' }));

    expect(within(menu).getByRole('link', { name: 'Marca B' })).toHaveAttribute(
      'href',
      '/catalogo?marca=7',
    );
  });

  it('E2-H1 FE · celular: al elegir un destino, el menú se cierra', async () => {
    const { usuario, menu } = await abrirMenu();

    await usuario.click(within(menu).getByRole('link', { name: 'Styling' }));

    expect(
      screen.queryByRole('dialog', { name: 'Menú' }),
    ).not.toBeInTheDocument();
  });

  it('E2-H1 FE · celular: con sesión, saluda y ofrece mis pedidos y mis datos', async () => {
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

    const { menu } = await abrirMenu();

    expect(within(menu).getByText('Hola, Camila')).toBeInTheDocument();
    expect(
      within(menu).getByRole('link', { name: 'Mis pedidos' }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('link', { name: 'Mis datos' }),
    ).toBeInTheDocument();
    expect(
      within(menu).queryByRole('link', { name: 'Ingresar' }),
    ).not.toBeInTheDocument();
  });
});
