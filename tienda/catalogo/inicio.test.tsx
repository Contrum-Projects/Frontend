import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavegacionCategorias } from '@/tienda/diseno/navegacionCategorias';
import {
  categoria,
  pack,
  pedidas,
  producto,
  simularTienda,
} from './apiDePrueba';
import { FilaProductos } from './filaProductos';
import { MarcasInicio } from './marcasInicio';
import { Promociones } from './promociones';

vi.mock('next/server', () => ({ connection: async () => {} }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SCRUM-106 · Inicio', () => {
  it('E2-H1 FE · inicio: muestra la fila «Más vendidos» con los productos de la API', async () => {
    const api = simularTienda({
      productos: [
        [producto(1, 'Shampoo reparador'), producto(2, 'Mascarilla nutritiva')],
      ],
    });

    render(
      await FilaProductos({
        titulo: 'Más vendidos',
        orden: 'mas-vendidos',
        celular: 'carrusel',
      }),
    );

    const fila = screen.getByRole('region', { name: 'Más vendidos' });
    expect(within(fila).getAllByRole('article')).toHaveLength(2);
    expect(
      within(fila).getByRole('link', { name: 'Ver todo' }),
    ).toHaveAttribute('href', '/catalogo?orden=mas-vendidos');
    expect(pedidas(api)).toEqual([
      '/api/tienda/productos?limite=5&orden=mas-vendidos',
    ]);
  });

  it('E2-H1 FE · inicio: la fila «Novedades» no aparece si no hay productos', async () => {
    simularTienda({ productos: [[]] });

    const fila = await FilaProductos({
      titulo: 'Novedades',
      orden: 'novedades',
      celular: 'grilla',
    });

    expect(fila).toBeNull();
  });

  it('E2-H1 FE · inicio: si la API falla, la fila no se muestra (sin detalles técnicos)', async () => {
    simularTienda({
      productos: { estado: 500, cuerpo: { message: 'Error interno' } },
    });

    expect(
      await FilaProductos({
        titulo: 'Novedades',
        orden: 'novedades',
        celular: 'grilla',
      }),
    ).toBeNull();
  });

  it('E2-H1 FE · inicio: el banner de promociones destaca el pack que vence antes', async () => {
    simularTienda({
      packs: [
        pack(1, { nombre: 'Pack hidratación', vigenteHasta: null }),
        pack(2, { nombre: 'Pack color', vigenteHasta: '2026-11-15' }),
        pack(3, { nombre: 'Pack rizos', vigenteHasta: '2026-12-01' }),
      ],
    });

    render(await Promociones());

    expect(
      screen.getByRole('heading', { name: 'Pack color' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hasta el 15 de noviembre')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver pack' })).toHaveAttribute(
      'href',
      '/packs/2',
    );
    expect(
      screen.getByRole('link', { name: 'Verificar mi cuenta' }),
    ).toBeInTheDocument();
  });

  it('E2-H1 FE · inicio: sin packs vigentes no hay banner, pero sí las tarjetas laterales', async () => {
    simularTienda({ packs: [] });

    render(await Promociones());

    expect(
      screen.queryByRole('link', { name: 'Ver pack' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Packs' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Precio profesional' }),
    ).toBeInTheDocument();
  });

  it('E2-H1 FE · inicio: muestra las marcas y cada una lleva a su catálogo', async () => {
    simularTienda({
      marcas: [
        { id: 4, nombre: 'Marca A' },
        { id: 9, nombre: 'Marca B' },
      ],
    });

    render(await MarcasInicio());

    const marcas = screen.getByRole('region', { name: 'Marcas' });
    expect(
      within(marcas).getByRole('link', { name: 'Marca B' }),
    ).toHaveAttribute('href', '/catalogo?marca=9');
  });

  it('E2-H1 FE · header: muestra las categorías de la API, packs y marcas', async () => {
    simularTienda({
      categorias: [categoria(3, 'Shampoo'), categoria(5, 'Coloración')],
      marcas: [{ id: 4, nombre: 'Marca A' }],
    });

    render(await NavegacionCategorias());

    expect(screen.getByRole('link', { name: 'Shampoo' })).toHaveAttribute(
      'href',
      '/catalogo?categoria=3',
    );
    expect(
      screen.getByRole('link', { name: 'Coloración' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Packs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcas' })).toBeInTheDocument();
  });

  it('E2-H1 FE · header: si la API no responde, queda navegable con «Packs»', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('sin red')));

    render(await NavegacionCategorias());

    expect(screen.getByRole('link', { name: 'Packs' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Marcas' }),
    ).not.toBeInTheDocument();
  });
});
