import { describe, expect, it } from 'vitest';
import { ErrorDeApi, errorDeApi, exigir, repartirErrores } from './errores';

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

  it('en un 429 sin mensaje propio no muestra el texto en inglés de Nest', () => {
    try {
      exigir({
        error: {
          statusCode: 429,
          message: 'ThrottlerException: Too Many Requests',
        },
        response: respuesta(429),
      });
    } catch (error) {
      expect((error as ErrorDeApi).message).toBe(
        'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
      );
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

describe('errores por campo (SCRUM-150)', () => {
  const conErrores = (estado: number, cuerpo: object) =>
    errorDeApi(cuerpo, respuesta(estado));

  it('SCRUM-150 · lee `errores` del cuerpo y conserva los mensajes de siempre', () => {
    const error = conErrores(409, {
      statusCode: 409,
      message: 'El correo y el RUT ya están registrados.',
      errores: [
        { campo: 'email', mensaje: 'El correo y el RUT ya están registrados.' },
        { campo: 'rut', mensaje: 'El correo y el RUT ya están registrados.' },
      ],
    });

    expect(error.mensajes).toEqual([
      'El correo y el RUT ya están registrados.',
    ]);
    expect(error.errores.map(({ campo }) => campo)).toEqual(['email', 'rut']);
  });

  it('SCRUM-150 · sin `errores`, o mal formado, no hay errores por campo', () => {
    expect(conErrores(400, { statusCode: 400, message: 'x' }).errores).toEqual(
      [],
    );
    expect(
      conErrores(400, {
        statusCode: 400,
        message: 'x',
        errores: [{ campo: 1 }],
      }).errores,
    ).toEqual([]);
    expect(
      conErrores(500, {
        statusCode: 500,
        message: 'x',
        errores: [{ campo: 'a', mensaje: 'b' }],
      }).errores,
    ).toEqual([]);
  });

  it('SCRUM-150 · reparte por el primer tramo del campo; lo que no se ubica queda como aviso general', () => {
    const error = conErrores(400, {
      statusCode: 400,
      message: [
        'La cantidad debe ser mayor que 0.',
        'El proveedor no existe.',
        'Otro.',
      ],
      errores: [
        {
          campo: 'detalles.0.cantidad',
          mensaje: 'La cantidad debe ser mayor que 0.',
        },
        { campo: 'proveedorId', mensaje: 'El proveedor no existe.' },
        { campo: 'desconocido', mensaje: 'Otro.' },
      ],
    });

    expect(
      repartirErrores(error, {
        detalles: 'formatos',
        proveedorId: 'proveedorId',
      }),
    ).toEqual({
      porCampo: [
        ['formatos', 'La cantidad debe ser mayor que 0.'],
        ['proveedorId', 'El proveedor no existe.'],
      ],
      generales: ['Otro.'],
    });
  });

  it('SCRUM-150 · una ruta completa en el mapa gana al primer tramo', () => {
    const error = conErrores(400, {
      statusCode: 400,
      message: 'Alguna categoría indicada no existe.',
      errores: [
        {
          campo: 'segmento.categorias',
          mensaje: 'Alguna categoría indicada no existe.',
        },
      ],
    });

    expect(
      repartirErrores(error, {
        segmento: 'tipos',
        'segmento.categorias': 'categorias',
      }).porCampo,
    ).toEqual([['categorias', 'Alguna categoría indicada no existe.']]);
  });
});
