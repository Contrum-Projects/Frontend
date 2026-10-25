/** Fechas para personas, siempre en la hora de Chile continental. */
const ZONA = 'America/Santiago';

const soloFecha = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: ZONA,
});

const fechaYHora = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: ZONA,
});

const aFecha = (valor: Date | string) =>
  typeof valor === 'string' ? new Date(valor) : valor;

/** «24 oct 2026» */
export const formatearFecha = (valor: Date | string) =>
  soloFecha.format(aFecha(valor));

/** «24 oct 2026, 22:43» */
export const formatearFechaHora = (valor: Date | string) =>
  fechaYHora.format(aFecha(valor));
