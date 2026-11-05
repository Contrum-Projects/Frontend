import type { ReporteVentas } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { formatearPesos } from '@/compartido/formato/moneda';
import { formatearNumero } from '@/compartido/formato/numero';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { SERIES } from './graficoVentas';

const CABECERA = 'h-auto px-0 pb-3 texto-leyenda text-texto-secundario';
const CELDA = 'px-0 py-3 texto-pequeno';

/** «Resumen del período» de escritorio (Figma P6 2041:1399): pedidos y monto por tipo. */
export const ResumenVentas = ({ reporte }: { reporte: ReporteVentas }) => {
  const filas = [
    ...SERIES.map((serie) => ({
      texto: serie.texto,
      totales: reporte[serie.campo],
      total: false,
    })),
    { texto: 'Total', totales: reporte.total, total: true },
  ];

  return (
    <section
      aria-labelledby="titulo-resumen-ventas"
      className="flex flex-col gap-3 rounded-lg border bg-card p-6 max-lg:hidden lg:w-85 lg:shrink-0"
    >
      <h2
        id="titulo-resumen-ventas"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        Resumen del período
      </h2>
      <Table>
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="hover:bg-transparent">
            <TableHead className={CABECERA}>Tipo de cliente</TableHead>
            <TableHead className={cn('w-16 text-right', CABECERA)}>
              Pedidos
            </TableHead>
            <TableHead className={cn('w-24 text-right', CABECERA)}>
              Monto
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map(({ texto, totales, total }) => (
            <TableRow
              key={texto}
              className="border-t border-b-0 hover:bg-transparent"
            >
              <TableCell
                className={cn(
                  CELDA,
                  'text-texto-principal',
                  total && 'texto-etiqueta',
                )}
              >
                {texto}
              </TableCell>
              <TableCell
                className={cn(
                  CELDA,
                  'text-right text-texto-secundario tabular-nums',
                  total && 'texto-etiqueta',
                )}
              >
                {formatearNumero(totales.pedidos)}
              </TableCell>
              <TableCell
                className={cn(
                  CELDA,
                  'text-right text-texto-principal tabular-nums',
                  total && 'texto-etiqueta',
                )}
              >
                {formatearPesos(totales.montoTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="texto-leyenda text-texto-secundario">
        Montos con IVA, de pedidos pagados.
      </p>
    </section>
  );
};
