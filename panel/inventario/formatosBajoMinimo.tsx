import type { ReactNode } from 'react';
import type { FormatoBajoMinimo } from '@/compartido/api/respuestas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { CifraStock } from './listaStock';
import { nombreFormato } from './tiposMovimiento';

const CABECERA = 'h-auto px-3 py-2 texto-leyenda text-texto-secundario';
const CELDA = 'px-3 py-3 align-middle whitespace-normal';

interface PropsStockBajo {
  filas: FormatoBajoMinimo[];
  /** Nombre accesible de la tabla y de la lista (el título de la tarjeta). */
  etiqueta: string;
}

/** «2 / mín. 5» en una píldora de aviso (Figma P1 celular). */
const PildoraAviso = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex min-w-7 justify-center rounded-full bg-estado-aviso-fondo px-2 py-0.5 texto-leyenda font-medium whitespace-nowrap text-estado-aviso-texto tabular-nums">
    {children}
  </span>
);

/** Escritorio (Figma P1 2028:682): formato, stock y mínimo. */
const TablaStockBajo = ({ filas, etiqueta }: PropsStockBajo) => (
  <Table aria-label={etiqueta} className="max-lg:hidden">
    <TableHeader className="[&_tr]:border-0">
      <TableRow className="bg-marca-acento-suave hover:bg-marca-acento-suave">
        <TableHead className={`rounded-l-lg ${CABECERA}`}>Formato</TableHead>
        <TableHead className={`w-16 text-right ${CABECERA}`}>Stock</TableHead>
        <TableHead className={`w-16 rounded-r-lg text-right ${CABECERA}`}>
          Mínimo
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filas.map((fila) => (
        <TableRow
          key={fila.formatoId}
          className="border-t border-b-0 hover:bg-transparent"
        >
          <TableCell
            className={`texto-etiqueta break-words text-texto-principal ${CELDA}`}
          >
            {nombreFormato(fila)}
          </TableCell>
          <TableCell className={`text-right ${CELDA}`}>
            <CifraStock stock={fila.stockTotal} bajoMinimo />
          </TableCell>
          <TableCell
            className={`text-right texto-pequeno text-texto-principal tabular-nums ${CELDA}`}
          >
            {fila.stockMinimo}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular (Figma P1 2023:206): producto, formato y «2 / mín. 5». */
const ListaStockBajo = ({ filas, etiqueta }: PropsStockBajo) => (
  <ul aria-label={etiqueta} className="flex flex-col gap-3 lg:hidden">
    {filas.map((fila) => (
      <li key={fila.formatoId} className="flex items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="texto-cuerpo-fuerte break-words text-texto-principal">
            {fila.producto}
          </span>
          <span className="texto-leyenda break-words text-texto-secundario">
            {fila.nombreFormato}
          </span>
        </span>
        <PildoraAviso>
          {fila.stockTotal} / mín. {fila.stockMinimo}
        </PildoraAviso>
      </li>
    ))}
  </ul>
);

/**
 * Formatos bajo su stock mínimo con su stock y su mínimo: tabla en escritorio y lista en
 * celular. La usan el aviso del Resumen (E11-H6) y el reporte de Reportes (E14-H4).
 */
export const FormatosBajoMinimo = (props: PropsStockBajo) => (
  <>
    <TablaStockBajo {...props} />
    <ListaStockBajo {...props} />
  </>
);
