import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PantallaProductos } from './pantallaProductos';

describe('Productos (SCRUM-103)', () => {
  it('E3-H4 FE · marcas: Productos lleva a Marcas y categorías', () => {
    render(<PantallaProductos />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Productos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Marcas y categorías' }),
    ).toHaveAttribute('href', '/panel/marcas-y-categorias');
  });
});
