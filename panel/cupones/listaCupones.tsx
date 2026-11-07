import type { Route } from 'next';
import Link from 'next/link';
import type { CuponPanel } from '@/compartido/api/respuestas';
import { formatearFecha } from '@/compartido/formato/fecha';
import { formatearPesos } from '@/compartido/formato/moneda';
import { formatearNumero } from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { estadoCupon, textoAlcance, textoDescuento } from './esquemaCupon';

export const rutaCupon = (id: number) => `/panel/cupones/${id}` as Route;

const TEXTO_ESTADO = {
  activo: 'Activo',
  programado: 'Programado',
  vencido: 'Vencido',
  agotado: 'Agotado',
  inactivo: 'Inactivo',
} as const;

const EstadoCupon = ({ cupon }: { cupon: CuponPanel }) => {
  const estado = estadoCupon(cupon);
  return (
    <Badge
      className={cn(
        'px-2.5 py-1 texto-leyenda',
        estado === 'activo'
          ? 'bg-marca-acento-suave text-marca-profundo'
          : estado === 'programado'
            ? 'bg-estado-aviso-fondo text-estado-aviso-texto'
            : 'bg-fondo-hueso-oscuro text-texto-principal',
      )}
    >
      {TEXTO_ESTADO[estado]}
    </Badge>
  );
};

/** «18 de 100», «18» sin máximo. */
const textoUsos = (cupon: CuponPanel) =>
  cupon.usosMaximos === null
    ? formatearNumero(cupon.usos)
    : `${formatearNumero(cupon.usos)} de ${formatearNumero(cupon.usosMaximos)}`;

const textoVigencia = (cupon: CuponPanel) => {
  if (cupon.fechaInicio && cupon.fechaFin)
    return `${formatearFecha(cupon.fechaInicio)} al ${formatearFecha(cupon.fechaFin)}`;
  if (cupon.fechaFin) return `Hasta el ${formatearFecha(cupon.fechaFin)}`;
  if (cupon.fechaInicio) return `Desde el ${formatearFecha(cupon.fechaInicio)}`;
  return 'Sin vencimiento';
};

/** Quién lo puede usar: cualquiera con el código o solo quienes recibieron la campaña. */
const textoQuien = (cupon: CuponPanel) =>
  cupon.campana ? `Campaña «${cupon.campana.asunto}»` : 'Cualquier cuenta';

const EnlaceCupon = ({ cupon }: { cupon: CuponPanel }) => (
  <Link
    href={rutaCupon(cupon.id)}
    className="texto-etiqueta break-all text-texto-principal after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
  >
    {cupon.codigo}
  </Link>
);

const ETIQUETA = 'Cupones';
const CABECERA = 'h-auto px-2 py-1 texto-leyenda text-texto-secundario';
const CELDA = 'px-2 py-3 align-middle texto-pequeno text-texto-principal';

/** Escritorio: código, descuento, a qué aplica, quién lo usa, vigencia, usos y estado. */
export const TablaCupones = ({ cupones }: { cupones: CuponPanel[] }) => (
  <Table aria-label={ETIQUETA}>
    <TableHeader>
      <TableRow className="border-0 hover:bg-transparent">
        <TableHead className={CABECERA}>Cupón</TableHead>
        <TableHead className={CABECERA}>Descuento</TableHead>
        <TableHead className={CABECERA}>Aplica a</TableHead>
        <TableHead className={CABECERA}>Vigencia</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Usos</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Descontado</TableHead>
        <TableHead className={CABECERA}>Estado</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {cupones.map((cupon) => (
        <TableRow key={cupon.id} className="relative hover:bg-fondo-hueso">
          <TableCell className={`max-w-56 ${CELDA}`}>
            <span className="flex flex-col">
              <EnlaceCupon cupon={cupon} />
              <span className="texto-leyenda whitespace-normal text-texto-secundario">
                {textoQuien(cupon)}
              </span>
            </span>
          </TableCell>
          <TableCell className={`whitespace-nowrap ${CELDA}`}>
            {textoDescuento(cupon)}
          </TableCell>
          <TableCell className={`min-w-36 whitespace-normal ${CELDA}`}>
            {textoAlcance(cupon)}
          </TableCell>
          <TableCell className={`whitespace-normal ${CELDA}`}>
            {textoVigencia(cupon)}
          </TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {textoUsos(cupon)}
          </TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {formatearPesos(cupon.descontado)}
          </TableCell>
          <TableCell className={CELDA}>
            <EstadoCupon cupon={cupon} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular: una tarjeta por cupón, que abre su edición. */
export const ListaCuponesCelular = ({ cupones }: { cupones: CuponPanel[] }) => (
  <ul aria-label={ETIQUETA} className="flex flex-col gap-3">
    {cupones.map((cupon) => (
      <li
        key={cupon.id}
        className="relative flex flex-col gap-2 rounded-lg border bg-card p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <EnlaceCupon cupon={cupon} />
          <EstadoCupon cupon={cupon} />
        </div>
        <p className="texto-pequeno text-texto-principal">
          {textoDescuento(cupon)} · {textoAlcance(cupon)}
        </p>
        <p className="texto-leyenda text-texto-secundario">
          {textoQuien(cupon)} · {textoVigencia(cupon)} · {textoUsos(cupon)} usos
        </p>
      </li>
    ))}
  </ul>
);
