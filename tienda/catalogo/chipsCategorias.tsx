import Link from 'next/link';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { urlCatalogo } from '@/tienda/diseno/enlaces';

const CLASE_CHIP =
  'inline-flex min-h-10 max-w-full items-center rounded-full border-[1.5px] bg-fondo-superficie px-4 py-2 texto-etiqueta text-texto-principal whitespace-nowrap transition-colors hover:border-marca-profundo';

/**
 * Chips de categorías (Figma › Componentes › Chip, «Activo: No»). En el inicio del celular van
 * en una fila que se desplaza; en el estado vacío del catálogo, en varias líneas.
 */
export const ChipsCategorias = ({
  categorias,
  desplazable = false,
  className,
}: {
  categorias: CategoriaTienda[];
  desplazable?: boolean;
  className?: string;
}) => (
  <ul
    className={cn(
      'flex gap-2',
      desplazable
        ? '-mx-4 snap-x scroll-px-4 [scrollbar-width:none] overflow-x-auto px-4 pb-1'
        : 'flex-wrap',
      className,
    )}
  >
    {categorias.map((categoria) => (
      <li key={categoria.id} className="max-w-full shrink-0 snap-start">
        <Link
          href={urlCatalogo({ categoria: categoria.id })}
          className={CLASE_CHIP}
        >
          <span className="truncate">{categoria.nombre}</span>
        </Link>
      </li>
    ))}
  </ul>
);
