import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import { ROLES, type Rol } from '@/compartido/sesion/roles';

/** Roles que se pueden asignar, en el orden de Figma (P8a 2049:2176), con su descripción. */
export const ROLES_ASIGNABLES: readonly {
  rol: Rol;
  nombre: string;
  descripcion: string;
}[] = [
  {
    rol: ROLES.VENDEDOR,
    nombre: 'Vendedor',
    descripcion: 'Atiende pedidos y clientes.',
  },
  {
    rol: ROLES.BODEGUERO,
    nombre: 'Bodeguero',
    descripcion: 'Gestiona inventario y recibe avisos de stock bajo.',
  },
  {
    rol: ROLES.ADMINISTRADOR,
    nombre: 'Administrador',
    descripcion: 'Acceso completo, reportes y personal.',
  },
];

/** El nombre del rol para mostrar («Vendedor»). */
export const nombreDelRol = (rol: Rol): string =>
  ROLES_ASIGNABLES.find((opcion) => opcion.rol === rol)?.nombre ?? rol;

type CuerpoPersonal = components['schemas']['CrearPersonalDto'];

/**
 * «Nueva cuenta de personal» (E13-H1). Repite las reglas de CrearPersonalDto del backend
 * (src/modulos/personal/dto/crear-personal.dto.ts) solo para avisar antes de enviar; el
 * backend vuelve a validar.
 */
export const esquemaPersonal = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  apellido: z
    .string()
    .trim()
    .min(1, 'Escribe el apellido.')
    .max(100, 'El apellido no puede superar los 100 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'Escribe el correo.')
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .pipe(z.email('Escribe un correo válido.')),
  rol: z
    .string()
    .refine(
      (rol) => ROLES_ASIGNABLES.some((opcion) => opcion.rol === rol),
      'Elige un rol.',
    ),
});

export type FormularioPersonal = z.input<typeof esquemaPersonal>;
export type SalidaPersonal = z.output<typeof esquemaPersonal>;
export type CampoPersonal = keyof FormularioPersonal;

export const PERSONAL_VACIO: FormularioPersonal = {
  nombre: '',
  apellido: '',
  email: '',
  rol: '',
};

export const cuerpoPersonal = (datos: SalidaPersonal): CuerpoPersonal => ({
  ...datos,
  rol: datos.rol as CuerpoPersonal['rol'],
});

/**
 * El backend responde los errores como una lista de mensajes, sin decir a qué campo
 * pertenecen (400 de validación y 409 de correo registrado). Se reconocen por cómo empiezan,
 * según CrearPersonalDto y personal.service.ts.
 */
const INICIOS: [inicio: string, campo: CampoPersonal][] = [
  ['El nombre', 'nombre'],
  ['El apellido', 'apellido'],
  ['El correo', 'email'],
  ['El rol', 'rol'],
];

/** El campo de un mensaje del backend, o `null` si no es de un campo. */
export const campoDelError = (mensaje: string): CampoPersonal | null =>
  INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
