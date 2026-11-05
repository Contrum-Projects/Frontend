/**
 * Períodos del reporte de ventas (E14-H2). Solo arman las fechas que se piden al backend: los
 * pedidos y montos de cada mes los cuenta y suma el backend (RNF-03).
 */

export type Periodo = 'este-mes' | 'seis-meses';

export const PERIODO_INICIAL: Periodo = 'seis-meses';

/** Meses que abarca cada período, contando el mes en curso (Figma P6 muestra Abr a Sep). */
const MESES_DEL_PERIODO: Record<Periodo, number> = {
  'este-mes': 1,
  'seis-meses': 6,
};

/** Un mes del período: del día 1 al último día, o hasta hoy si es el mes en curso. */
export interface MesDelPeriodo {
  /** AAAA-MM */
  clave: string;
  /** AAAA-MM-DD */
  desde: string;
  /** AAAA-MM-DD */
  hasta: string;
}

export interface RangoDelPeriodo {
  desde: string;
  hasta: string;
  meses: MesDelPeriodo[];
}

const diaEnChile = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Santiago',
});

/** Hoy en la hora de Chile (AAAA-MM-DD), como cuenta los días el backend. */
export const hoyEnChile = (ahora: Date = new Date()) =>
  diaEnChile.format(ahora);

const dosDigitos = (valor: number) => String(valor).padStart(2, '0');

const ultimoDia = (anio: number, mes: number) =>
  new Date(Date.UTC(anio, mes, 0)).getUTCDate();

/** `hoy` en AAAA-MM-DD; los meses van del más antiguo al más reciente. */
export const rangoDelPeriodo = (
  periodo: Periodo,
  hoy: string,
): RangoDelPeriodo => {
  const [anioHoy, mesHoy] = hoy.split('-').map(Number);
  const cantidad = MESES_DEL_PERIODO[periodo];

  const meses = Array.from({ length: cantidad }, (_, indice) => {
    const atras = cantidad - 1 - indice;
    const fecha = new Date(Date.UTC(anioHoy, mesHoy - 1 - atras, 1));
    const anio = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth() + 1;
    const clave = `${anio}-${dosDigitos(mes)}`;
    const hasta =
      atras === 0 ? hoy : `${clave}-${dosDigitos(ultimoDia(anio, mes))}`;
    return { clave, desde: `${clave}-01`, hasta };
  });

  return { desde: meses[0].desde, hasta: hoy, meses };
};

const mesLargo = new Intl.DateTimeFormat('es-CL', {
  month: 'long',
  timeZone: 'UTC',
});

const conMayuscula = (texto: string) =>
  texto.charAt(0).toLocaleUpperCase('es-CL') + texto.slice(1);

/** «2026-08» → «Agosto» */
export const nombreMes = (clave: string) =>
  conMayuscula(mesLargo.format(new Date(`${clave}-01T00:00:00Z`)));

/** «2026-08» → «Ago» (eje del gráfico, como en Figma). */
export const abreviaturaMes = (clave: string) => nombreMes(clave).slice(0, 3);

/**
 * Líneas del eje de montos: de 0 a un tope redondo (1, 2 o 5 por una potencia de 10) en tres
 * tramos como mucho. Es solo dibujo: los montos son los del backend.
 */
export const lineasDelEje = (maximo: number): number[] => {
  if (maximo <= 0) return [0];
  const tramoMinimo = maximo / 3;
  const potencia = 10 ** Math.floor(Math.log10(tramoMinimo));
  const tramo =
    [1, 2, 5, 10]
      .map((factor) => factor * potencia)
      .find((candidato) => candidato >= tramoMinimo) ?? 10 * potencia;
  const tramos = Math.ceil(maximo / tramo);
  return Array.from({ length: tramos + 1 }, (_, indice) => indice * tramo);
};
