import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  pack,
  pedidas,
  renderizar,
  simularTienda,
} from '@/tienda/catalogo/apiDePrueba';
import { leerPaginas, ListaPacks } from './listaPacks';

vi.mock('next/server', () => ({ connection: async () => {} }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Packs de la tienda (/packs)', () => {
  it('muestra cada pack con lo que incluye, su último día y su precio, y lleva a su ficha', async () => {
    const api = simularTienda({
      packs: [
        pack(7, {
          nombre: 'Pack reparación total',
          precio: 24990,
          vigenteHasta: '2026-11-30',
          componentes: [
            { producto: 'Shampoo reparador', formato: '300 ml', cantidad: 2 },
            { producto: 'Mascarilla', formato: '250 g', cantidad: 1 },
          ],
        }),
        pack(8),
      ],
    });

    renderizar(await ListaPacks({ paginas: 1 }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Packs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 packs')).toBeInTheDocument();
    const [primero] = screen.getAllByRole('article');
    expect(
      within(primero).getByRole('link', { name: 'Pack reparación total' }),
    ).toHaveAttribute('href', '/packs/7');
    expect(
      within(primero).getByText(
        '2 × Shampoo reparador 300 ml + Mascarilla 250 g',
      ),
    ).toBeInTheDocument();
    expect(within(primero).getByText(/^Hasta el/)).toBeInTheDocument();
    expect(within(primero).getByText('$24.990')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 2 de 2 packs')).toBeInTheDocument();
    // Sin más packs no hay «Cargar más»
    expect(
      screen.queryByRole('link', { name: /Cargar más packs/ }),
    ).not.toBeInTheDocument();
    expect(pedidas(api)).toEqual(['/api/tienda/packs?pagina=1&limite=12']);
  });

  it('con más packs que los mostrados, «Cargar más packs» pide la página siguiente', async () => {
    simularTienda({
      packs: {
        estado: 200,
        cuerpo: { items: [pack(1)], total: 20, pagina: 1, limite: 12 },
      },
    });

    renderizar(await ListaPacks({ paginas: 1 }));

    expect(
      screen.getByRole('link', { name: /Cargar más packs/ }),
    ).toHaveAttribute('href', '/packs?pagina=2');
  });

  it('sin packs a la venta lo dice y ofrece el catálogo', async () => {
    simularTienda({ packs: [] });

    renderizar(await ListaPacks({ paginas: 1 }));

    expect(
      screen.getByText('No hay packs a la venta en este momento.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ver el catálogo' }),
    ).toHaveAttribute('href', '/catalogo');
  });

  it('si el backend falla, avisa sin detalles técnicos', async () => {
    simularTienda({
      packs: { estado: 500, cuerpo: { statusCode: 500, message: 'Error' } },
    });

    renderizar(await ListaPacks({ paginas: 1 }));

    expect(
      screen.getByText(
        'No pudimos cargar los packs. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
  });

  it('la página de la URL queda entre 1 y el máximo; lo inválido es la primera', () => {
    expect(leerPaginas('3')).toBe(3);
    expect(leerPaginas(['2', '5'])).toBe(2);
    expect(leerPaginas('abc')).toBe(1);
    expect(leerPaginas('0')).toBe(1);
    expect(leerPaginas('999')).toBe(20);
    expect(leerPaginas(undefined)).toBe(1);
  });
});
