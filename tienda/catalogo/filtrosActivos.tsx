import { X } from 'lucide-react';
import Link from 'next/link';
import { urlCatalogo } from '@/tienda/diseno/enlaces';
import type { ParametrosCatalogo } from './parametrosCatalogo';

export interface FiltroActivo {
  tipo: 'categoria' | 'marca';
  id: number;
  nombre: string;
}

/**
 * «Filtrando por:» con un chip por filtro marcado (Figma › 02 Catálogo › Filtros activos
 * 2006:519). Cada chip es un enlace a los mismos resultados sin ese filtro.
 */
export const FiltrosActivos = ({
  filtros,
  parametros,
}: {
  filtros: FiltroActivo[];
  parametros: ParametrosCatalogo;
}) => {
  if (filtros.length === 0) return null;
  const { buscar, categoriaIds, marcaIds, orden } = parametros;
  const sin = ({ tipo, id }: FiltroActivo) =>
    urlCatalogo({
      q: buscar,
      categoria:
        tipo === 'categoria'
          ? categoriaIds.filter((item) => item !== id)
          : categoriaIds,
      marca:
        tipo === 'marca' ? marcaIds.filter((item) => item !== id) : marcaIds,
      orden,
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="texto-pequeno text-texto-secundario">Filtrando por:</p>
      <ul className="flex flex-wrap gap-2">
        {filtros.map((filtro) => (
          <li key={`${filtro.tipo}-${filtro.id}`}>
            <Link
              href={sin(filtro)}
              scroll={false}
              className="inline-flex min-h-8 items-center gap-2 rounded-full bg-marca-profundo py-2 pr-3 pl-4 texto-etiqueta text-texto-sobre-oscuro transition-opacity hover:opacity-90"
            >
              {filtro.nombre}{' '}
              <X className="size-3.5" strokeWidth={1.75} aria-hidden />
              <span className="sr-only">(quitar filtro)</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
