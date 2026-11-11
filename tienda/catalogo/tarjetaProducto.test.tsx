import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProductoTiendaProfesional } from '@/compartido/api/respuestas';
import { producto } from './apiDePrueba';
import { TAMANOS_FOTO, TarjetaProducto } from './tarjetaProducto';

const profesional = (
  extra: Partial<ProductoTiendaProfesional> = {},
): ProductoTiendaProfesional => ({
  ...producto(10, 'Shampoo reparador'),
  precio: 12990,
  precioMayorista: 9990,
  exclusivo: false,
  ...extra,
});

describe('Tarjeta de producto (SCRUM-157)', () => {
  it('SCRUM-157 FE · el profesional ve su precio y el normal tachado, cada uno con su nombre para lectores de pantalla', () => {
    render(
      <TarjetaProducto
        producto={profesional()}
        tamanos={TAMANOS_FOTO.inicio}
      />,
    );

    const tachado = screen.getByText('$12.990').closest('s');
    expect(tachado).toHaveTextContent('Precio normal: $12.990');
    expect(
      screen.getByText(/Precio profesional:/).parentElement,
    ).toHaveTextContent('Precio profesional: $9.990');
  });

  it('SCRUM-157 FE · un exclusivo no tiene precio normal: no tacha nada', () => {
    const { container } = render(
      <TarjetaProducto
        producto={profesional({ precio: null, exclusivo: true })}
        tamanos={TAMANOS_FOTO.inicio}
      />,
    );

    expect(container.querySelector('s')).toBeNull();
    expect(screen.getByText('$9.990')).toBeInTheDocument();
  });

  it('SCRUM-157 FE · quien no es profesional ve solo el precio normal, sin tachar', () => {
    const { container } = render(
      <TarjetaProducto
        producto={producto(10, 'Shampoo reparador')}
        tamanos={TAMANOS_FOTO.inicio}
      />,
    );

    expect(container.querySelector('s')).toBeNull();
    expect(screen.getByText('$12.990')).toBeInTheDocument();
  });
});
