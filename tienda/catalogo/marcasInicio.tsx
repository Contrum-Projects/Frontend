import { Skeleton } from '@/compartido/ui/skeleton';
import { CintaMarcas } from './cintaMarcas';
import { leerMarcas } from './consultas';

const CLASE_SECCION =
  'mx-auto max-w-[1440px] px-4 pt-8 pb-12 md:px-16 md:pt-12 md:pb-16';

/**
 * Marcas del inicio (Figma 2016:1594): todas las marcas de la API en una cinta infinita, y
 * cada una lleva a su catálogo. Sin marcas, o si la API falla, la sección no se muestra.
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
      <CintaMarcas marcas={marcas} titulo="Marcas" />
    </section>
  );
}

export const MarcasInicioEsqueleto = () => (
  <div aria-hidden className={CLASE_SECCION}>
    <Skeleton className="mb-3 h-6 w-32 md:mb-6 md:h-8" />
    <div className="-mx-4 flex gap-4 overflow-hidden px-4 md:mx-0 md:px-0">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-44 shrink-0 rounded-lg" />
      ))}
    </div>
  </div>
);
