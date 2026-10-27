import { describe, expect, it } from 'vitest';
import { repartirErrores } from './erroresRegistro';

describe('repartirErrores', () => {
  it('asigna cada mensaje del backend a su campo', () => {
    expect(
      repartirErrores([
        'El nombre es obligatorio.',
        'La contraseña debe tener al menos un número.',
        'La confirmación de la contraseña es obligatoria.',
        'El RUT no es válido.',
        'La fecha de nacimiento no puede ser futura.',
      ]),
    ).toEqual({
      campos: {
        nombre: 'El nombre es obligatorio.',
        contrasena: 'La contraseña debe tener al menos un número.',
        confirmacionContrasena:
          'La confirmación de la contraseña es obligatoria.',
        rut: 'El RUT no es válido.',
        fechaNacimiento: 'La fecha de nacimiento no puede ser futura.',
      },
      generales: [],
    });
  });

  it('el correo y el RUT repetidos marcan los dos campos', () => {
    expect(
      repartirErrores(['El correo y el RUT ya están registrados.']).campos,
    ).toEqual({
      email: 'El correo y el RUT ya están registrados.',
      rut: 'El correo y el RUT ya están registrados.',
    });
  });

  it('«El correo o el RUT» (registros simultáneos) marca los dos campos, y el RUT solo, el RUT', () => {
    expect(
      repartirErrores(['El correo o el RUT ya está registrado.']).campos,
    ).toEqual({
      email: 'El correo o el RUT ya está registrado.',
      rut: 'El correo o el RUT ya está registrado.',
    });
    expect(repartirErrores(['El RUT ya está registrado.']).campos).toEqual({
      rut: 'El RUT ya está registrado.',
    });
  });

  it('deja como aviso general lo que no es de un campo', () => {
    expect(repartirErrores(['El campo «x» no se admite.'])).toEqual({
      campos: {},
      generales: ['El campo «x» no se admite.'],
    });
  });

  it('con varios mensajes del mismo campo muestra el primero', () => {
    expect(
      repartirErrores([
        'La contraseña debe tener al menos 8 caracteres.',
        'La contraseña debe tener al menos un número.',
      ]).campos,
    ).toEqual({
      contrasena: 'La contraseña debe tener al menos 8 caracteres.',
    });
  });
});
