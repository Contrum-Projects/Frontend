import type { components } from '@/compartido/api/esquema';

type Perfil = components['schemas']['GuardarPerfilProfesionalDto'];
export type Modalidad = Perfil['modalidad'];
export type Especialidad = Perfil['especialidades'][number];

export interface Opcion<T extends string> {
  valor: T;
  texto: string;
}

/**
 * Nombres de las modalidades y especialidades del perfil profesional (E10-H5), de la «Propuesta:
 * modalidades de trabajo y especialidades del perfil profesional» (por validar con la clienta).
 * Los valores son los de `MODALIDADES_TRABAJO` y `ESPECIALIDADES` del backend (`valores.ts`): el
 * `satisfies` avisa al compilar si el Swagger agrega o quita alguno.
 */
const MODALIDADES_TEXTO = {
  dependiente_salon: 'Dependiente en salón',
  arriendo_sillon: 'Arriendo de sillón',
  salon_propio: 'Salón propio',
  domicilio_clienta: 'Independiente a domicilio',
  domicilio_propio: 'Atención en su domicilio',
  eventos_producciones: 'Eventos y producciones',
  docente: 'Docente o formadora',
} as const satisfies Record<Modalidad, string>;

const ESPECIALIDADES_TEXTO = {
  corte_dama: 'Corte de dama',
  corte_varon_barberia: 'Corte de varón y barbería',
  peinados_recogidos: 'Peinados y recogidos',
  brushing_planchado: 'Brushing y planchado',
  coloracion_tinturas: 'Coloración y tinturas',
  mechas_balayage: 'Mechas, balayage y babylights',
  decoloracion_correccion: 'Decoloración y corrección de color',
  canas_matizacion: 'Canas y matización',
  alisados: 'Alisado (keratina, nanoplastia, botox capilar)',
  permanente_ondulacion: 'Permanente y ondulación',
  tratamientos_reparacion: 'Tratamientos de reparación e hidratación',
  tricologia: 'Tricología y cuero cabelludo',
  extensiones_pelucas: 'Extensiones y pelucas',
  rizado_afro: 'Cabello rizado y afro',
  peluqueria_infantil: 'Peluquería infantil',
  novias_eventos: 'Novias y eventos',
} as const satisfies Record<Especialidad, string>;

const opciones = <T extends string>(textos: Record<T, string>): Opcion<T>[] =>
  (Object.keys(textos) as T[]).map((valor) => ({
    valor,
    texto: textos[valor],
  }));

export const MODALIDADES = opciones<Modalidad>(MODALIDADES_TEXTO);

/** Agrupadas como en la propuesta. */
const GRUPOS: { titulo: string; valores: Especialidad[] }[] = [
  {
    titulo: 'Corte y peinado',
    valores: [
      'corte_dama',
      'corte_varon_barberia',
      'peinados_recogidos',
      'brushing_planchado',
    ],
  },
  {
    titulo: 'Color',
    valores: [
      'coloracion_tinturas',
      'mechas_balayage',
      'decoloracion_correccion',
      'canas_matizacion',
    ],
  },
  {
    titulo: 'Tratamientos y alisados',
    valores: [
      'alisados',
      'permanente_ondulacion',
      'tratamientos_reparacion',
      'tricologia',
    ],
  },
  {
    titulo: 'Otros',
    valores: [
      'extensiones_pelucas',
      'rizado_afro',
      'peluqueria_infantil',
      'novias_eventos',
    ],
  },
];

export const GRUPOS_ESPECIALIDADES = GRUPOS.map(({ titulo, valores }) => ({
  titulo,
  opciones: valores.map((valor): Opcion<Especialidad> => ({
    valor,
    texto: ESPECIALIDADES_TEXTO[valor],
  })),
}));

export const esModalidad = (valor: string): valor is Modalidad =>
  Object.hasOwn(MODALIDADES_TEXTO, valor);

export const esEspecialidad = (valor: string): valor is Especialidad =>
  Object.hasOwn(ESPECIALIDADES_TEXTO, valor);

/** Un valor que el frontend aún no conoce se muestra tal cual, en vez de perderse. */
export const textoModalidad = (valor: string): string =>
  esModalidad(valor) ? MODALIDADES_TEXTO[valor] : valor;

export const textoEspecialidad = (valor: string): string =>
  esEspecialidad(valor) ? ESPECIALIDADES_TEXTO[valor] : valor;
