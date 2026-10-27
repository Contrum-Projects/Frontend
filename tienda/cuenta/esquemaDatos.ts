import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { DatosPersonales } from '@/compartido/api/respuestas';
import { formatearRut, normalizarRut } from '@/compartido/formato/rut';
import { camposPersonales, GENEROS } from './esquemaRegistro';

/** «Mis datos» (E1-H5): los datos personales del registro, sin el correo (no se edita). */
export const esquemaDatos = z.object(camposPersonales);

export type FormularioDatos = z.input<typeof esquemaDatos>;
export type SalidaDatos = z.output<typeof esquemaDatos>;
export type CampoDatos = keyof FormularioDatos;

const esGenero = (valor: string): valor is (typeof GENEROS)[number] =>
  (GENEROS as readonly string[]).includes(valor);

/** Lo que entrega la API, como lo muestra el formulario (los vacíos en `''`). */
export const datosAFormulario = (datos: DatosPersonales): FormularioDatos => ({
  nombre: datos.nombre,
  apellido: datos.apellido,
  telefono: datos.telefono ?? '',
  rut: datos.rut ? formatearRut(datos.rut) : '',
  fechaNacimiento: datos.fechaNacimiento ?? '',
  // Un género fuera de la lista no se muestra, pero tampoco se borra: solo se envía si cambia
  genero: datos.genero && esGenero(datos.genero) ? datos.genero : '',
});

type CuerpoDatos = components['schemas']['ActualizarDatosDto'];

/**
 * Cuerpo de PATCH /api/cuentas/yo con solo los campos que cambiaron: el backend guarda solo
 * lo enviado, y un opcional vacío va como `null` para borrarlo. El RUT va en formato único.
 * El Swagger declara los opcionales como `Record<string, never>`: por eso el cast.
 */
export const cuerpoDatos = (
  datos: SalidaDatos,
  cambiados: Partial<Record<CampoDatos, boolean | undefined>>,
): CuerpoDatos => {
  const valores: Record<CampoDatos, string | null> = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    telefono: datos.telefono || null,
    rut: datos.rut ? (normalizarRut(datos.rut) ?? datos.rut) : null,
    fechaNacimiento: datos.fechaNacimiento || null,
    genero: datos.genero || null,
  };
  const cuerpo = Object.fromEntries(
    Object.entries(valores).filter(([campo]) => cambiados[campo as CampoDatos]),
  );
  return cuerpo as CuerpoDatos;
};
