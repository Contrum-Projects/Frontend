import { describe, expect, it } from 'vitest';
import { destinoTrasIngreso } from './destinoIngreso';

describe('SCRUM-94 · Destino después de ingresar', () => {
  it('E1-H2 FE · ingreso correcto: el personal va al panel', () => {
    expect(destinoTrasIngreso('administrador', null)).toBe('/panel');
    expect(destinoTrasIngreso('vendedor', '/catalogo')).toBe('/panel');
    expect(destinoTrasIngreso('bodeguero', '/panel/inventario')).toBe(
      '/panel/inventario',
    );
  });

  it('E1-H2 FE · ingreso correcto: cliente y profesional vuelven a la tienda', () => {
    expect(destinoTrasIngreso('cliente', null)).toBe('/');
    expect(destinoTrasIngreso('profesional', '/catalogo?categoria=2')).toBe(
      '/catalogo?categoria=2',
    );
    expect(destinoTrasIngreso('cliente', '/panel/pedidos')).toBe('/');
    expect(destinoTrasIngreso('cliente', '/ingresar')).toBe('/');
  });

  it('no redirige a otro sitio con ?volver=', () => {
    for (const volver of [
      'https://otro.cl',
      '//otro.cl',
      '/\\otro.cl',
      '/\t/otro.cl',
      '/\n/otro.cl/panel',
      '/\r/otro.cl',
      'javascript:alert(1)',
      '',
    ]) {
      expect(destinoTrasIngreso('cliente', volver)).toBe('/');
      expect(destinoTrasIngreso('administrador', volver)).toBe('/panel');
    }
  });
});
