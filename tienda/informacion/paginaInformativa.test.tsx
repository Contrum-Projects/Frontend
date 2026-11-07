import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  COMPROBANTE_Y_FACTURA,
  DESPACHO_Y_RETIRO,
  PRECIO_PROFESIONAL,
} from './contenidos';
import { PaginaInformativa } from './paginaInformativa';

const migas = [
  { texto: 'Inicio', href: '/' as const },
  { texto: 'Actual', href: '/' as const },
];

describe('Páginas informativas de la tienda', () => {
  it('cada página tiene un solo h1, sus secciones como h2 y la acción principal', () => {
    for (const contenido of [
      PRECIO_PROFESIONAL,
      DESPACHO_Y_RETIRO,
      COMPROBANTE_Y_FACTURA,
    ]) {
      const { unmount } = render(
        <PaginaInformativa {...contenido} migas={migas} />,
      );
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(
        screen.getByRole('heading', { level: 1, name: contenido.titulo }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(
        contenido.secciones.length,
      );
      const [principal] = contenido.acciones ?? [];
      expect(
        screen.getByRole('link', { name: principal.texto }),
      ).toHaveAttribute('href', String(principal.href));
      unmount();
    }
  });

  it('precio profesional lleva a verificar la cuenta y explica el camino con documentos', () => {
    render(<PaginaInformativa {...PRECIO_PROFESIONAL} migas={migas} />);

    expect(
      screen.getByRole('link', { name: 'Verificar mi cuenta' }),
    ).toHaveAttribute('href', '/cuenta/verificacion');
    expect(
      screen.getByText(/hasta 5 archivos PDF, JPG o PNG/),
    ).toBeInTheDocument();
  });

  it('las migas marcan la página actual sin enlace', () => {
    render(<PaginaInformativa {...DESPACHO_Y_RETIRO} migas={migas} />);

    expect(screen.getByText('Actual')).toHaveAttribute('aria-current', 'page');
  });
});
