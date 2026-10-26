import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BotonCargarMas } from './botonCargarMas';

const estadoEnlace = vi.hoisted(() => ({ pending: false }));
vi.mock('next/link', async (original) => ({
  ...(await original<typeof import('next/link')>()),
  useLinkStatus: () => estadoEnlace,
}));

afterEach(() => {
  estadoEnlace.pending = false;
});

describe('SCRUM-106 · Cargar más productos', () => {
  it('E2-H1 FE · catálogo: «Cargar más productos» lleva a la página siguiente sin mover la vista', () => {
    render(
      <BotonCargarMas href={{ pathname: '/catalogo', query: { pagina: 2 } }} />,
    );

    expect(
      screen.getByRole('link', { name: 'Cargar más productos' }),
    ).toHaveAttribute('href', '/catalogo?pagina=2');
    expect(
      screen.queryByText('Cargando más productos'),
    ).not.toBeInTheDocument();
  });

  it('E2-H1 FE · catálogo: mientras llega la página siguiente, el botón avisa que está cargando', () => {
    estadoEnlace.pending = true;

    render(
      <BotonCargarMas href={{ pathname: '/catalogo', query: { pagina: 2 } }} />,
    );

    expect(screen.getByText('Cargando más productos')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Cargar más productos/ });
    expect(link.querySelector('svg')).not.toHaveClass('opacity-0');
  });
});
