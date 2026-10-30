import { leerProductos } from './consultas';
import {
  ItemsFila,
  MarcoFila,
  POR_FILA,
  type FilaProductosProps,
} from './marcoFila';
import { FilaSegunRol } from './filaSegunRol';

export { MarcoFila } from './marcoFila';

/**
 * Fila del inicio con productos de la API. Sin productos, o si la API falla, no se muestra:
 * el inicio sigue con el resto de las secciones. Con una cuenta profesional, la fila se vuelve a
 * pedir con su token (exclusivos y mayorista, SCRUM-109).
 */
export async function FilaProductos(props: FilaProductosProps) {
  const listado = await leerProductos({
    orden: props.orden,
    limite: POR_FILA,
  }).catch(() => null);

  return (
    <FilaSegunRol {...props}>
      {listado && listado.items.length > 0 && (
        <MarcoFila {...props}>
          <ItemsFila {...props} productos={listado.items} />
        </MarcoFila>
      )}
    </FilaSegunRol>
  );
}
