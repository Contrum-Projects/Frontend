'use client';

import type { FiltrosEntradas as Filtros } from './consultasEntradas';
import { Buscador, FiltroBodega, FiltroFechas } from './filtrosInventario';

/**
 * Filtros de «Entradas» (Figma P5e 2064:2670): bodega, proveedor o documento y rango de fechas.
 * Los aplica el backend.
 */
export const FiltrosEntradas = ({
  filtros,
  alCambiar,
}: {
  filtros: Filtros;
  alCambiar: (filtros: Filtros) => void;
}) => {
  const cambiar = (parcial: Partial<Filtros>) =>
    alCambiar({ ...filtros, ...parcial });
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <FiltroBodega
        valor={filtros.bodegaId}
        alCambiar={(bodegaId) => cambiar({ bodegaId })}
      />
      <Buscador
        id="buscar-entradas"
        etiqueta="Buscar entradas por proveedor o documento"
        placeholder="Proveedor o documento"
        alCambiar={(buscar) => cambiar({ buscar })}
      />
      <FiltroFechas
        etiqueta="Fechas de recepción"
        desde={filtros.desde}
        hasta={filtros.hasta}
        alCambiar={(desde, hasta) => cambiar({ desde, hasta })}
      />
    </div>
  );
};
