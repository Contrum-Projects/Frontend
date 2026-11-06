import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { CategoriaTienda } from '@/compartido/api/respuestas';

/**
 * «Nueva marca» (E3-H4). Repite el largo de CrearMarcaDto del backend
 * (src/modulos/catalogo/dto/crear-marca.dto.ts) solo para avisar antes de enviar; si la marca
 * ya existe lo decide el backend.
 */
export const esquemaMarca = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre de la marca.')
    .max(100, 'El nombre de la marca no puede superar los 100 caracteres.'),
});

export type FormularioMarca = z.input<typeof esquemaMarca>;
export type SalidaMarca = z.output<typeof esquemaMarca>;

/**
 * Valor del selector para «sin categoría padre»: el Select de shadcn no acepta opciones con
 * valor vacío.
 */
export const SIN_PADRE = 'sin-padre';

/**
 * Categoría nueva o editada (E3-H4), con los largos de CrearCategoriaDto y
 * ActualizarCategoriaDto. Los ciclos los rechaza el backend.
 */
export const esquemaCategoria = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre de la categoría.')
    .max(100, 'El nombre de la categoría no puede superar los 100 caracteres.'),
  descripcion: z
    .string()
    .trim()
    .max(255, 'La descripción no puede superar los 255 caracteres.'),
  padreId: z.string(),
});

export type FormularioCategoria = z.input<typeof esquemaCategoria>;
export type SalidaCategoria = z.output<typeof esquemaCategoria>;
export type CampoCategoria = keyof FormularioCategoria;

export const CATEGORIA_VACIA: FormularioCategoria = {
  nombre: '',
  descripcion: '',
  padreId: SIN_PADRE,
};

export const categoriaAFormulario = (
  categoria: CategoriaTienda,
): FormularioCategoria => ({
  nombre: categoria.nombre,
  descripcion: categoria.descripcion ?? '',
  padreId: categoria.padreId === null ? SIN_PADRE : String(categoria.padreId),
});

const padreDe = (datos: SalidaCategoria) =>
  datos.padreId === SIN_PADRE ? null : Number(datos.padreId);

/**
 * Cuerpo de POST (nueva) y PATCH (edición). El Swagger declara `descripcion` y `padreId` del
 * PATCH como `Record<string, never>`: por eso el cast.
 */
export const cuerpoNuevaCategoria = (datos: SalidaCategoria) =>
  ({
    nombre: datos.nombre,
    ...(datos.descripcion && { descripcion: datos.descripcion }),
    ...(padreDe(datos) !== null && { padreId: padreDe(datos) }),
  }) as components['schemas']['CrearCategoriaDto'];

/** Al editar, una descripción vacía o «sin categoría padre» se envían como `null` (se quitan). */
export const cuerpoEdicionCategoria = (datos: SalidaCategoria) =>
  ({
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    padreId: padreDe(datos),
  }) as components['schemas']['ActualizarCategoriaDto'];

export interface OpcionCategoria {
  id: number;
  /** Ruta desde la raíz: «Shampoo › Reparación». */
  ruta: string;
}

/** El árbol en una lista, en orden, para elegir la categoría padre. */
export const opcionesDeCategoria = (
  arbol: CategoriaTienda[],
  antes: string[] = [],
): OpcionCategoria[] =>
  arbol.flatMap((categoria) => {
    const ruta = [...antes, categoria.nombre];
    return [
      { id: categoria.id, ruta: ruta.join(' › ') },
      ...opcionesDeCategoria(categoria.subcategorias, ruta),
    ];
  });

/**
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). Un
 * mensaje sin campo, o de un campo que no está aquí, se muestra como aviso general.
 */
export const CAMPOS_CATEGORIA: Partial<Record<string, CampoCategoria>> = {
  nombre: 'nombre',
  descripcion: 'descripcion',
  padreId: 'padreId',
};

/** El único campo de la marca: «El nombre de la marca…» (400) y «Ya existe una marca…» (409). */
export const CAMPOS_MARCA: Partial<Record<string, 'nombre'>> = {
  nombre: 'nombre',
};
