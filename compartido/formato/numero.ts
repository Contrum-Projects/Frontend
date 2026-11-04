/** Cantidades para personas, con el separador de miles de Chile. */
const entero = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

/** 2140 → «2.140». */
export const formatearNumero = (valor: number) => entero.format(valor);

/** 41 → «41%» (como en Figma, sin espacio). El porcentaje lo calcula el backend. */
export const formatearPorcentaje = (valor: number) =>
  `${entero.format(valor)}%`;
