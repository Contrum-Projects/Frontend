import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pack, renderizar, simularTienda } from '@/tienda/catalogo/apiDePrueba';
import type { SlidePortada } from './destinoPortada';
import { PortadaInicio } from './portadaInicio';
import { SEGUNDOS_POR_SLIDE, SliderPortada } from './sliderPortada';

vi.mock('next/server', () => ({ connection: async () => {} }));

const slide = (
  id: number,
  destino: SlidePortada['destino'],
  imagenCelular: string | null = null,
): SlidePortada => ({
  id,
  imagenEscritorio: `/portada/escritorio-${id}.jpg`,
  imagenCelular,
  destino,
});

const SLIDES = [
  slide(1, { tipo: 'pack', destino: '7', nombre: 'Pack reparación' }),
  slide(
    2,
    { tipo: 'marca', destino: '3', nombre: 'Loreal' },
    '/portada/celular-2.jpg',
  ),
  slide(3, { tipo: 'pagina', destino: 'catalogo', nombre: 'Catálogo' }),
];

let desplazamientos: number[];

beforeEach(() => {
  desplazamientos = [];
  Element.prototype.scrollTo = function (opciones?: ScrollToOptions | number) {
    if (typeof opciones === 'object') desplazamientos.push(opciones.left ?? 0);
  } as Element['scrollTo'];
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SCRUM-157 · Portada del inicio', () => {
  it('SCRUM-157 FE · criterio 2: cada imagen enlaza a su destino y se anuncia con su nombre', async () => {
    simularTienda({ portada: SLIDES, packs: [pack(7)] });

    renderizar(await PortadaInicio());

    const portada = screen.getByRole('region', { name: 'Portada' });
    const imagenes = within(portada).getAllByRole('group');
    expect(imagenes).toHaveLength(3);
    expect(imagenes[0]).toHaveAccessibleName('1 de 3');
    expect(
      within(imagenes[0]).getByRole('link', { name: 'Ver Pack reparación' }),
    ).toHaveAttribute('href', '/packs/7');
    // Los slides que no se ven no se recorren con el tabulador
    expect(
      within(imagenes[1]).getByRole('link', { hidden: true }),
    ).toHaveAttribute('href', '/catalogo?marca=3');
    expect(
      within(imagenes[1]).getByRole('link', { hidden: true }),
    ).toHaveAttribute('tabindex', '-1');
  });

  it('SCRUM-157 FE · criterio 1: usa la imagen de celular si existe y, si no, la de escritorio', async () => {
    const { container } = renderizar(<SliderPortada slides={SLIDES} />);

    const [primera, segunda] = Array.from(
      container.querySelectorAll('picture'),
    );
    expect(primera.querySelector('source')?.getAttribute('srcset')).toContain(
      'escritorio-1.jpg',
    );
    expect(primera.querySelector('img')?.getAttribute('srcset')).toContain(
      'escritorio-1.jpg',
    );
    expect(segunda.querySelector('img')?.getAttribute('srcset')).toContain(
      'celular-2.jpg',
    );
    expect(segunda.querySelector('source')?.getAttribute('srcset')).toContain(
      'escritorio-2.jpg',
    );
  });

  it('SCRUM-157 FE · criterio 6: sin imágenes en la portada muestra el banner del pack', async () => {
    simularTienda({ portada: [], packs: [pack(7)] });

    renderizar(await PortadaInicio());

    expect(
      screen.queryByRole('region', { name: 'Portada' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pack 7' })).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 6: si la API de la portada falla, también muestra el banner', async () => {
    simularTienda({
      portada: { estado: 500, cuerpo: { message: 'Error interno' } },
      packs: [pack(7)],
    });

    renderizar(await PortadaInicio());

    expect(screen.getByRole('heading', { name: 'Pack 7' })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('Error interno');
  });

  it('SCRUM-157 FE · criterio 8: avanza sola cada 6 s y se detiene con la pausa', () => {
    vi.useFakeTimers();
    renderizar(<SliderPortada slides={SLIDES} />);

    act(() => vi.advanceTimersByTime(SEGUNDOS_POR_SLIDE * 1000));
    expect(desplazamientos).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Ir a la imagen 2 de 3' }),
    ).toHaveAttribute('aria-current', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Pausar la portada' }));
    act(() => vi.advanceTimersByTime(SEGUNDOS_POR_SLIDE * 3000));
    expect(desplazamientos).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Reanudar la portada' }),
    ).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 8: con el mouse encima no avanza; las flechas y los puntos llevan a cada imagen', () => {
    vi.useFakeTimers();
    renderizar(<SliderPortada slides={SLIDES} />);
    const portada = screen.getByRole('region', { name: 'Portada' });

    fireEvent.mouseEnter(portada);
    act(() => vi.advanceTimersByTime(SEGUNDOS_POR_SLIDE * 2000));
    expect(desplazamientos).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Imagen anterior' }));
    expect(
      screen.getByRole('button', { name: 'Ir a la imagen 3 de 3' }),
    ).toHaveAttribute('aria-current', 'true');
    fireEvent.click(
      screen.getByRole('button', { name: 'Ir a la imagen 2 de 3' }),
    );
    expect(
      screen.getByRole('button', { name: 'Ir a la imagen 2 de 3' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  it('SCRUM-157 FE · criterio 8: con «reducir movimiento» no avanza sola', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', (consulta: string) => ({
      matches: consulta.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    renderizar(<SliderPortada slides={SLIDES} />);

    act(() => vi.advanceTimersByTime(SEGUNDOS_POR_SLIDE * 2000));
    expect(desplazamientos).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Pausar la portada' }),
    ).not.toBeInTheDocument();
  });

  it('SCRUM-157 FE · con una sola imagen no muestra controles', () => {
    renderizar(<SliderPortada slides={[SLIDES[0]]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
