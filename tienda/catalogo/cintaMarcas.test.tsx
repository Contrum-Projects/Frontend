import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CintaMarcas } from './cintaMarcas';

const MARCAS = [
  { id: 4, nombre: 'Marca A' },
  { id: 9, nombre: 'Marca B' },
  { id: 12, nombre: 'Marca C' },
];

const mostrarCinta = () =>
  render(
    <section aria-labelledby="titulo-marcas">
      <CintaMarcas marcas={MARCAS} titulo="Marcas" />
    </section>,
  );

describe('SCRUM-106 · Cinta de marcas del inicio', () => {
  it('E2-H1 FE · inicio: muestra todas las marcas una vez, cada una hacia su catálogo', () => {
    mostrarCinta();

    const marcas = screen.getByRole('region', { name: 'Marcas' });
    const enlaces = within(marcas).getAllByRole('link');
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual([
      'Marca A',
      'Marca B',
      'Marca C',
    ]);
    expect(
      within(marcas).getByRole('link', { name: 'Marca C' }),
    ).toHaveAttribute('href', '/catalogo?marca=12');
  });

  it('las repeticiones del bucle no se enfocan ni se leen', () => {
    mostrarCinta();

    // 3 marcas se repiten hasta 12 por vuelta, y la vuelta va dos veces
    const todas = screen.getAllByText('Marca A', { selector: 'a' });
    expect(todas).toHaveLength(8);
    const enfocables = todas.filter((enlace) => enlace.tabIndex !== -1);
    expect(enfocables).toHaveLength(1);
  });

  it('la cinta no tiene botón de pausa y su duración depende de la cantidad de marcas', () => {
    mostrarCinta();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    // 12 marcas por vuelta × 3 s
    const cinta = screen.getAllByRole('list')[0]!.parentElement!;
    expect(cinta).toHaveClass('animate-cinta');
    expect(cinta.style.getPropertyValue('--duracion-cinta')).toBe('36s');
  });
});
