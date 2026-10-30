/** El id de la URL, si es un entero positivo; si no, la ficha no existe (sin llamar al backend). */
export const leerId = (texto: string): number | null => {
  if (!/^[1-9]\d{0,9}$/.test(texto)) return null;
  const id = Number(texto);
  return Number.isSafeInteger(id) && id <= 2_147_483_647 ? id : null;
};
