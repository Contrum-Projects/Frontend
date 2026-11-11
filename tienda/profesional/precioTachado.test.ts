import { describe, expect, it } from 'vitest';
import { precioNormalTachado } from './precio';

describe('precioNormalTachado (SCRUM-157)', () => {
  it('SCRUM-157 FE · el profesional ve tachado el precio normal cuando es mayor que el suyo', () => {
    expect(precioNormalTachado({ precio: 12990, precioMayorista: 9990 })).toBe(
      12990,
    );
  });

  it('SCRUM-157 FE · sin precio normal (exclusivo), igual o menor, o sin sesión profesional: no se tacha nada', () => {
    expect(precioNormalTachado({ precio: null, precioMayorista: 9990 })).toBe(
      null,
    );
    expect(precioNormalTachado({ precio: 9990, precioMayorista: 9990 })).toBe(
      null,
    );
    expect(precioNormalTachado({ precio: 12990 })).toBe(null);
  });
});
