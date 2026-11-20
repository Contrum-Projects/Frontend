import { describe, expect, it } from 'vitest';
import { datosDelError, digestDe, rutaSinQuery } from './datosDelError';

describe('datosDelError', () => {
  it('SCRUM-168 FE · la traza no repite el mensaje del error', () => {
    const datos = datosDelError(new Error('correo ana@prueba.cl'));
    expect(datos.tipoError).toBe('Error');
    expect(datos.mensaje).toBe('correo ana@prueba.cl');
    expect(datos.traza ?? '').not.toContain('ana@prueba.cl');
  });

  it('SCRUM-168 FE · un valor que no es Error se registra igual', () => {
    expect(datosDelError('texto')).toEqual({
      tipoError: 'string',
      mensaje: 'Se lanzó un valor que no es un Error.',
    });
  });
});

describe('rutaSinQuery', () => {
  it('SCRUM-168 FE · quita la query, que puede llevar tokens', () => {
    expect(rutaSinQuery('/cuenta/confirmar?token=abc#x')).toBe(
      '/cuenta/confirmar',
    );
  });
});

describe('digestDe', () => {
  it('SCRUM-168 FE · lee el digest de Next solo si tiene un formato válido', () => {
    expect(digestDe({ digest: '2834719042' })).toBe('2834719042');
    expect(digestDe({ digest: 'NEXT_NOT_FOUND;x' })).toBeUndefined();
    expect(digestDe(new Error('x'))).toBeUndefined();
  });
});
