import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type {
  CampanaListada,
  ContactosCampanas,
  EstadoCampana,
} from '@/compartido/api/respuestas';
import { formatearFecha } from '@/compartido/formato/fecha';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
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

export const rutaCampana = (codigo: string) =>
  `/panel/campanas/${encodeURIComponent(codigo)}` as Route;

const CONTADORES: { clave: keyof ContactosCampanas; texto: string }[] = [
  { clave: 'aceptanPublicidad', texto: 'aceptan publicidad' },
  { clave: 'cuentasVerificadas', texto: 'cuentas con correo verificado' },
  { clave: 'suscriptoresSinCuenta', texto: 'suscriptores sin cuenta' },
  { clave: 'conRebote', texto: 'direcciones con rebote' },
];

/** E12-H3, criterio 1 · Los contactos con consentimiento, contados por el backend (P7 2045:1647). */
export const ContadoresContactos = ({
  contactos,
}: {
  contactos: ContactosCampanas;
}) => (
  <ul
    aria-label="Contactos"
    className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
  >
    {CONTADORES.map(({ clave, texto }) => (
      <li
        key={clave}
        className="flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-4"
      >
        <span className="titulo-h3 text-texto-principal tabular-nums">
          {formatearNumero(contactos[clave])}
        </span>
        <span className="texto-leyenda text-texto-secundario">{texto}</span>
      </li>
    ))}
  </ul>
);

/** Borrador en hueso oscuro; enviada en verde agua (P7 2045:1685 y 2045:1701). */
export const EstadoCampanaBadge = ({ estado }: { estado: EstadoCampana }) => (
  <Badge
    className={cn(
      'px-2.5 py-1 texto-leyenda',
      estado === 'enviada'
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    {estado === 'enviada' ? 'Enviada' : 'Borrador'}
  </Badge>
);

const detalleEscritorio = (campana: CampanaListada) =>
  campana.estado === 'enviada' && campana.fechaEnvio
    ? `Enviada el ${formatearFecha(campana.fechaEnvio)}`
    : `Borrador · editado el ${formatearFecha(campana.fechaEdicion)}`;

const detalleCelular = (campana: CampanaListada) =>
  campana.estado === 'enviada' && campana.fechaEnvio
    ? [
        formatearFecha(campana.fechaEnvio),
        `${formatearNumero(campana.destinatarios)} enviados`,
        campana.porcentajeApertura !== null &&
          `${formatearPorcentaje(campana.porcentajeApertura)} abiertos`,
      ]
        .filter(Boolean)
        .join(' · ')
    : `${campana.segmento} · ${formatearNumero(campana.destinatarios)}`;

/**
 * Asunto de la fila. Un borrador se abre para seguir editándolo: el enlace cubre la fila, así el
 * teclado pasa por un solo enlace. Una enviada no tiene detalle.
 */
const AsuntoCampana = ({ campana }: { campana: CampanaListada }) =>
  campana.estado === 'borrador' ? (
    <Link
      href={rutaCampana(campana.codigo)}
      className="texto-etiqueta wrap-break-word text-texto-principal after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
    >
      {campana.asunto}
    </Link>
  ) : (
    <span className="texto-etiqueta wrap-break-word text-texto-principal">
      {campana.asunto}
    </span>
  );

const ETIQUETA = 'Campañas';
const CABECERA = 'h-auto px-2 py-1 texto-leyenda text-texto-secundario';
const CELDA = 'px-2 py-3 align-middle texto-pequeno text-texto-principal';

/** Escritorio (P7 2045:1661): campaña, segmento, destinatarios, estado y apertura. */
export const TablaCampanas = ({ campanas }: { campanas: CampanaListada[] }) => (
  <Table aria-label={ETIQUETA}>
    <TableHeader>
      <TableRow className="border-0 hover:bg-transparent">
        <TableHead className={CABECERA}>Campaña</TableHead>
        <TableHead className={CABECERA}>Segmento</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>
          Destinatarios
        </TableHead>
        <TableHead className={CABECERA}>Estado</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Abiertos</TableHead>
        <TableHead className={`w-6 ${CABECERA}`}>
          <span className="sr-only">Abrir</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {campanas.map((campana) => (
        <TableRow
          key={campana.codigo}
          className={cn(
            'relative',
            campana.estado === 'borrador'
              ? 'hover:bg-fondo-hueso'
              : 'hover:bg-transparent',
          )}
        >
          <TableCell className={`w-full max-w-0 ${CELDA}`}>
            <span className="flex flex-col">
              <AsuntoCampana campana={campana} />
              <span className="texto-leyenda text-texto-secundario">
                {detalleEscritorio(campana)}
              </span>
            </span>
          </TableCell>
          <TableCell className={`min-w-36 whitespace-normal ${CELDA}`}>
            {campana.segmento}
          </TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {formatearNumero(campana.destinatarios)}
          </TableCell>
          <TableCell className={CELDA}>
            <EstadoCampanaBadge estado={campana.estado} />
          </TableCell>
          <TableCell className={`text-right tabular-nums ${CELDA}`}>
            {campana.porcentajeApertura === null
              ? '—'
              : formatearPorcentaje(campana.porcentajeApertura)}
          </TableCell>
          <TableCell className={CELDA}>
            {campana.estado === 'borrador' && (
              <ArrowRight
                aria-hidden
                strokeWidth={1.75}
                className="size-4.5 text-texto-principal"
              />
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular (P7 2047:1225): asunto, detalle en una línea y estado. */
export const ListaCampanasCelular = ({
  campanas,
}: {
  campanas: CampanaListada[];
}) => (
  <ul aria-label={ETIQUETA} className="flex flex-col">
    {campanas.map((campana) => (
      <li
        key={campana.codigo}
        className="relative flex items-center gap-3 border-t py-3 first:border-t-0"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <AsuntoCampana campana={campana} />
          <span className="texto-leyenda wrap-break-word text-texto-secundario">
            {detalleCelular(campana)}
          </span>
        </span>
        <EstadoCampanaBadge estado={campana.estado} />
      </li>
    ))}
  </ul>
);
