import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type {
  OrigenDescripcion,
  ProductoPanel,
} from '@/compartido/api/respuestas';

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
};

export const productoAFormulario = (
  producto: ProductoPanel,
): FormularioProducto => ({
  nombre: producto.nombre,
  marcaId: producto.marca ? String(producto.marca.id) : '',
  categoriaId: String(producto.categoria.id),
  exclusivo: producto.canalVenta === 'profesional',
  descripcion: producto.descripcion,
});

/** Cuerpo de POST (nuevo) y PATCH (edición): siempre se envían todos los datos. */
export const cuerpoProducto = (
  datos: SalidaProducto,
): components['schemas']['CrearProductoDto'] => ({
  nombre: datos.nombre,
  descripcion: datos.descripcion,
  marcaId: Number(datos.marcaId),
  categoriaId: Number(datos.categoriaId),
  canalVenta: datos.exclusivo ? 'profesional' : 'general',
});

/**
 * El backend responde los errores como una lista de mensajes, sin decir a qué campo
 * pertenecen. Se reconocen por cómo empiezan, según CrearProductoDto y productos.service.ts
 * («La marca está desactivada.», «La categoría no existe.»…).
 */
const INICIOS_PRODUCTO: [inicio: string, campo: CampoProducto][] = [
  ['El nombre', 'nombre'],
  ['La descripción', 'descripcion'],
  ['La marca', 'marcaId'],
  ['La categoría', 'categoriaId'],
  ['El canal de venta', 'exclusivo'],
];

/** El campo de un mensaje del backend, o `null` si no es de un campo. */
export const campoDelErrorProducto = (mensaje: string): CampoProducto | null =>
  INICIOS_PRODUCTO.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;

/** Origen de la descripción, como en Figma (P3a 2039:1120). */
export const ORIGENES: Record<
  OrigenDescripcion,
  { texto: string; ia: boolean }
> = {
  manual: { texto: 'Manual', ia: false },
  ia: { texto: 'IA', ia: true },
  ia_editada: { texto: 'IA editada', ia: true },
};
