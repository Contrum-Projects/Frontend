import type { MovimientoListado } from '@/compartido/api/respuestas';
import { formatearFechaHora } from '@/compartido/formato/fecha';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import {
  nombreFormato,
  textoCantidad,
  textoRegistro,
  textoUbicacion,
  TIPOS_MOVIMIENTO,
} from './tiposMovimiento';

interface ListaProps {
  movimientos: MovimientoListado[];
  /** Nombre accesible de la tabla o la lista. */
  etiqueta: string;
}

const CABECERA = 'px-3 texto-leyenda text-texto-secundario';
const CELDA =
  'px-3 py-3 align-top break-words whitespace-normal texto-pequeno text-texto-principal';

/** Escritorio (Figma P5d 2064:2185 y la tarjeta «Últimos movimientos» de P5a 2043:1520). */
export const TablaMovimientos = ({ movimientos, etiqueta }: ListaProps) => (
  <Table aria-label={etiqueta}>
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={CABECERA}>Fecha</TableHead>
        <TableHead className={CABECERA}>Tipo</TableHead>
        <TableHead className={`min-w-40 ${CABECERA}`}>Formato</TableHead>
        <TableHead className={CABECERA}>Ubicación</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Cantidad</TableHead>
        <TableHead className={CABECERA}>Referencia</TableHead>
        <TableHead className={CABECERA}>Registró</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {movimientos.map((movimiento) => (
        <TableRow key={movimiento.id} className="hover:bg-transparent">
          <TableCell className={CELDA}>
            {formatearFechaHora(movimiento.fechaHora)}
          </TableCell>
          <TableCell className={CELDA}>
            {TIPOS_MOVIMIENTO[movimiento.tipo]}
          </TableCell>
          <TableCell className={CELDA}>
            {nombreFormato(movimiento.formato)}
          </TableCell>
          <TableCell className={CELDA}>{textoUbicacion(movimiento)}</TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {textoCantidad(movimiento)}
          </TableCell>
          <TableCell className={CELDA}>
            {movimiento.referencia ?? '—'}
          </TableCell>
          <TableCell className={CELDA}>{textoRegistro(movimiento)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/**
 * Celular (Figma P5d 2069:1560): formato y cantidad arriba; tipo, ubicación y referencia; y la
 * fecha con quién lo registró.
 */
export const ListaMovimientosCelular = ({
  movimientos,
  etiqueta,
}: ListaProps) => (
  <ul aria-label={etiqueta} className="flex flex-col">
    {movimientos.map((movimiento) => (
      <li
        key={movimiento.id}
        className="flex items-start gap-3 border-t py-3 first:border-t-0"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="texto-etiqueta break-words text-texto-principal">
            {nombreFormato(movimiento.formato)}
          </span>
          <span className="texto-leyenda break-words text-texto-secundario">
            {[
              TIPOS_MOVIMIENTO[movimiento.tipo],
              textoUbicacion(movimiento),
              movimiento.referencia,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          <span className="texto-leyenda break-words text-texto-secundario">
            {formatearFechaHora(movimiento.fechaHora)} ·{' '}
            {textoRegistro(movimiento)}
          </span>
        </div>
        <span className="texto-cuerpo-fuerte text-texto-principal tabular-nums">
          <span className="sr-only">Cantidad: </span>
          {textoCantidad(movimiento)}
        </span>
      </li>
    ))}
  </ul>
);

/** Filas del esqueleto si no se sabe cuántas llegarán. */
const FILAS_ESQUELETO = 3;

/** Con la estructura de la tabla y de la lista, para que nada salte al cargar (RNF-17). */
export const EsqueletoMovimientos = ({
  celular = true,
  filas = FILAS_ESQUELETO,
}: {
  celular?: boolean;
  /** Las que se piden, si se sabe (p. ej. los 5 últimos). */
  filas?: number;
}) => (
  <div aria-hidden>
    <div className="flex flex-col max-lg:hidden">
      <div className="h-10" />
      {Array.from({ length: filas }, (_, fila) => (
        <div key={fila} className="flex gap-4 border-t px-3 py-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
    {celular && (
      <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
        {Array.from({ length: filas }, (_, fila) => (
          <div
            key={fila}
            className="flex flex-col gap-1 border-t py-3 first:border-t-0"
          >
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-4 w-56 max-w-full" />
            <Skeleton className="h-4 w-32 max-w-full" />
          </div>
        ))}
      </div>
    )}
  </div>
);
