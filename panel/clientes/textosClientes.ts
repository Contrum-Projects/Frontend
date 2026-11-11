import type { Route } from 'next';
import { z } from 'zod';
import type { ClienteListado } from './consultasClientes';

export const RUTA_CLIENTES: Route = '/panel/clientes';

export const rutaCliente = (codigoPublico: string) =>
  `/panel/clientes/${codigoPublico}` as Route;

export const nombreCompleto = (
  cuenta: Pick<ClienteListado, 'nombre' | 'apellido'>,
) => `${cuenta.nombre} ${cuenta.apellido}`;

const NOMBRE_ROL: Record<string, string> = {
  cliente: 'Cliente',
  profesional: 'Profesional',
  vendedor: 'Vendedor',
  bodeguero: 'Bodeguero',
  administrador: 'Administrador',
};

/** El nombre del rol para mostrar; el historial puede traer roles del personal. */
export const nombreDelRol = (rol: string): string => NOMBRE_ROL[rol] ?? rol;

/**
 * Motivo para quitar el rol profesional. Repite las reglas de `CambiarRolDto` del backend
 * (`src/modulos/personal/dto/cambiar-rol.dto.ts`: se recorta, de 10 a 1000) solo para avisar antes
 * de enviar; el backend vuelve a validar.
 */
export const MINIMO_MOTIVO_ROL = 10;
export const MAXIMO_MOTIVO_ROL = 1000;

export const esquemaPasarACliente = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, 'El motivo es obligatorio al quitar el rol profesional.')
    .min(
      MINIMO_MOTIVO_ROL,
      `El motivo debe tener al menos ${MINIMO_MOTIVO_ROL} caracteres.`,
    )
    .max(
      MAXIMO_MOTIVO_ROL,
      `El motivo no puede superar los ${MAXIMO_MOTIVO_ROL} caracteres.`,
    ),
});

export type FormularioPasarACliente = z.input<typeof esquemaPasarACliente>;
