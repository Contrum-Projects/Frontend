import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type {
  ComponentePackPanel,
  PackPanel,
} from '@/compartido/api/respuestas';

/**
 * Pack nuevo o editado (E3-H6). Repite los largos, los límites y los mensajes de CrearPackDto
 * del backend (src/modulos/catalogo/dto/crear-pack.dto.ts) solo para marcar lo que falta antes
 * de enviar; si cada componente es un formato activo (y no otro pack) lo decide el backend.
 */

/** MAXIMO_CANTIDAD_COMPONENTE, MAXIMO_COMPONENTES_PACK y MINIMO_UNIDADES_PACK del backend. */
const MAXIMO_CANTIDAD = 99;
const MAXIMO_COMPONENTES = 20;
const MINIMO_UNIDADES = 2;

/** Lo que la tabla muestra de cada formato del pack, venga de la búsqueda o del pack guardado. */
export type FormatoDelPack = Omit<ComponentePackPanel, 'cantidad'>;

const esCantidad = (valor: string) =>
  /^\d+$/.test(valor.trim()) &&
  Number(valor) >= 1 &&
  Number(valor) <= MAXIMO_CANTIDAD;

const MENSAJE_CANTIDAD = `La cantidad del componente debe ser un número entero mayor que 0 y hasta ${MAXIMO_CANTIDAD}.`;

const fecha = z
  .string()
  .refine((valor) => valor === '' || /^\d{4}-\d{2}-\d{2}$/.test(valor));

export const esquemaPack = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'El nombre del pack es obligatorio.')
      .max(200, 'El nombre del pack no puede superar los 200 caracteres.'),
    sku: z
      .string()
      .trim()
      .min(1, 'El SKU es obligatorio.')
      .regex(
        /^[\x21-\x7E]{1,50}$/,
        'El SKU debe tener hasta 50 caracteres, sin espacios, tildes ni símbolos especiales.',
      ),
    fechaInicioVigencia: fecha,
    fechaFinVigencia: fecha,
    exclusivo: z.boolean(),
    descripcion: z
      .string()
      .trim()
      .min(1, 'La descripción del pack es obligatoria.')
      .max(
        5000,
        'La descripción del pack no puede superar los 5000 caracteres.',
      ),
    componentes: z
      .array(
        z.object({
          formato: z.custom<FormatoDelPack>(),
          cantidad: z.string().trim().refine(esCantidad, MENSAJE_CANTIDAD),
        }),
      )
      .min(1, 'Indica los formatos del pack.')
      .max(
        MAXIMO_COMPONENTES,
        `Un pack tiene hasta ${MAXIMO_COMPONENTES} formatos distintos.`,
      )
      .refine(
        (lista) =>
          lista.some(({ cantidad }) => !esCantidad(cantidad)) ||
          lista.reduce((suma, { cantidad }) => suma + Number(cantidad), 0) >=
            MINIMO_UNIDADES,
        `Un pack debe sumar al menos ${MINIMO_UNIDADES} unidades: agrega otro formato o aumenta la cantidad.`,
      ),
  })
  // AAAA-MM-DD se compara como texto, igual que en el backend
  .refine(
    (datos) =>
      datos.fechaInicioVigencia === '' ||
      datos.fechaFinVigencia === '' ||
      datos.fechaFinVigencia >= datos.fechaInicioVigencia,
    {
      path: ['fechaFinVigencia'],
      message:
        'La fecha de término de la vigencia no puede ser anterior a la de inicio.',
    },
  );

export type FormularioPack = z.input<typeof esquemaPack>;
export type SalidaPack = z.output<typeof esquemaPack>;
export type CampoPack = keyof FormularioPack;

export const PACK_VACIO: FormularioPack = {
  nombre: '',
  sku: '',
  fechaInicioVigencia: '',
  fechaFinVigencia: '',
  exclusivo: false,
  descripcion: '',
  componentes: [],
};

export const packAFormulario = (pack: PackPanel): FormularioPack => ({
  nombre: pack.nombre,
  sku: pack.sku,
  fechaInicioVigencia: pack.fechaInicioVigencia ?? '',
  fechaFinVigencia: pack.fechaFinVigencia ?? '',
  exclusivo: pack.canalVenta === 'profesional',
  descripcion: pack.descripcion,
  componentes: pack.componentes.map(({ cantidad, ...formato }) => ({
    formato,
    cantidad: String(cantidad),
  })),
});

/**
 * Cuerpo de POST (nuevo) y PATCH (edición): siempre se envían todos los datos; una fecha vacía
 * va como `null` (en la edición, quita la vigencia) y `componentes` reemplaza la lista.
 */
export const cuerpoPack = (
  datos: SalidaPack,
): components['schemas']['CrearPackDto'] =>
  ({
    sku: datos.sku,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    canalVenta: datos.exclusivo ? 'profesional' : 'general',
    fechaInicioVigencia: datos.fechaInicioVigencia || null,
    fechaFinVigencia: datos.fechaFinVigencia || null,
    componentes: datos.componentes.map(({ formato, cantidad }) => ({
      formatoId: formato.formatoId,
      cantidad: Number(cantidad),
    })),
    // TODO(SCRUM-105): el Swagger tipa las fechas que admiten null como objetos
  }) as unknown as components['schemas']['CrearPackDto'];

/**
 * El backend responde los errores como una lista de mensajes, sin decir a qué campo pertenecen.
 * Se reconocen por cómo empiezan, según CrearPackDto y packs.service.ts. Los de los componentes
 * («Un pack solo admite formatos…», «El formato con id 11 no está activo…») van bajo la tabla.
 */
const INICIOS_PACK: [inicio: string, campo: CampoPack][] = [
  ['El SKU', 'sku'],
  ['El nombre del pack', 'nombre'],
  ['La descripción del pack', 'descripcion'],
  ['La fecha de inicio de la vigencia', 'fechaInicioVigencia'],
  ['La fecha de término de la vigencia', 'fechaFinVigencia'],
  ['El canal de venta', 'exclusivo'],
  ['Indica los formatos', 'componentes'],
  ['Indica el formato', 'componentes'],
  ['Algún formato', 'componentes'],
  ['La cantidad del componente', 'componentes'],
  ['Cada formato', 'componentes'],
  ['Un pack', 'componentes'],
  ['El formato con id', 'componentes'],
];

/** El campo de un mensaje del backend, o `null` si no es de un campo. */
export const campoDelErrorPack = (mensaje: string): CampoPack | null =>
  INICIOS_PACK.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
