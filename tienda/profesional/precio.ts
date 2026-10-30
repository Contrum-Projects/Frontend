/**
 * El precio que se muestra: el mayorista si el backend lo entregó (sesión profesional), si no el
 * minorista. Ambos vienen con IVA desde la API; aquí solo se elige cuál.
 */
export const precioVisible = (
  articulo: { precio: number } | { precioMayorista: number },
): number =>
  'precioMayorista' in articulo ? articulo.precioMayorista : articulo.precio;

/** Mínimo de unidades por formato para el precio profesional (RF-05.10). Lo exige el backend. */
export const MINIMO_PROFESIONAL = 3;
