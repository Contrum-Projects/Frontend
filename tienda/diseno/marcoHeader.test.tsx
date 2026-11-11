import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarcoHeader } from './marcoHeader';

/** IntersectionObserver de prueba: guarda el aviso para simular que la página se desplazó. */
const simularObservador = () => {
  let avisar: (
    entradas: Partial<IntersectionObserverEntry>[],
  ) => void = () => {};
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(aviso: typeof avisar) {
        avisar = aviso;
      }
      observe() {}
      disconnect() {}
    },
  );
  return (arriba: boolean) => act(() => avisar([{ isIntersecting: arriba }]));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Header flotante (SCRUM-157)', () => {
  it('SCRUM-157 FE · arriba de todo flota; al desplazarse queda como barra fija y vuelve a flotar al subir', () => {
    const desplazar = simularObservador();
    render(
      <MarcoHeader>
        <span>Fila del header</span>
      </MarcoHeader>,
    );
    const header = screen.getByRole('banner');

    expect(header).toHaveAttribute('data-flotante', 'true');
    desplazar(false);
    expect(header).not.toHaveAttribute('data-flotante');
    expect(header).toHaveClass('sticky', 'border-b');
    desplazar(true);
    expect(header).toHaveAttribute('data-flotante', 'true');
  });
});
