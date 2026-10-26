import Link from 'next/link';
import { Skeleton } from '@/compartido/ui/skeleton';
import { urlCatalogo } from '@/tienda/diseno/enlaces';
import { leerMarcas } from './consultas';

const CLASE_SECCION =
  'mx-auto max-w-[1440px] px-4 pt-8 pb-12 md:px-16 md:pt-12 md:pb-16';

/**
 * Marcas del inicio (Figma 2016:1594): cada una lleva a su catálogo. En celular se desplazan
 * hacia el lado. Sin marcas, o si la API falla, la sección no se muestra.
 */
export async function MarcasInicio() {
  const marcas = await leerMarcas().catch(() => []);
  if (marcas.length === 0) return null;

  return (
    <section
      id="marcas"
      aria-labelledby="titulo-marcas"
      className={`${CLASE_SECCION} scroll-mt-4`}
    >
      <h2
        id="titulo-marcas"
        className="mb-3 titulo-h3 text-texto-principal md:mb-6 md:titulo-h2"
      >
        Marcas
      </h2>
      <ul className="-mx-4 flex snap-x scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-6 md:gap-6 md:overflow-visible md:px-0">
        {marcas.map((marca) => (
          <li key={marca.id} className="w-36 shrink-0 snap-start md:w-auto">
            <Link
              href={urlCatalogo({ marca: marca.id })}
              className="flex h-24 items-center justify-center rounded-lg border bg-fondo-superficie px-4 text-center titulo-h3 text-texto-secundario transition-colors hover:border-marca-profundo hover:text-marca-profundo"
            >
              {marca.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const MarcasInicioEsqueleto = () => (
  <div aria-hidden className={CLASE_SECCION}>
    <Skeleton className="mb-3 h-6 w-32 md:mb-6 md:h-8" />
    <div className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-6 md:gap-6 md:px-0">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-36 shrink-0 rounded-lg md:w-auto" />
      ))}
    </div>
  </div>
);
