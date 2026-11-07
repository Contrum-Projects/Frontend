/**
 * Marcadores del correo de campaña (SCRUM-150). Copia de backend
 * `src/modulos/marketing/marcadores-campana.ts` › MARCADORES_CAMPANA: si allá cambian, cámbialos
 * aquí. Quien los completa es el backend, al enviar cada correo; un marcador que no existe lo
 * rechaza al guardar.
 */
export const MARCADORES_CAMPANA = [
  { clave: 'nombre', etiqueta: 'Nombre' },
  { clave: 'apellido', etiqueta: 'Apellido' },
  { clave: 'nombre_completo', etiqueta: 'Nombre completo' },
  { clave: 'enlace_tienda', etiqueta: 'Enlace a la tienda' },
] as const;

export type MarcadorCampana = (typeof MARCADORES_CAMPANA)[number]['clave'];

export const textoMarcador = (clave: MarcadorCampana) => `{${clave}}`;

/**
 * El texto con el marcador puesto donde estaba el cursor (o en lugar de lo seleccionado), y la
 * posición en que queda el cursor después.
 */
export const insertarEn = (
  texto: string,
  marcador: string,
  inicio: number,
  fin: number,
): { texto: string; cursor: number } => ({
  texto: `${texto.slice(0, inicio)}${marcador}${texto.slice(fin)}`,
  cursor: inicio + marcador.length,
});
