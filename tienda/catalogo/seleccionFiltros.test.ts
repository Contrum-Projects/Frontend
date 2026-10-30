import { describe, expect, it } from 'vitest';
import { categoria } from './apiDePrueba';
import {
  alternarCategoria,
  alternarMarca,
  contarFiltros,
} from './seleccionFiltros';

const ARBOL = [
  categoria(1, 'Shampoo', [
    categoria(2, 'Reparación', [categoria(9, 'Puntas')]),
    categoria(3, 'Hidratación'),
  ]),
  categoria(5, 'Acondicionador'),
];
const VACIA = { categoriaIds: [], marcaIds: [] };

describe('selección de filtros', () => {
  it('E2-H2 FE · marca y desmarca varias categorías y marcas', () => {
    const conDos = alternarCategoria(
      ARBOL,
      alternarCategoria(ARBOL, VACIA, 1),
      5,
    );
    expect(conDos.categoriaIds).toEqual([1, 5]);
    expect(alternarCategoria(ARBOL, conDos, 1).categoriaIds).toEqual([5]);

    const conMarcas = alternarMarca(alternarMarca(VACIA, 4), 7);
    expect(conMarcas.marcaIds).toEqual([4, 7]);
    expect(alternarMarca(conMarcas, 4).marcaIds).toEqual([7]);
    expect(contarFiltros({ ...conDos, ...{ marcaIds: [4, 7] } })).toBe(4);
  });

  it('marcar una subcategoría desmarca sus categorías superiores, y al revés', () => {
    const conPadre = { categoriaIds: [1, 5], marcaIds: [] };
    expect(alternarCategoria(ARBOL, conPadre, 9).categoriaIds).toEqual([5, 9]);

    const conHijas = { categoriaIds: [2, 3, 5], marcaIds: [] };
    expect(alternarCategoria(ARBOL, conHijas, 1).categoriaIds).toEqual([5, 1]);
  });
});
