import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type {
  OrigenDescripcion,
  ProductoPanel,
} from '@/compartido/api/respuestas';

/** `LARGO_MAXIMO_INGREDIENTES_IA` de src/modulos/catalogo/cliente-ia.ts del backend. */
const MAXIMO_INGREDIENTES = 3000;

/**
 * Producto nuevo o editado (E3-H1). Repite los largos y los mensajes de CrearProductoDto del
 * backend (src/modulos/catalogo/dto/crear-producto.dto.ts) solo para marcar lo que falta antes
 * de enviar; si la marca está activa o la categoría existe lo decide el backend.
 */
export const esquemaProducto = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre del producto es obligatorio.')
    .max(200, 'El nombre del producto no puede superar los 200 caracteres.'),
  marcaId: z.string().min(1, 'La marca del producto es obligatoria.'),
  categoriaId: z.string().min(1, 'La categoría del producto es obligatoria.'),
  exclusivo: z.boolean(),
  descripcion: z
    .string()
    .trim()
    .min(1, 'La descripción del producto es obligatoria.')
    .max(
      5000,
      'La descripción del producto no puede superar los 5000 caracteres.',
    ),
  /** Opcional (E4-H2): vacío se guarda como `null`, y en una edición borra la lista. */
  ingredientes: z
    .string()
    .trim()
    .max(
      MAXIMO_INGREDIENTES,
      `La lista de ingredientes no puede superar los ${MAXIMO_INGREDIENTES} caracteres.`,
    ),
});

export type FormularioProducto = z.input<typeof esquemaProducto>;
export type SalidaProducto = z.output<typeof esquemaProducto>;
export type CampoProducto = keyof FormularioProducto;

export const PRODUCTO_VACIO: FormularioProducto = {
  nombre: '',
  marcaId: '',
  categoriaId: '',
  exclusivo: false,
  descripcion: '',
  ingredientes: '',
};

export const productoAFormulario = (
  producto: ProductoPanel,
): FormularioProducto => ({
  nombre: producto.nombre,
  marcaId: producto.marca ? String(producto.marca.id) : '',
  categoriaId: String(producto.categoria.id),
  exclusivo: producto.canalVenta === 'profesional',
  descripcion: producto.descripcion,
  ingredientes: producto.ingredientes ?? '',
});

/** La sugerencia de la IA de la que partió la descripción (E4-H2), con su firma. */
export type SugerenciaUsada = components['schemas']['SugerenciaUsadaDto'];

type CuerpoProducto = Omit<
  components['schemas']['CrearProductoDto'],
  'ingredientes'
> & { ingredientes: string | null };

/**
 * Cuerpo de POST (nuevo) y PATCH (edición): siempre se envían todos los datos. Con la
 * sugerencia de la que partió la descripción, el backend decide el origen (igual: «ia»;
 * cambiada: «ia_editada»); sin ella, «manual» (E4-H2).
 */
export const cuerpoProducto = (
  datos: SalidaProducto,
  sugerencia: SugerenciaUsada | null,
): components['schemas']['CrearProductoDto'] => {
  const cuerpo: CuerpoProducto = {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    ...(sugerencia && { sugerencia }),
    ingredientes: datos.ingredientes || null,
    marcaId: Number(datos.marcaId),
    categoriaId: Number(datos.categoriaId),
    canalVenta: datos.exclusivo ? 'profesional' : 'general',
  };
  // El Swagger declara `ingredientes` como objeto (falta `type: String` en el DTO del
  // backend); el DTO recibe un texto o `null`
  return cuerpo as unknown as components['schemas']['CrearProductoDto'];
};

/**
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). Un
 * mensaje sin campo, o de un campo que no está aquí, se muestra como aviso general.
 */
export const CAMPOS_PRODUCTO: Partial<Record<string, CampoProducto>> = {
  nombre: 'nombre',
  descripcion: 'descripcion',
  ingredientes: 'ingredientes',
  marcaId: 'marcaId',
  categoriaId: 'categoriaId',
  canalVenta: 'exclusivo',
};

/** Origen de la descripción, como en Figma (P3a 2039:1120). */
export const ORIGENES: Record<
  OrigenDescripcion,
  { texto: string; ia: boolean }
> = {
  manual: { texto: 'Manual', ia: false },
  ia: { texto: 'IA', ia: true },
  ia_editada: { texto: 'IA editada', ia: true },
};
