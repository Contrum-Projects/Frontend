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

  it('SCRUM-157 FE · criterio 1: sin ninguna imagen de celular, en celular la de escritorio se ve completa (12:5)', () => {
    const sinCelular = SLIDES.map((s) => ({ ...s, imagenCelular: null }));
    renderizar(<SliderPortada slides={sinCelular} />);

    for (const grupo of screen.getAllByRole('group')) {
      expect(grupo).toHaveClass('aspect-[12/5]');
      expect(grupo).not.toHaveClass('aspect-[4/5]');
    }
    expect(document.querySelectorAll('img[aria-hidden="true"]')).toHaveLength(
      0,
    );
  });

  it('SCRUM-157 FE · criterio 1: con imágenes de celular mezcladas, las que no tienen se muestran completas sobre su fondo', () => {
    const { container } = renderizar(<SliderPortada slides={SLIDES} />);

    for (const grupo of screen.getAllByRole('group')) {
      expect(grupo).toHaveClass('aspect-[4/5]');
    }
    const [primera, segunda] = Array.from(container.querySelectorAll('li'));
    // La 1 no tiene versión de celular: fondo desenfocado y la imagen entera encima
    expect(primera.querySelectorAll('img[aria-hidden="true"]')).toHaveLength(1);
    expect(primera.querySelector('picture img')).toHaveClass(
      'max-md:object-contain',
    );
    // La 2 sí la tiene: se ve como siempre
    expect(segunda.querySelectorAll('img[aria-hidden="true"]')).toHaveLength(0);
    expect(segunda.querySelector('picture img')).not.toHaveClass(
      'max-md:object-contain',
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

  it('SCRUM-157 FE · criterio 8: avanza sola cada 6 s, sin botón de pausa', () => {
    vi.useFakeTimers();
    renderizar(<SliderPortada slides={SLIDES} />);

    act(() => vi.advanceTimersByTime(SEGUNDOS_POR_SLIDE * 1000));
    expect(desplazamientos).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Ir a la imagen 2 de 3' }),
    ).toHaveAttribute('aria-current', 'true');
    expect(
      screen.queryByRole('button', { name: /Pausar/ }),
    ).not.toBeInTheDocument();
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

  it('SCRUM-157 FE · criterio 8: al arrastrar con el mouse pasa a la imagen siguiente y no abre su enlace', () => {
    const { container } = renderizar(<SliderPortada slides={SLIDES} />);
    const pista = container.querySelector('ul') as HTMLUListElement;
    Object.defineProperty(pista, 'clientWidth', { value: 1000 });
    const mouse = { pointerType: 'mouse', button: 0, pointerId: 1 };

    fireEvent.pointerDown(pista, { ...mouse, clientX: 700 });
    fireEvent.pointerMove(pista, { ...mouse, clientX: 500 });
    expect(pista.scrollLeft).toBe(200);
    fireEvent.pointerUp(pista, { ...mouse, clientX: 400 });

    expect(desplazamientos.at(-1)).toBe(1000);
    expect(
      screen.getByRole('button', { name: 'Ir a la imagen 2 de 3' }),
    ).toHaveAttribute('aria-current', 'true');
    // El clic que sigue al arrastre no navega
    const enlace = within(screen.getAllByRole('group')[0]).getByRole('link', {
      hidden: true,
    });
    expect(fireEvent.click(enlace)).toBe(false);
    // Un clic sin arrastre sí llega al enlace
    expect(fireEvent.click(enlace)).toBe(true);
  });

  it('SCRUM-157 FE · criterio 8: un arrastre corto vuelve a la misma imagen', () => {
    const { container } = renderizar(<SliderPortada slides={SLIDES} />);
    const pista = container.querySelector('ul') as HTMLUListElement;
    Object.defineProperty(pista, 'clientWidth', { value: 1000 });
    const mouse = { pointerType: 'mouse', button: 0, pointerId: 1 };

    fireEvent.pointerDown(pista, { ...mouse, clientX: 500 });
    fireEvent.pointerMove(pista, { ...mouse, clientX: 450 });
    fireEvent.pointerUp(pista, { ...mouse, clientX: 450 });

    expect(desplazamientos.at(-1)).toBe(0);
    expect(
      screen.getByRole('button', { name: 'Ir a la imagen 1 de 3' }),
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
  });

  it('SCRUM-157 FE · con una sola imagen no muestra controles', () => {
    renderizar(<SliderPortada slides={[SLIDES[0]]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
