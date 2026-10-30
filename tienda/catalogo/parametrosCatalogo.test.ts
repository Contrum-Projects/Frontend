import { describe, expect, it } from 'vitest';
import {
  leerParametrosCatalogo,
  MAXIMO_BUSQUEDA,
  MAXIMO_PAGINAS,
} from './parametrosCatalogo';

describe('leerParametrosCatalogo()', () => {
  it('E2-H1 FE · lee la categoría y la marca elegidas de la URL', () => {
    expect(leerParametrosCatalogo({ categoria: '3', marca: '7' })).toEqual({
      buscar: undefined,
      categoriaIds: [3],
      marcaIds: [7],
      orden: undefined,
      paginas: 1,
    });
  });

  it('E2-H2 FE · resultados: lee el texto buscado y varias categorías y marcas', () => {
    expect(
      leerParametrosCatalogo({
        q: '  reparador ',
        categoria: ['3', '5', '3'],
        marca: ['7', '9'],
      }),
    ).toMatchObject({
      buscar: 'reparador',
      categoriaIds: [3, 5],
      marcaIds: [7, 9],
    });
  });

  it('una búsqueda vacía o solo con espacios no busca; una muy larga se acorta', () => {
    expect(leerParametrosCatalogo({ q: '   ' })?.buscar).toBeUndefined();
    expect(leerParametrosCatalogo({ q: 'a'.repeat(150) })?.buscar).toHaveLength(
      MAXIMO_BUSQUEDA,
    );
  });

  it('sin filtros es el catálogo completo, en la primera página', () => {
    expect(leerParametrosCatalogo({})).toEqual({
      buscar: undefined,
      categoriaIds: [],
      marcaIds: [],
      orden: undefined,
      paginas: 1,
    });
  });

  it('un id mal escrito no es una categoría ni una marca (404)', () => {
    expect(leerParametrosCatalogo({ categoria: 'abc' })).toBeNull();
    expect(leerParametrosCatalogo({ marca: '-2' })).toBeNull();
    expect(leerParametrosCatalogo({ categoria: '0' })).toBeNull();
    expect(leerParametrosCatalogo({ categoria: ['3', 'x'] })).toBeNull();
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
