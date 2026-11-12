import { describe, expect, it } from 'vitest';
import { politicaDeContenido } from './politicaContenido';

const directivas = (politica: string) =>
  new Map(
    politica.split('; ').map((directiva) => {
      const [nombre, ...valores] = directiva.split(' ');
      return [nombre, valores];
    }),
  );

describe('Content-Security-Policy (SCRUM-165)', () => {
  it('SCRUM-165 · producción: solo el mismo origen, sin objetos, base, formularios ni marcos ajenos', () => {
    const politica = directivas(
      politicaDeContenido({
        desarrollo: false,
        origenImagenes: 'https://img.tienda.cl',
      }),
    );

    expect(politica.get('default-src')).toEqual(["'self'"]);
    expect(politica.get('script-src')).toEqual(["'self'", "'unsafe-inline'"]);
    expect(politica.get('connect-src')).toEqual(["'self'"]);
    expect(politica.get('img-src')).toEqual([
      "'self'",
      'blob:',
      'data:',
      'https://img.tienda.cl',
    ]);
    expect(politica.get('object-src')).toEqual(["'none'"]);
    expect(politica.get('base-uri')).toEqual(["'self'"]);
    expect(politica.get('form-action')).toEqual(["'self'"]);
    expect(politica.get('frame-ancestors')).toEqual(["'none'"]);
    expect(politica.has('upgrade-insecure-requests')).toBe(true);
  });

  it('SCRUM-165 · desarrollo: permite eval para el recargado en caliente y no sube localhost a https', () => {
    const politica = directivas(
      politicaDeContenido({ desarrollo: true, origenImagenes: null }),
    );

    expect(politica.get('script-src')).toContain("'unsafe-eval'");
    expect(politica.get('img-src')).toEqual(["'self'", 'blob:', 'data:']);
    expect(politica.has('upgrade-insecure-requests')).toBe(false);
  });
});
