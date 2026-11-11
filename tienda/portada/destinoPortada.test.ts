import { describe, expect, it } from 'vitest';
import { hrefDestino } from './destinoPortada';

describe('hrefDestino (SCRUM-157)', () => {
  it('SCRUM-157 FE · criterio 2: cada tipo de destino lleva a su pantalla de la tienda', () => {
    expect(hrefDestino({ tipo: 'producto', destino: '12' })).toBe(
      '/productos/12',
    );
    expect(hrefDestino({ tipo: 'pack', destino: '7' })).toBe('/packs/7');
    expect(hrefDestino({ tipo: 'categoria', destino: '3' })).toEqual({
      pathname: '/catalogo',
      query: { categoria: 3 },
    });
    expect(hrefDestino({ tipo: 'marca', destino: '5' })).toEqual({
      pathname: '/catalogo',
      query: { marca: 5 },
    });
    expect(hrefDestino({ tipo: 'pagina', destino: 'packs' })).toBe('/packs');
    expect(hrefDestino({ tipo: 'pagina', destino: 'precio-profesional' })).toBe(
      '/precio-profesional',
    );
  });

  it('SCRUM-157 FE · un destino desconocido o mal formado no arma enlace', () => {
    expect(hrefDestino({ tipo: 'pagina', destino: 'https://otro.cl' })).toBe(
      null,
    );
    expect(hrefDestino({ tipo: 'producto', destino: 'abc' })).toBe(null);
    expect(hrefDestino({ tipo: 'marca', destino: '-1' })).toBe(null);
  });
});
