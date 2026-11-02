/** Lleva a una página fuera de la tienda (Mercado Pago). Separado para simularlo en las pruebas. */
export const irAUrlExterna = (url: string): void => {
  window.location.assign(url);
};
