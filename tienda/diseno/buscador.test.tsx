import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Buscador } from './buscador';

const navegacion = vi.hoisted(() => ({
  ruta: '/buscar',
  consulta: new URLSearchParams('q=reparador'),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => navegacion.ruta,
  useSearchParams: () => navegacion.consulta,
}));

const buscador = () =>
  render(<Buscador id="buscar" placeholder="Buscar productos o marcas" />);

describe('Buscador del header', () => {
  it('E2-H2 FE · resultados: envía el texto a /buscar y en la búsqueda muestra lo buscado', () => {
    buscador();

    const campo = screen.getByRole('searchbox', { name: 'Buscar' });
    expect(campo).toHaveValue('reparador');
    expect(campo).toHaveAttribute('name', 'q');
    expect(screen.getByRole('search')).toHaveAttribute('action', '/buscar');
  });

  it('fuera de la búsqueda el campo queda vacío', () => {
    navegacion.ruta = '/catalogo';
    navegacion.consulta = new URLSearchParams('q=otra');

    buscador();

    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toHaveValue('');
  });
});
