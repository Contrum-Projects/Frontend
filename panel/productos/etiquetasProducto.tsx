import { Package, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type {
  OrigenDescripcion,
  ProductoListadoPanel,
} from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';
import { ORIGENES } from './esquemaProducto';

/**
 * Foto principal del formato predeterminado (Figma P3a 2039:1098), 40 px sobre menta. Sin
 * imágenes todavía (llegan con SCRUM-102), un ícono en su lugar.
 */
export const FotoProducto = ({ imagen }: { imagen: string | null }) => (
  <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-marca-acento-suave">
    {imagen ? (
      <Image src={imagen} alt="" fill sizes="40px" className="object-cover" />
    ) : (
      <Package
        aria-hidden
        className="size-5 stroke-[1.75] text-marca-profundo"
      />
    )}
  </div>
);

/** «Manual», «IA» o «IA editada» (Figma 2039:1120); las de IA con el destello. */
export const OrigenDescripcionProducto = ({
  origen,
}: {
  origen: OrigenDescripcion;
}) => {
  const { texto, ia } = ORIGENES[origen];
  return (
    <Badge
      className={cn(
        'texto-leyenda',
        ia
          ? 'bg-marca-acento-suave text-marca-profundo'
          : 'bg-fondo-hueso-oscuro text-texto-principal',
      )}
    >
      {ia && <Sparkles aria-hidden className="stroke-[1.75]" />}
      <span className="sr-only">Descripción: </span>
      {texto}
    </Badge>
  );
};

/** «Activo» o «Inactivo» (Figma 2039:1126 y 2039:1299). */
export const EstadoProducto = ({ activo }: { activo: boolean }) => (
  <Badge
    className={cn(
      'texto-leyenda',
      activo
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    {activo ? 'Activo' : 'Inactivo'}
  </Badge>
);

/** Stock total (Figma 2039:1117): en tono de aviso si el backend lo marca como bajo. */
export const StockProducto = ({
  producto,
}: {
  producto: Pick<ProductoListadoPanel, 'stockTotal' | 'stockBajo'>;
}) => (
  <Badge
    className={cn(
      'texto-leyenda tabular-nums',
      producto.stockBajo
        ? 'bg-estado-aviso-fondo text-estado-aviso-texto'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    <span className="sr-only">Stock: </span>
    {producto.stockTotal}
    {producto.stockBajo && <span className="sr-only"> (stock bajo)</span>}
  </Badge>
);
