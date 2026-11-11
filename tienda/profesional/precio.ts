/**
 * El precio que se muestra: el mayorista si el backend lo entregó (sesión profesional), si no el
 * minorista. Ambos vienen con IVA desde la API; aquí solo se elige cuál.
 */
export const precioVisible = (
  articulo: { precio: number } | { precioMayorista: number },
): number =>
  'precioMayorista' in articulo ? articulo.precioMayorista : articulo.precio;

/**
 * El precio normal que el profesional ve tachado junto al suyo, como una oferta (SCRUM-157):
 * el minorista que entrega el backend, solo si es mayor que el mayorista. `null` para quien no
 * es profesional y para los exclusivos (no tienen minorista).
 */
export const precioNormalTachado = (
  articulo:
    { precio: number } | { precio: number | null; precioMayorista: number },
): number | null =>
  'precioMayorista' in articulo &&
  articulo.precio !== null &&
  articulo.precio > articulo.precioMayorista
    ? articulo.precio
    : null;
