import { describe, expect, it } from 'vitest';
import { FILTROS_VACIOS } from './esquemaCampana';
import { textoSegmento } from './textoSegmento';

const NOMBRES = {
  categorias: new Map([[3, 'Coloración']]),
  marcas: new Map([[7, "L'Oréal"]]),
};

describe('textoSegmento (SCRUM-150)', () => {
  it('E12-H3 FE · nombra los tipos de destinatario del segmento', () => {
    expect(
      textoSegmento(
        {
          ...FILTROS_VACIOS,
          tipos: ['profesional'],
          categorias: [],
          marcas: [],
        },
        NOMBRES,
      ),
    ).toBe('Profesionales');
    expect(
      textoSegmento(
        {
          ...FILTROS_VACIOS,
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
        { ...FILTROS_VACIOS, tipos: ['cliente'], categorias: [3], marcas: [7] },
        NOMBRES,
      ),
    ).toBe("Clientes · compraron en Coloración o L'Oréal");
  });

  it('E12-H3 FE · una categoría o marca que no está en la lista se nombra por su id', () => {
    expect(
      textoSegmento(
        { ...FILTROS_VACIOS, tipos: ['cliente'], categorias: [9], marcas: [] },
        NOMBRES,
      ),
    ).toBe('Clientes · compraron en la categoría 9');
  });

  it('SCRUM-150 · los filtros de cuenta se resumen en el orden del formulario', () => {
    expect(
      textoSegmento(
        {
          ...FILTROS_VACIOS,
          tipos: ['cliente'],
          categorias: [],
          marcas: [],
          compraEnUltimosDias: 30,
          pedidosMinimo: 2,
          gastoMinimo: 50000,
          gastoMaximo: 100000,
          regiones: ['13'],
          comunas: ['05101', '05109'],
          mesesCumpleanos: [11],
          edadMaxima: 40,
          generos: ['Femenino'],
          registroHaceMasDias: 1,
          conCarrito: true,
        },
        NOMBRES,
      ),
    ).toBe(
      'Clientes · compraron en los últimos 30 días · desde 2 pedidos · gastaron de $50.000 a $100.000 · en 1 región y 2 comunas · cumpleaños en 1 mes · hasta 40 años · Femenino · cuenta de hace más de 1 día · con productos en el carrito',
    );
  });
});
