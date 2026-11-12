import { z } from 'zod';
import type { CuponPanel, DatosCupon } from '@/compartido/api/respuestas';

/**
 * Valores del backend (`src/common/dominio/valores.ts` › TIPOS_DESCUENTO_CUPON y ALCANCES_CUPON,
 * decisión del 7 nov, SCRUM-150).
 */
export const TIPOS_DESCUENTO = ['porcentaje', 'monto_fijo'] as const;
export const ALCANCES = ['pedido', 'articulos', 'categorias_marcas'] as const;

export type TipoDescuento = (typeof TIPOS_DESCUENTO)[number];
export type Alcance = (typeof ALCANCES)[number];

export const NOMBRES_ALCANCE: Record<Alcance, string> = {
  pedido: 'Todo el pedido',
  articulos: 'Formatos y packs',
  categorias_marcas: 'Categorías y marcas',
};

const numero = z.number().int().nullable();

/**
 * Solo avisa lo que falta antes de pedir al backend; los rangos, si las reglas calzan entre sí y
 * si lo elegido existe los decide el backend y su mensaje queda junto al campo.
 */
export const esquemaCupon = z.object({
  codigo: z.string().trim().min(1, 'Escribe el código del cupón.'),
  descripcion: z.string(),
  tipoDescuento: z.enum(TIPOS_DESCUENTO),
  // Sin predicado de tipo: el formulario parte vacío (`null`)
  valor: numero.refine((valor) => Boolean(valor !== null), {
    message: 'Indica el valor del descuento.',
  }),
  topeDescuento: numero,
  alcance: z.enum(ALCANCES),
  /** Con su nombre, para mostrarlos sin volver a pedirlos. */
  articulos: z.array(z.object({ id: z.number().int(), nombre: z.string() })),
  categorias: z.array(z.number().int()),
  marcas: z.array(z.number().int()),
  compraMinima: numero,
  /** `AAAA-MM-DDTHH:mm` en la hora del navegador, como el control; vacío es «sin fecha». */
  fechaInicio: z.string(),
  fechaFin: z.string(),
  usosMaximos: numero,
  usosPorCuenta: numero,
  incluyeProfesionales: z.boolean(),
  activo: z.boolean(),
  campanaId: numero,
});

export type FormularioCupon = z.infer<typeof esquemaCupon>;

export const CUPON_VACIO: FormularioCupon = {
  codigo: '',
  descripcion: '',
  tipoDescuento: 'porcentaje',
  valor: null,
  topeDescuento: null,
  alcance: 'pedido',
  articulos: [],
  categorias: [],
  marcas: [],
  compraMinima: null,
  fechaInicio: '',
  fechaFin: '',
  usosMaximos: null,
  usosPorCuenta: 1,
  incluyeProfesionales: false,
  activo: true,
  campanaId: null,
};

const dosDigitos = (valor: number) => String(valor).padStart(2, '0');

/** Una fecha del backend como la usa `SelectorFecha` con `conHora` (AAAA-MM-DDTHH:mm), en la hora local. */
export const aFechaLocal = (fecha: string | null): string => {
  if (!fecha) return '';
  const d = new Date(fecha);
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}T${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
};

const aIso = (local: string): string | null =>
  local ? new Date(local).toISOString() : null;

export const formularioDesde = (cupon: CuponPanel): FormularioCupon => ({
  codigo: cupon.codigo,
  descripcion: cupon.descripcion ?? '',
  tipoDescuento: cupon.tipoDescuento,
  valor: cupon.valor,
  topeDescuento: cupon.topeDescuento,
  alcance: cupon.alcance,
  articulos: cupon.articulos,
  categorias: cupon.categorias.map((c) => c.id),
  marcas: cupon.marcas.map((m) => m.id),
  compraMinima: cupon.compraMinima,
  fechaInicio: aFechaLocal(cupon.fechaInicio),
  fechaFin: aFechaLocal(cupon.fechaFin),
  usosMaximos: cupon.usosMaximos,
  usosPorCuenta: cupon.usosPorCuenta,
  incluyeProfesionales: cupon.incluyeProfesionales,
  activo: cupon.activo,
  campanaId: cupon.campana?.id ?? null,
});

/** Lo que se envía: solo lo elegido para el alcance actual y el tope solo con porcentaje. */
export const datosDesde = (f: FormularioCupon): DatosCupon => ({
  codigo: f.codigo.trim(),
  descripcion: f.descripcion.trim() || null,
  tipoDescuento: f.tipoDescuento,
  valor: f.valor ?? 0,
  topeDescuento: f.tipoDescuento === 'porcentaje' ? f.topeDescuento : null,
  alcance: f.alcance,
  articulos: f.alcance === 'articulos' ? f.articulos.map((a) => a.id) : [],
  categorias: f.alcance === 'categorias_marcas' ? f.categorias : [],
  marcas: f.alcance === 'categorias_marcas' ? f.marcas : [],
  compraMinima: f.compraMinima,
  fechaInicio: aIso(f.fechaInicio),
  fechaFin: aIso(f.fechaFin),
  usosMaximos: f.usosMaximos,
  usosPorCuenta: f.usosPorCuenta,
  incluyeProfesionales: f.incluyeProfesionales,
  activo: f.activo,
  campanaId: f.campanaId,
});

export type CampoCupon = Exclude<keyof FormularioCupon, never>;

/** A qué campo del formulario va cada `campo` de los errores del backend. */
export const CAMPOS_CUPON: Partial<Record<string, CampoCupon>> =
  Object.fromEntries(
    (Object.keys(CUPON_VACIO) as CampoCupon[]).map((campo) => [campo, campo]),
  );

const pesos = (monto: number) => `$${monto.toLocaleString('es-CL')}`;

/** «20 %», «20 % (hasta $10.000)» o «$5.000». */
export const textoDescuento = (
  cupon: Pick<CuponPanel, 'tipoDescuento' | 'valor' | 'topeDescuento'>,
): string =>
  cupon.tipoDescuento === 'porcentaje'
    ? `${cupon.valor} %${cupon.topeDescuento ? ` (hasta ${pesos(cupon.topeDescuento)})` : ''}`
    : pesos(cupon.valor);

/** A qué se aplica, en palabras cortas para el listado. */
export const textoAlcance = (cupon: CuponPanel): string => {
  if (cupon.alcance === 'pedido') return NOMBRES_ALCANCE.pedido;
  const nombres =
    cupon.alcance === 'articulos'
      ? cupon.articulos.map((a) => a.nombre)
      : [...cupon.categorias, ...cupon.marcas].map((e) => e.nombre);
  if (nombres.length <= 2) return nombres.join(' y ');
  return `${nombres.slice(0, 2).join(', ')} y ${nombres.length - 2} más`;
};

/** El estado que se ve en el listado: lo decide la fecha de hoy y lo guardado. */
export const estadoCupon = (
  cupon: CuponPanel,
  ahora = new Date(),
): 'activo' | 'inactivo' | 'programado' | 'vencido' | 'agotado' => {
  if (!cupon.activo) return 'inactivo';
  if (cupon.fechaFin && new Date(cupon.fechaFin) <= ahora) return 'vencido';
  if (cupon.usosMaximos !== null && cupon.usos >= cupon.usosMaximos)
    return 'agotado';
  if (cupon.fechaInicio && new Date(cupon.fechaInicio) > ahora)
    return 'programado';
  return 'activo';
};
