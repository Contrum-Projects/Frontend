import { describe, expect, it } from 'vitest';
import { errorDeApi } from '@/compartido/api/errores';
import { repartirErroresRegistro } from './erroresRegistro';

/** Un error como lo responde el backend: cada mensaje con su campo, o sin él. */
const error = (
  estado: number,
  errores: [campo: string | null, mensaje: string][],
) =>
  errorDeApi(
    {
      statusCode: estado,
      message: [...new Set(errores.map(([, mensaje]) => mensaje))],
      errores: errores.flatMap(([campo, mensaje]) =>
        campo ? [{ campo, mensaje }] : [],
      ),
    },
    new Response(null, { status: estado }),
  );

describe('repartirErroresRegistro (SCRUM-150)', () => {
  it('E1-H1 FE · cada mensaje va al campo que indica el backend', () => {
    expect(
      repartirErroresRegistro(
        error(400, [
          ['email', 'El correo no es válido.'],
          ['contrasena', 'La contraseña debe tener al menos 8 caracteres.'],
          ['confirmacionContrasena', 'Las contraseñas no coinciden.'],
        ]),
      ),
    ).toEqual({
      campos: {
        email: 'El correo no es válido.',
        contrasena: 'La contraseña debe tener al menos 8 caracteres.',
        confirmacionContrasena: 'Las contraseñas no coinciden.',
      },
      generales: [],
    });
  });

  it('E1-H1 FE · correo y RUT ya registrados: el mismo mensaje en los dos campos', () => {
    const mensaje = 'El correo y el RUT ya están registrados.';
    expect(
      repartirErroresRegistro(
        error(409, [
          ['email', mensaje],
          ['rut', mensaje],
        ]),
      ),
    ).toEqual({ campos: { email: mensaje, rut: mensaje }, generales: [] });
  });

  it('E1-H1 FE · un mensaje sin campo, o de un campo que no está en el formulario, es un aviso general', () => {
    expect(
      repartirErroresRegistro(
        error(400, [
          ['x', 'El campo «x» no se admite.'],
          [null, 'Intenta de nuevo.'],
        ]),
      ),
    ).toEqual({
      campos: {},
      generales: ['El campo «x» no se admite.', 'Intenta de nuevo.'],
    });
  });

  it('E1-H1 FE · con varios mensajes del mismo campo, se muestra el primero', () => {
    expect(
      repartirErroresRegistro(
        error(400, [
          ['nombre', 'El nombre es obligatorio.'],
          ['nombre', 'El nombre debe tener hasta 80 caracteres.'],
        ]),
      ).campos,
    ).toEqual({ nombre: 'El nombre es obligatorio.' });
  });
});
