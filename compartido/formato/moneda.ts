/**
 * Montos en pesos chilenos. El frontend no calcula precios, IVA ni totales: muestra los que
 * entrega la API (el backend es quien calcula y oculta el precio mayorista, RNF-04).
 */
const pesos = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

/** 22990 → «$22.990». Acepta el número o el texto con que la API envía los montos. */
export function formatearPesos(monto: number | string): string {
  const valor = typeof monto === 'string' ? Number(monto) : monto;
  if (!Number.isFinite(valor)) return '—';
  return pesos.format(Math.round(valor));
}

const pesosConDecimales = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Precio neto del panel, con sus decimales (se guardan con hasta dos): 8403.3 → «$8.403,30»,
 * 10916 → «$10.916».
 */
export function formatearPesosNetos(monto: number): string {
  if (!Number.isFinite(monto)) return '—';
  return Number.isInteger(monto)
    ? pesos.format(monto)
    : pesosConDecimales.format(monto);
}
