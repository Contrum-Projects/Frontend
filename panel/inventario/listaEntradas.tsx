import type { EntradaListado } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { formatearPesosNetos } from '@/compartido/formato/moneda';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { textoDocumento } from './esquemaEntrada';

interface ListaProps {
  entradas: EntradaListado[];
}

/** «1 formato», «3 formatos» */
const formatos = (cantidad: number) =>
  `${cantidad} ${cantidad === 1 ? 'formato' : 'formatos'}`;

const CABECERA = 'px-3 texto-leyenda text-texto-secundario';
/** Los textos largos pasan a otra línea en vez de cortarse: no hay otra forma de leerlos. */
const CELDA =
  'px-3 py-3 align-top break-words whitespace-normal texto-pequeno text-texto-principal';
const CIFRA = `${CELDA} tabular-nums`;

/**
 * Escritorio (Figma P5e 2064:2678): una columna por dato. Ancho automático: entre 1024 y 1300 px
 * las columnas cortas ceden espacio al proveedor.
 */
export const TablaEntradas = ({ entradas }: ListaProps) => (
  <Table aria-label="Entradas de inventario">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={CABECERA}>Fecha</TableHead>
        <TableHead className={CABECERA}>Documento</TableHead>
        <TableHead className={`min-w-40 ${CABECERA}`}>Proveedor</TableHead>
        <TableHead className={CABECERA}>Ubicación</TableHead>
        <TableHead className={CABECERA}>Formatos</TableHead>
        <TableHead className={CABECERA}>Unidades</TableHead>
        <TableHead className={CABECERA}>Costo neto</TableHead>
        <TableHead className={CABECERA}>Registró</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {entradas.map((entrada) => (
        <TableRow key={entrada.id} className="hover:bg-transparent">
          <TableCell className={CELDA}>
            {formatearDia(entrada.fechaRecepcion)}
          </TableCell>
          <TableCell className={CELDA}>{textoDocumento(entrada)}</TableCell>
          <TableCell className={CELDA}>
            {entrada.proveedor.razonSocial}
          </TableCell>
          <TableCell className={CELDA}>
            {entrada.ubicacion.codigo}
            <span className="block texto-leyenda text-texto-secundario">
              {entrada.ubicacion.bodega}
            </span>
          </TableCell>
          <TableCell className={CIFRA}>{entrada.cantidadFormatos}</TableCell>
          <TableCell className={CIFRA}>{entrada.unidades}</TableCell>
          <TableCell className={CIFRA}>
            {formatearPesosNetos(entrada.costoNetoTotal)}
          </TableCell>
          <TableCell className={CELDA}>
            {entrada.registradoPor.nombre}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/**
 * Celular (Figma P5e 2069:1720): proveedor y costo arriba; documento, ubicación, formatos y
 * unidades; y la fecha con quién la registró.
 */
export const ListaEntradasCelular = ({ entradas }: ListaProps) => (
  <ul aria-label="Entradas de inventario" className="flex flex-col">
    {entradas.map((entrada) => (
      <li
        key={entrada.id}
        className="flex items-start gap-3 border-t py-3 first:border-t-0"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="texto-etiqueta break-words text-texto-principal">
            {entrada.proveedor.razonSocial}
          </span>
          <span className="texto-leyenda break-words text-texto-secundario">
            {textoDocumento(entrada)} · {entrada.ubicacion.codigo} ·{' '}
            {formatos(entrada.cantidadFormatos)} · {entrada.unidades} unid.
          </span>
          <span className="texto-leyenda break-words text-texto-secundario">
            {formatearDia(entrada.fechaRecepcion)} ·{' '}
            {entrada.registradoPor.nombre}
          </span>
        </div>
        <span className="texto-cuerpo-fuerte text-texto-principal tabular-nums">
          <span className="sr-only">Costo neto: </span>
          {formatearPesosNetos(entrada.costoNetoTotal)}
        </span>
      </li>
    ))}
  </ul>
);
