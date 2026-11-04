import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { PerfilProfesionalCuenta } from '@/compartido/api/respuestas';
import {
  esEspecialidad,
  esModalidad,
  type Especialidad,
  type Modalidad,
} from './opcionesPerfil';

/** Límites de `guardar-perfil-profesional.dto.ts` del backend (SCRUM-66). */
const MAXIMO_ANOS = 40;
const MAXIMO_LUGAR_TRABAJO = 150;
const MAXIMO_RED_SOCIAL = 255;

/**
 * Perfil profesional (E10-H5): lo obligatorio se señala antes de enviar. Qué enlaces de red
 * social valen lo decide el backend: su 400 se muestra junto al campo.
 */
export const esquemaPerfil = z.object({
  anosExperiencia: z
    .string()
    .trim()
    .min(1, 'Ingresa tus años de experiencia.')
    .regex(/^\d{1,2}$/, 'Ingresa un número entero de 0 a 40.')
    .transform(Number)
    .refine(
      (anos) => anos <= MAXIMO_ANOS,
      'Ingresa un número entero de 0 a 40.',
    ),
  // Sin elegir, react-hook-form deja `null` en un grupo de radios
  modalidad: z
    .string()
    .nullable()
    .transform((valor, contexto): Modalidad => {
      if (valor && esModalidad(valor)) return valor;
      contexto.addIssue({
        code: 'custom',
        message: 'Elige tu modalidad de trabajo.',
      });
      return z.NEVER;
    }),
  especialidades: z
    .array(z.string())
    .transform((valores): Especialidad[] => valores.filter(esEspecialidad))
    .refine(
      (valores) => valores.length > 0,
      'Elige al menos una especialidad.',
    ),
  nombreLugarTrabajo: z
    .string()
    .trim()
    .max(
      MAXIMO_LUGAR_TRABAJO,
      `El lugar de trabajo puede tener hasta ${MAXIMO_LUGAR_TRABAJO} caracteres.`,
    ),
  redSocial: z
    .string()
    .trim()
    .max(
      MAXIMO_RED_SOCIAL,
      `La red social puede tener hasta ${MAXIMO_RED_SOCIAL} caracteres.`,
    ),
});

export type FormularioPerfil = z.input<typeof esquemaPerfil>;
export type SalidaPerfil = z.output<typeof esquemaPerfil>;
export type CampoPerfil = keyof FormularioPerfil;

/** El perfil guardado como lo muestra el formulario; sin perfil, vacío. */
export const perfilAFormulario = (
  perfil: PerfilProfesionalCuenta | null,
): FormularioPerfil => ({
  anosExperiencia: perfil ? String(perfil.anosExperiencia) : '',
  modalidad: perfil?.modalidad ?? null,
  especialidades: perfil?.especialidades ?? [],
  nombreLugarTrabajo: perfil?.nombreLugarTrabajo ?? '',
  redSocial: perfil?.redSocial ?? '',
});

type CuerpoPerfil = components['schemas']['GuardarPerfilProfesionalDto'];

/**
 * Cuerpo de PUT /api/perfil-profesional/yo. Reemplaza el perfil entero: un opcional vacío va
 * como `null`. El Swagger declara los opcionales como `Record<string, never>`: por eso el cast.
 */
export const cuerpoPerfil = (datos: SalidaPerfil): CuerpoPerfil =>
  ({
    anosExperiencia: datos.anosExperiencia,
    modalidad: datos.modalidad,
    especialidades: datos.especialidades,
    nombreLugarTrabajo: datos.nombreLugarTrabajo || null,
    redSocial: datos.redSocial || null,
  }) as CuerpoPerfil;

/**
 * El backend responde el 400 como una lista de mensajes, sin decir el campo. Se reconocen por
 * cómo empiezan, según `guardar-perfil-profesional.dto.ts`.
 */
const INICIOS: [inicio: string, campo: CampoPerfil][] = [
  ['La cantidad de años de experiencia', 'anosExperiencia'],
  ['La modalidad de trabajo', 'modalidad'],
  ['Indica al menos una especialidad', 'especialidades'],
  ['Alguna especialidad', 'especialidades'],
  ['Cada especialidad', 'especialidades'],
  ['El lugar de trabajo', 'nombreLugarTrabajo'],
  ['La red social', 'redSocial'],
];

export const repartirErroresPerfil = (mensajes: string[]) => {
  const campos: Partial<Record<CampoPerfil, string>> = {};
  const generales: string[] = [];
  for (const mensaje of mensajes) {
    const campo = INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1];
    if (campo) campos[campo] ??= mensaje;
    else generales.push(mensaje);
  }
  return { campos, generales };
};
