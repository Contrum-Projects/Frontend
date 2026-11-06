import { type ErrorDeApi, repartirErrores } from '@/compartido/api/errores';
import type { CampoRegistro } from './esquemaRegistro';

/**
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150): son los
 * de `RegistrarCuentaDto` y `ActualizarDatosDto`, con los mismos nombres. «El correo y el RUT ya
 * están registrados.» llega en `email` y en `rut`.
 */
const CAMPOS_REGISTRO: Partial<Record<string, CampoRegistro>> = {
  nombre: 'nombre',
  apellido: 'apellido',
  email: 'email',
  contrasena: 'contrasena',
  confirmacionContrasena: 'confirmacionContrasena',
  telefono: 'telefono',
  rut: 'rut',
  fechaNacimiento: 'fechaNacimiento',
  genero: 'genero',
};

export interface ErroresRepartidos {
  /** El primer mensaje de cada campo. */
  campos: Partial<Record<CampoRegistro, string>>;
  /** Los que no son de un campo: se muestran como aviso general. */
  generales: string[];
}

export const repartirErroresRegistro = (
  error: ErrorDeApi,
): ErroresRepartidos => {
  const { porCampo, generales } = repartirErrores(error, CAMPOS_REGISTRO);
  const campos: ErroresRepartidos['campos'] = {};
  for (const [campo, mensaje] of porCampo) campos[campo] ??= mensaje;
  return { campos, generales };
};
