import type { CampoRegistro } from './esquemaRegistro';

/**
 * El backend responde los errores del registro como una lista de mensajes, sin decir a qué
 * campo pertenecen (400 de validación y 409 de correo o RUT repetido). Se reconocen por cómo
 * empiezan, según los mensajes de src/modulos/cuentas/cuentas.service.ts y de
 * src/common/validacion/. Si el backend agrega el campo al error, esto se reemplaza.
 */
const INICIOS: [inicio: string, campos: CampoRegistro[]][] = [
  ['El correo y el RUT', ['email', 'rut']],
  // Dos registros simultáneos con el mismo dato: el backend no dice cuál
  ['El correo o el RUT', ['email', 'rut']],
  ['Las contraseñas no coinciden', ['confirmacionContrasena']],
  ['La confirmación de la contraseña', ['confirmacionContrasena']],
  ['La contraseña', ['contrasena']],
  ['El nombre', ['nombre']],
  ['El apellido', ['apellido']],
  ['El correo', ['email']],
  ['El teléfono', ['telefono']],
  ['El RUT', ['rut']],
  ['La fecha de nacimiento', ['fechaNacimiento']],
  ['El género', ['genero']],
];

export interface ErroresRepartidos {
  /** El primer mensaje de cada campo. */
  campos: Partial<Record<CampoRegistro, string>>;
  /** Los que no son de un campo: se muestran como aviso general. */
  generales: string[];
}

export const repartirErrores = (mensajes: string[]): ErroresRepartidos => {
  const campos: ErroresRepartidos['campos'] = {};
  const generales: string[] = [];
  for (const mensaje of mensajes) {
    const coincidencia = INICIOS.find(([inicio]) => mensaje.startsWith(inicio));
    if (!coincidencia) {
      generales.push(mensaje);
      continue;
    }
    for (const campo of coincidencia[1]) campos[campo] ??= mensaje;
  }
  return { campos, generales };
};
