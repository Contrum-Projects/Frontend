import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CORREO_CONTACTO } from '@/tienda/diseno/contacto';
import { BajaOfertas } from './bajaOfertas';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('E12-H2 FE · baja desde un correo antiguo', () => {
  it('SCRUM-19 · indica el correo al que escribir para darse de baja y no llama al backend', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    render(<BajaOfertas />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Darte de baja de las ofertas',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: CORREO_CONTACTO })).toHaveAttribute(
      'href',
      `mailto:${CORREO_CONTACTO}`,
    );
    expect(
      screen.getByRole('link', { name: 'Volver a la tienda' }),
    ).toHaveAttribute('href', '/');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('SCRUM-19 · quita de la URL el token de un enlace antiguo', () => {
    window.history.replaceState(null, '', '/ofertas/baja?token=abc.def');
    const reemplazar = vi.spyOn(window.history, 'replaceState');

    render(<BajaOfertas />);

    expect(reemplazar).toHaveBeenCalledWith(null, '', '/ofertas/baja');
  });
});
