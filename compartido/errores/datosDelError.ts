/**
 * Qué pasó, para el registro de errores del backend (SCRUM-168). Común al navegador y al
 * servidor de Next. Nunca lleva datos de formularios: solo el tipo, el mensaje y la pila.
 */

const LARGO_MENSAJE = 1000;
const LARGO_TRAZA = 4000;
const LARGO_RUTA = 500;
const FORMATO_CODIGO = /^[A-Za-z0-9-]{8,64}$/;

export interface DatosDelError {
  tipoError: string;
  mensaje: string;
  traza?: string;
}

const recortar = (texto: string, maximo: number) =>
  texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto;

/** La pila sin el mensaje: solo las líneas `at …` (o `fn@archivo` en Firefox y Safari). */
const MARCO_FIREFOX = /^[^\s@]*@\S+:\d+:\d+$/;

const trazaDe = (error: Error): string | undefined => {
  const pila = error.stack ?? '';
  // V8 empieza la pila con «Tipo: mensaje», que puede tener varias líneas
  const encabezado = `${error.name}: ${error.message}`;
  const lineas = (
    pila.startsWith(encabezado) ? pila.slice(encabezado.length) : pila
  )
    .split('\n')
    .map((linea) => linea.trim())
    .filter((linea) => linea.startsWith('at ') || MARCO_FIREFOX.test(linea));
  return lineas.length > 0
    ? recortar(lineas.slice(0, 30).join('\n'), LARGO_TRAZA)
    : undefined;
};

export const datosDelError = (error: unknown): DatosDelError => {
  if (!(error instanceof Error)) {
    return {
      tipoError: typeof error,
      mensaje: 'Se lanzó un valor que no es un Error.',
    };
  }
  return {
    tipoError: recortar(error.name || 'Error', 100),
    mensaje: recortar(error.message || '(sin mensaje)', LARGO_MENSAJE),
    traza: trazaDe(error),
  };
};

/** La ruta sin la query ni el fragmento: la query puede llevar tokens (`?token=`). */
export const rutaSinQuery = (ruta: string) =>
  recortar(ruta.split(/[?#]/, 1)[0] ?? '', LARGO_RUTA);

/**
 * El `digest` que Next pone a los errores del servidor (el mismo que ve la persona y que
 * `instrumentation.ts` ya registró), si tiene un formato que el backend acepta.
 */
export const digestDe = (error: unknown): string | undefined => {
  const digest =
    typeof error === 'object' && error !== null && 'digest' in error
      ? error.digest
      : undefined;
  return typeof digest === 'string' && FORMATO_CODIGO.test(digest)
    ? digest
    : undefined;
};

/** Un código de seguimiento con el formato que acepta el backend, o `undefined`. */
export const codigoValido = (codigo: unknown): string | undefined =>
  typeof codigo === 'string' && FORMATO_CODIGO.test(codigo)
    ? codigo
    : undefined;
