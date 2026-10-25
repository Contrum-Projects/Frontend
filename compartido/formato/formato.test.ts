import { describe, expect, it } from 'vitest';
import { formatearPesos } from './moneda';
import { formatearRut, normalizarRut } from './rut';

describe('formatearPesos()', () => {
  it('usa separador de miles con punto y sin decimales', () => {
    expect(formatearPesos(22990)).toBe('$22.990');
    expect(formatearPesos('24980')).toBe('$24.980');
  });

  it('muestra un guion si el monto no es un número', () => {
    expect(formatearPesos('abc')).toBe('—');
  });
});

describe('RUT', () => {
  it('normaliza como el backend: sin puntos, con guion y K mayúscula', () => {
    expect(normalizarRut('11.111.111-1')).toBe('11111111-1');
    expect(normalizarRut('20.123.456-k')).toBeNull(); // dígito verificador incorrecto
    expect(normalizarRut('7.654.321-6')).toBe('7654321-6');
  });

  it('rechaza formatos inválidos', () => {
    expect(normalizarRut('123')).toBeNull();
    expect(normalizarRut('12.345.678-Z')).toBeNull();
  });

  it('formatea con puntos para mostrar', () => {
    expect(formatearRut('7654321-6')).toBe('7.654.321-6');
    expect(formatearRut('no es rut')).toBe('no es rut');
  });
});
