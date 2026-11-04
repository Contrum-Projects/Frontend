import { describe, expect, it } from 'vitest';
import { formatearDia, formatearDiaMes, formatearHora } from './fecha';
import { formatearPesos, formatearPesosNetos } from './moneda';
import { formatearNumero, formatearPorcentaje } from './numero';
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

describe('formatearPesosNetos()', () => {
  it('muestra los decimales del neto solo cuando los tiene', () => {
    expect(formatearPesosNetos(8403.36)).toBe('$8.403,36');
    expect(formatearPesosNetos(10916)).toBe('$10.916');
    expect(formatearPesosNetos(8403.3)).toBe('$8.403,30');
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

describe('formatearDiaMes()', () => {
  it('muestra el día de la API con el mes en palabras, sin correrse por la zona horaria', () => {
    expect(formatearDiaMes('2026-10-31')).toBe('31 de octubre');
    expect(formatearDiaMes('2026-01-01')).toBe('1 de enero');
  });
});

describe('formatearDia()', () => {
  it('muestra el día de la API con día, mes corto y año, sin correrse por la zona horaria', () => {
    expect(formatearDia('2027-12-31')).toBe('31 dic 2027');
    expect(formatearDia('2027-01-01')).toBe('1 ene 2027');
  });
});

describe('formatearHora()', () => {
  it('muestra la hora de Chile con dos dígitos', () => {
    // 13:29 UTC del 3 de noviembre de 2026 = 10:29 en Chile continental (UTC−3)
    expect(formatearHora('2026-11-03T13:29:00Z')).toBe('10:29');
    expect(formatearHora('2026-11-03T12:05:00Z')).toBe('09:05');
  });
});

describe('formatearNumero() y formatearPorcentaje()', () => {
  it('separa los miles con punto y deja el porcentaje sin espacio', () => {
    expect(formatearNumero(2140)).toBe('2.140');
    expect(formatearNumero(186)).toBe('186');
    expect(formatearPorcentaje(41)).toBe('41%');
    expect(formatearPorcentaje(57.6)).toBe('58%');
  });
});
