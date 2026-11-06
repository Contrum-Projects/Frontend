import { describe, expect, it } from 'vitest';
import { textoSegmento } from './textoSegmento';

const NOMBRES = {
  categorias: new Map([[3, 'Coloración']]),
  marcas: new Map([[7, "L'Oréal"]]),
};

describe('textoSegmento (SCRUM-150)', () => {
  it('E12-H3 FE · nombra los tipos de destinatario del segmento', () => {
    expect(
      textoSegmento(
        { tipos: ['profesional'], categorias: [], marcas: [] },
        NOMBRES,
      ),
    ).toBe('Profesionales');
    expect(
      textoSegmento(
        {
          tipos: ['cliente', 'profesional', 'suscriptor'],
          categorias: [],
          marcas: [],
        },
        NOMBRES,
      ),
    ).toBe('Clientes, Profesionales y Suscriptores sin cuenta');
  });

  it('E12-H3 FE · con categorías o marcas, dice dónde compraron', () => {
    expect(
      textoSegmento(
        { tipos: ['cliente'], categorias: [3], marcas: [7] },
        NOMBRES,
      ),
    ).toBe("Clientes · compraron en Coloración o L'Oréal");
  });

  it('E12-H3 FE · una categoría o marca que no está en la lista se nombra por su id', () => {
    expect(
      textoSegmento(
        { tipos: ['cliente'], categorias: [9], marcas: [] },
        NOMBRES,
      ),
    ).toBe('Clientes · compraron en la categoría 9');
  });
});
