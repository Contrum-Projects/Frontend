import { describe, expect, it } from 'vitest';
import { leerParametrosCatalogo, MAXIMO_PAGINAS } from './parametrosCatalogo';

describe('leerParametrosCatalogo()', () => {
  it('E2-H1 FE · lee la categoría y la marca elegidas de la URL', () => {
    expect(leerParametrosCatalogo({ categoria: '3', marca: '7' })).toEqual({
      categoriaId: 3,
      marcaId: 7,
      orden: undefined,
      paginas: 1,
    });
  });

  it('sin filtros es el catálogo completo, en la primera página', () => {
    expect(leerParametrosCatalogo({})).toEqual({
      categoriaId: undefined,
      marcaId: undefined,
      orden: undefined,
      paginas: 1,
    });
  });

  it('un id mal escrito no es una categoría ni una marca (404)', () => {
    expect(leerParametrosCatalogo({ categoria: 'abc' })).toBeNull();
    expect(leerParametrosCatalogo({ marca: '-2' })).toBeNull();
    expect(leerParametrosCatalogo({ categoria: '0' })).toBeNull();
  });

  it('ignora un orden desconocido y acota las páginas', () => {
    expect(leerParametrosCatalogo({ orden: 'precio' })?.orden).toBeUndefined();
    expect(leerParametrosCatalogo({ orden: 'novedades' })?.orden).toBe(
      'novedades',
    );
    expect(leerParametrosCatalogo({ pagina: '0' })?.paginas).toBe(1);
    expect(leerParametrosCatalogo({ pagina: '999' })?.paginas).toBe(
      MAXIMO_PAGINAS,
    );
    expect(leerParametrosCatalogo({ pagina: ['2', '5'] })?.paginas).toBe(2);
  });
});
