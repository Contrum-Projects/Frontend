import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import { normalizarRut } from '@/compartido/formato/rut';

/** Opciones de género (decisión del equipo, 26-10-2026). Se envía el texto tal cual. */
export const GENEROS = [
  'Femenino',
  'Masculino',
  'Otro',
  'Prefiero no decir',
] as const;

/** Campo opcional: vacío o solo espacios cuenta como no escrito. */
const opcional = (maximo: number, etiqueta: string) =>
  z
    .string()
    .trim()
    .max(maximo, `${etiqueta} no puede superar los ${maximo} caracteres.`);

/**
 * Formulario de registro (E1-H1). Repite las reglas del DTO del backend
 * (src/modulos/cuentas/dto/registrar-cuenta.dto.ts) solo para avisar antes de enviar; el
 * backend vuelve a validar todo.
 */
export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'Escribe tu nombre.')
      .max(100, 'El nombre no puede superar los 100 caracteres.'),
    apellido: z
      .string()
      .trim()
      .min(1, 'Escribe tu apellido.')
      .max(100, 'El apellido no puede superar los 100 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'Escribe tu correo.')
      .max(254, 'El correo no puede superar los 254 caracteres.')
      .pipe(z.email('Escribe un correo válido.')),
    contrasena: z
      .string()
      .min(1, 'Escribe una contraseña.')
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(128, 'La contraseña no puede superar los 128 caracteres.')
      .regex(/\p{L}/u, 'La contraseña debe tener al menos una letra.')
      .regex(/\d/, 'La contraseña debe tener al menos un número.'),
    confirmacionContrasena: z.string().min(1, 'Repite tu contraseña.'),
    telefono: opcional(20, 'El teléfono'),
    rut: z
      .string()
      .trim()
      .refine(
        (rut) => rut === '' || normalizarRut(rut) !== null,
        'El RUT no es válido.',
      ),
    fechaNacimiento: z.string(),
    genero: z.union([z.literal(''), z.enum(GENEROS)]),
  })
  .refine((datos) => datos.contrasena === datos.confirmacionContrasena, {
    path: ['confirmacionContrasena'],
    message: 'Las contraseñas no coinciden.',
  });

export type DatosRegistro = z.input<typeof esquemaRegistro>;
export type CampoRegistro = keyof DatosRegistro;

export const REGISTRO_VACIO: DatosRegistro = {
  nombre: '',
  apellido: '',
  email: '',
  contrasena: '',
  confirmacionContrasena: '',
  telefono: '',
  rut: '',
  fechaNacimiento: '',
  genero: '',
};

type CuerpoRegistro = components['schemas']['RegistrarCuentaDto'];

/**
 * Cuerpo de POST /api/cuentas/registro, sin los opcionales vacíos y con el RUT en formato
 * único. El Swagger declara los opcionales como `Record<string, never>` (les falta
 * `type: String` en el DTO): por eso el cast. La casilla de ofertas no se envía porque el
 * DTO todavía no la recibe.
 */
export const cuerpoRegistro = (
  datos: z.output<typeof esquemaRegistro>,
): CuerpoRegistro => {
  const opcionales = {
    telefono: datos.telefono || undefined,
    rut: datos.rut ? (normalizarRut(datos.rut) ?? datos.rut) : undefined,
    fechaNacimiento: datos.fechaNacimiento || undefined,
    genero: datos.genero || undefined,
  };
  return {
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    contrasena: datos.contrasena,
    confirmacionContrasena: datos.confirmacionContrasena,
    ...(opcionales as Partial<CuerpoRegistro>),
  };
};
