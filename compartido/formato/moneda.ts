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
