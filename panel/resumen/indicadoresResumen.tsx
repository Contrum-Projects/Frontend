import {
  BadgeCheck,
  type LucideIcon,
  ReceiptText,
  Store,
  TriangleAlert,
} from 'lucide-react';
import { formatearNumero } from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';
import { Skeleton } from '@/compartido/ui/skeleton';

export interface Indicador {
  clave: 'por-preparar' | 'listos-retiro' | 'verificaciones' | 'stock-bajo';
  total: number;
}

const TEXTOS: Record<
  Indicador['clave'],
  { texto: string; Icono: LucideIcon; aviso?: boolean }
> = {
  'por-preparar': { texto: 'Pedidos por preparar', Icono: ReceiptText },
  'listos-retiro': { texto: 'Listos para retiro', Icono: Store },
  verificaciones: { texto: 'Verificaciones pendientes', Icono: BadgeCheck },
  'stock-bajo': {
    texto: 'Formatos con stock bajo',
    Icono: TriangleAlert,
    aviso: true,
  },
};

/** 2 por fila en celular y 4 en escritorio (Figma P1 2028:471 y 2023:206). */
export const GRILLA_INDICADORES = 'grid grid-cols-2 gap-4 lg:grid-cols-4';

/**
 * Un indicador del Resumen: ícono, número y qué cuenta. El de stock bajo va en color de aviso.
 * Las cifras vienen del backend; aquí solo se muestran.
 */
export const IndicadorResumen = ({ clave, total }: Indicador) => {
  const { texto, Icono, aviso } = TEXTOS[clave];
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg p-4 lg:flex-row lg:items-center lg:gap-4 lg:p-6',
        aviso
          ? 'bg-estado-aviso-fondo text-estado-aviso-texto'
          : 'border bg-card text-marca-profundo',
      )}
    >
      <Icono aria-hidden className="size-6 shrink-0" strokeWidth={1.75} />
      <p className="flex flex-col">
        <span
          className={cn(
            'titulo-h2 tabular-nums',
            !aviso && 'text-texto-principal',
          )}
        >
          {formatearNumero(total)}
        </span>
        <span
          className={cn('texto-leyenda', !aviso && 'text-texto-secundario')}
        >
          {texto}
        </span>
      </p>
    </div>
  );
};

/** Con la altura del indicador, para que nada salte al cargar (RNF-17). */
export const EsqueletoIndicador = () => (
  <Skeleton aria-hidden className="h-28 rounded-lg lg:h-24" />
);
