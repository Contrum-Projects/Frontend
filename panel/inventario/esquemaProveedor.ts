import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import { normalizarRut } from '@/compartido/formato/rut';

type CuerpoProveedor = components['schemas']['CrearProveedorDto'];

/**
 * «Nuevo proveedor» (E11-H1). Repite las reglas de CrearProveedorDto del backend
 * (src/modulos/inventario/dto/crear-proveedor.dto.ts) solo para avisar antes de enviar; el
 * backend vuelve a validar. Contacto, teléfono y correo son opcionales.
 */
export const esquemaProveedor = z.object({
  razonSocial: z
    .string()
    .trim()
    .min(1, 'La razón social es obligatoria.')
    .max(150, 'La razón social no puede superar los 150 caracteres.'),
  rut: z
    .string()
    .trim()
    .min(1, 'El RUT es obligatorio.')
    .refine((rut) => normalizarRut(rut) !== null, 'El RUT no es válido.'),
  nombreContacto: z
    .string()
    .trim()
    .max(150, 'El nombre de contacto no puede superar los 150 caracteres.'),
  email: z
    .string()
    .trim()
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .refine(
      (email) => email === '' || z.email().safeParse(email).success,
      'El correo no es válido.',
    ),
  telefono: z
    .string()
    .trim()
    .max(20, 'El teléfono no puede superar los 20 caracteres.'),
});

export type FormularioProveedor = z.input<typeof esquemaProveedor>;
export type SalidaProveedor = z.output<typeof esquemaProveedor>;
export type CampoProveedor = keyof FormularioProveedor;

export const PROVEEDOR_VACIO: FormularioProveedor = {
  razonSocial: '',
  rut: '',
  nombreContacto: '',
  email: '',
  telefono: '',
};

/**
 * Cuerpo del POST: el RUT en formato único y los opcionales vacíos no se envían. El DTO tipa
 * los opcionales como objeto (falta el `type` en el Swagger): se convierte el cuerpo entero.
 */
export const cuerpoProveedor = ({
  rut,
  razonSocial,
  nombreContacto,
  email,
  telefono,
}: SalidaProveedor): CuerpoProveedor =>
  ({
    rut: normalizarRut(rut) ?? rut,
    razonSocial,
    ...(nombreContacto && { nombreContacto }),
    ...(email && { email }),
    ...(telefono && { telefono }),
  }) as CuerpoProveedor;

/**
 * El backend responde los errores como una lista de mensajes, sin decir a qué campo
 * pertenecen (400 de validación y 409 de RUT repetido). Se reconocen por cómo empiezan,
 * según CrearProveedorDto y proveedores.service.ts.
 */
const INICIOS: [inicio: string, campo: CampoProveedor][] = [
  ['La razón social', 'razonSocial'],
  ['El RUT', 'rut'],
  ['Ya existe un proveedor con ese RUT', 'rut'],
  ['El nombre de contacto', 'nombreContacto'],
  ['El correo', 'email'],
  ['El teléfono', 'telefono'],
];

/** El campo de un mensaje del backend, o `null` si no es de un campo. */
export const campoDelError = (mensaje: string): CampoProveedor | null =>
  INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
