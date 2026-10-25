import { describe, expect, it } from 'vitest';
import { ErrorDeApi, exigir } from './errores';

const respuesta = (status: number, cabeceras: Record<string, string> = {}) =>
  new Response(null, { status, headers: cabeceras });

describe('exigir()', () => {
  it('devuelve los datos de una respuesta exitosa', () => {
    expect(
      exigir<number[]>({ data: [1, 2], response: respuesta(200) }),
    ).toEqual([1, 2]);
  });

  it('lleva los mensajes de validación del backend (lista) al error', () => {
    const intento = () =>
      exigir({
        error: {
          statusCode: 400,
          message: ['El correo no es válido.', 'La contraseña es obligatoria.'],
        },
        response: respuesta(400),
      });
    expect(intento).toThrow(ErrorDeApi);
    expect(intento).toThrow('El correo no es válido.');
    try {
      intento();
    } catch (error) {
      expect((error as ErrorDeApi).mensajes).toHaveLength(2);
    }
  });

  it('en un 429 conserva cuánto esperar (Retry-After)', () => {
    try {
      exigir({
        error: { statusCode: 429, message: 'Demasiados intentos.' },
        response: respuesta(429, { 'retry-after': '120' }),
      });
    } catch (error) {
      expect(error).toMatchObject({ estado: 429, esperarSegundos: 120 });
    }
  });

  it('no muestra el detalle de un error 500', () => {
    expect(() =>
      exigir({
        error: { statusCode: 500, message: 'TypeError: x is undefined' },
        response: respuesta(500),
      }),
    ).toThrow(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
  });
});
