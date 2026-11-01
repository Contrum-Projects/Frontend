/** 1 → «1 unidad», 11 → «11 unidades». */
export const textoUnidades = (unidades: number): string =>
  unidades === 1 ? '1 unidad' : `${unidades} unidades`;

/** 1 → «1 producto», 3 → «3 productos». */
export const textoProductos = (productos: number): string =>
  productos === 1 ? '1 producto' : `${productos} productos`;
