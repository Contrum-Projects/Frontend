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
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). Un
 * mensaje sin campo, o de un campo que no está aquí, se muestra como aviso general.
 */
export const CAMPOS_PERSONAL: Partial<Record<string, CampoPersonal>> = {
  nombre: 'nombre',
  apellido: 'apellido',
  email: 'email',
  rol: 'rol',
};
