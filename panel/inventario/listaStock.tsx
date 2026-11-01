import { ArrowRight } from 'lucide-react';
import type { StockListado } from '@/compartido/api/respuestas';
import { formatearPesosNetos } from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { FotoProducto } from '@/panel/productos/etiquetasProducto';
import { nombreFormato } from './tiposMovimiento';

interface ListaProps {
  filas: StockListado[];
  /** Abre el detalle por ubicación del formato. */
  alVer: (fila: StockListado) => void;
}

const ETIQUETA = 'Stock por formato';
const CABECERA = 'px-3 texto-leyenda text-texto-secundario';
const CELDA =
  'px-3 py-3 align-middle break-words whitespace-normal texto-pequeno text-texto-principal';

/**
 * Las unidades en una píldora (Figma 2043:1349): con color de aviso si el backend dice que
 * están bajo el mínimo (E11-H6 criterio 2), y dicho en texto para quien no ve el color.
 */
export const CifraStock = ({
  stock,
  bajoMinimo,
}: Pick<StockListado, 'stock' | 'bajoMinimo'>) => (
  <span
    className={cn(
      'inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 texto-leyenda font-medium tabular-nums',
      bajoMinimo
        ? 'bg-estado-aviso-fondo text-estado-aviso-texto'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    {stock}
    {bajoMinimo && <span className="sr-only"> (bajo el mínimo)</span>}
  </span>
);

/** «A-01 · S-01», o «—» si no hay unidades en ninguna ubicación. */
const textoUbicaciones = ({ ubicaciones }: StockListado) =>
  ubicaciones.length > 0
    ? ubicaciones.map(({ codigo }) => codigo).join(' · ')
    : '—';

/** Escritorio (Figma P5a 2043:1320): una columna por dato y la flecha al detalle. */
export const TablaStock = ({ filas, alVer }: ListaProps) => (
  <Table aria-label={ETIQUETA}>
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={`min-w-56 ${CABECERA}`}>Formato</TableHead>
        <TableHead className={CABECERA}>Ubicaciones</TableHead>
        <TableHead className={`text-center ${CABECERA}`}>Stock</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Mínimo</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>
          Último costo neto
        </TableHead>
        <TableHead className={CABECERA}>Último proveedor</TableHead>
        <TableHead className="w-12 px-3">
          <span className="sr-only">Detalle</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filas.map((fila) => (
        <TableRow key={fila.formatoId} className="hover:bg-transparent">
          <TableCell className={CELDA}>
            <div className="flex items-center gap-3">
              <FotoProducto imagen={fila.imagen} />
              <div className="flex min-w-0 flex-col">
                <span className="texto-etiqueta">{nombreFormato(fila)}</span>
                <span className="texto-leyenda text-texto-secundario">
                  {fila.sku}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell className={CELDA}>{textoUbicaciones(fila)}</TableCell>
          <TableCell className={`text-center ${CELDA}`}>
            <CifraStock stock={fila.stock} bajoMinimo={fila.bajoMinimo} />
          </TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {fila.stockMinimo ?? '—'}
          </TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {fila.ultimaEntrada
              ? formatearPesosNetos(fila.ultimaEntrada.costoUnitarioNeto)
              : '—'}
          </TableCell>
          <TableCell className={CELDA}>
            {fila.ultimaEntrada?.proveedor.razonSocial ?? '—'}
          </TableCell>
          <TableCell className="px-3 py-3 text-right">
            <Button
              variant="ghost"
              size="icono"
              aria-label={`Ver el stock de ${nombreFormato(fila)} por ubicación`}
              onClick={() => alVer(fila)}
            >
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** «Ubicación A-02 · mín. 6», «Sin ubicación». */
const detalleCelular = (fila: StockListado) =>
  [
    fila.ubicaciones.length > 0
      ? `Ubicación ${textoUbicaciones(fila)}`
      : 'Sin ubicación',
    fila.stockMinimo !== null && `mín. ${fila.stockMinimo}`,
  ]
    .filter(Boolean)
    .join(' · ');

/** Celular (Figma P5a 2044:1100): foto, formato, ubicaciones y mínimo; cada fila abre el detalle. */
export const ListaStockCelular = ({ filas, alVer }: ListaProps) => (
  <ul aria-label={ETIQUETA} className="flex flex-col">
    {filas.map((fila) => (
      <li key={fila.formatoId} className="border-t first:border-t-0">
        <button
          type="button"
          onClick={() => alVer(fila)}
          className="flex w-full cursor-pointer items-center gap-3 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          <FotoProducto imagen={fila.imagen} />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="texto-etiqueta break-words text-texto-principal">
              {nombreFormato(fila)}
            </span>
            <span className="texto-leyenda break-words text-texto-secundario">
              {detalleCelular(fila)}
            </span>
          </span>
          <CifraStock stock={fila.stock} bajoMinimo={fila.bajoMinimo} />
        </button>
      </li>
    ))}
  </ul>
);

const FILAS_ESQUELETO = [0, 1, 2];

/** Con la estructura de la tabla y de la lista, para que nada salte al cargar (RNF-17). */
export const EsqueletoStock = () => (
  <div aria-hidden>
    <div className="flex flex-col max-lg:hidden">
      <div className="h-10" />
      {FILAS_ESQUELETO.map((fila) => (
        <div key={fila} className="flex items-center gap-4 border-t px-3 py-3">
          <Skeleton className="size-10" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="size-10" />
        </div>
      ))}
    </div>
    <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
      {FILAS_ESQUELETO.map((fila) => (
        <div
          key={fila}
          className="flex items-center gap-3 border-t py-3 first:border-t-0"
        >
          <Skeleton className="size-10" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-4 w-32 max-w-full" />
          </div>
          <Skeleton className="h-5 w-7" />
        </div>
      ))}
    </div>
  </div>
);
