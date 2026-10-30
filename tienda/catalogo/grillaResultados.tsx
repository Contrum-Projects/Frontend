import type { ListadoTienda } from '@/compartido/api/respuestas';
import { urlCatalogo } from '@/tienda/diseno/enlaces';
import { BotonCargarMas } from './botonCargarMas';
import { MAXIMO_PAGINAS, type ParametrosCatalogo } from './parametrosCatalogo';
import {
  TAMANOS_FOTO,
  TarjetaProducto,
  TarjetaProductoEsqueleto,
} from './tarjetaProducto';

const CLASE_GRILLA = 'grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6';

/**
 * Tarjetas del catálogo o de la búsqueda y «Cargar más» (Figma › 02 Catálogo › Grilla y
 * Paginación). Con la columna de filtros caben 3 por fila en escritorio.
 */
export const GrillaResultados = ({
  listado,
  parametros: { buscar, categoriaIds, marcaIds, orden, paginas },
}: {
  listado: ListadoTienda;
  parametros: ParametrosCatalogo;
}) => (
  <div>
    <ul className={CLASE_GRILLA}>
      {listado.items.map((producto, i) => (
        <li key={producto.id}>
          <TarjetaProducto
            producto={producto}
            tamanos={TAMANOS_FOTO.catalogo}
            prioridad={i < 4}
          />
        </li>
      ))}
    </ul>
    <div className="mt-8 flex flex-col items-center gap-3 md:mt-12">
      <p className="texto-pequeno text-texto-secundario">
        Mostrando {listado.items.length} de {listado.total} productos
      </p>
      {listado.items.length < listado.total && paginas < MAXIMO_PAGINAS && (
        <BotonCargarMas
          href={urlCatalogo({
            q: buscar,
            categoria: categoriaIds,
            marca: marcaIds,
            orden,
            pagina: paginas + 1,
          })}
        />
      )}
    </div>
  </div>
);

export const GrillaResultadosEsqueleto = () => (
  <ul aria-hidden className={CLASE_GRILLA}>
    {Array.from({ length: 6 }, (_, i) => (
      <li key={i}>
        <TarjetaProductoEsqueleto />
      </li>
    ))}
  </ul>
);
