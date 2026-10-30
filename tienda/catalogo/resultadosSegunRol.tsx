'use client';

import type { ReactNode } from 'react';
import {
  useEsProfesional,
  useProductosProfesional,
} from '@/tienda/profesional/consultasProfesional';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import {
  GrillaResultados,
  GrillaResultadosEsqueleto,
} from './grillaResultados';
import { POR_PAGINA, type ParametrosCatalogo } from './parametrosCatalogo';

/** El listado del catálogo o la búsqueda con la sesión del profesional, mismas páginas. */
const useListadoProfesional = ({
  buscar,
  categoriaIds,
  marcaIds,
  orden,
  paginas,
}: ParametrosCatalogo) =>
  useProductosProfesional(
    { buscar, categoriaIds, marcaIds, orden, limite: POR_PAGINA },
    paginas,
  );

/**
 * Resultados del catálogo según quién mira (SCRUM-109 criterio 2). Visitantes y clientes ven lo
 * que armó el servidor (`children`); el profesional, el mismo listado pedido con su token, con
 * los exclusivos y el mayorista. `vacio` es el estado sin productos que armó el servidor.
 */
export function ResultadosSegunRol({
  parametros,
  vacio,
  children,
}: {
  parametros: ParametrosCatalogo;
  vacio: ReactNode;
  children: ReactNode;
}) {
  const esProfesional = useEsProfesional();
  const consulta = useListadoProfesional(parametros);
  if (!esProfesional) return children;
  if (consulta.isPending) return <GrillaResultadosEsqueleto profesional />;
  if (consulta.isError) {
    return (
      <ErrorProfesional
        mensaje={consulta.error.message}
        onReintentar={() => void consulta.refetch()}
      />
    );
  }
  if (consulta.data.items.length === 0) return vacio;
  return <GrillaResultados listado={consulta.data} parametros={parametros} />;
}

/** «12 productos» junto al título, con el total que ve el profesional. */
export function TotalSegunRol({
  parametros,
  children,
}: {
  parametros: ParametrosCatalogo;
  children: ReactNode;
}) {
  const esProfesional = useEsProfesional();
  const { data } = useListadoProfesional(parametros);
  if (!esProfesional) return children;
  if (!data || (data.total === 0 && !parametros.buscar)) return null;
  return <TotalProductos total={data.total} />;
}

export const TotalProductos = ({ total }: { total: number }) => (
  <p className="text-texto-secundario">
    {total === 1 ? '1 producto' : `${total} productos`}
  </p>
);
