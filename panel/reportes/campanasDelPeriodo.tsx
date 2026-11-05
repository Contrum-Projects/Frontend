'use client';

import Link from 'next/link';
import type { ResultadoCampana } from '@/compartido/api/respuestas';
import { formatearDiaMesCorto } from '@/compartido/formato/fecha';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { Cifra, TARJETA_REPORTE } from './cifra';
import { useCampanasDelPeriodo } from './consultasReportes';
import { nombreMes, type RangoDelPeriodo } from './periodos';

const SIN_CAMPANAS = 'No hay campañas enviadas en el período.';

const porcentaje = (valor: number | null) =>
  valor === null ? '–' : formatearPorcentaje(valor);

/** Las seis cifras del criterio 2, en el orden de Figma más «Cancelados» antes de «Fallidos». */
const CIFRAS: {
  titulo: string;
  texto: string;
  valor: (campana: ResultadoCampana) => string;
}[] = [
  {
    titulo: 'Enviados',
    texto: 'enviados',
    valor: (campana) => formatearNumero(campana.enviados),
  },
  {
    titulo: 'Abiertos',
    texto: 'abiertos',
    valor: (campana) => porcentaje(campana.porcentajeAbiertos),
  },
  {
    titulo: 'Con clic',
    texto: 'con clic',
    valor: (campana) => porcentaje(campana.porcentajeClic),
  },
  {
    titulo: 'Rebotados',
    texto: 'rebotados',
    valor: (campana) => formatearNumero(campana.rebotados),
  },
  {
    titulo: 'Cancelados',
    texto: 'cancelados',
    valor: (campana) => formatearNumero(campana.cancelados),
  },
  {
    titulo: 'Fallidos',
    texto: 'fallidos',
    valor: (campana) => formatearNumero(campana.fallidos),
  },
];

/** «1 oct» de una campaña; «Septiembre» del correo automático (Figma 2041:1501). */
const fechaCampana = (campana: ResultadoCampana) =>
  campana.automatica
    ? nombreMes(campana.fecha.slice(0, 7))
    : formatearDiaMesCorto(campana.fecha);

/** «1 oct · Todos los suscritos» o «Septiembre · Automático». */
const detalleCampana = (campana: ResultadoCampana) =>
  [fechaCampana(campana), campana.automatica ? 'Automático' : campana.segmento]
    .filter(Boolean)
    .join(' · ');

const CABECERA = 'h-auto px-0 pb-1 texto-leyenda text-texto-secundario';
const CELDA = 'px-0 py-3 texto-pequeno';

/** Escritorio: «Resultados de campañas» (Figma 2041:1455). */
const TablaCampanas = ({ campanas }: { campanas: ResultadoCampana[] }) => (
  <Table>
    <TableHeader className="[&_tr]:border-0">
      <TableRow className="hover:bg-transparent">
        <TableHead className={CABECERA}>Campaña</TableHead>
        {CIFRAS.map((cifra) => (
          <TableHead
            key={cifra.titulo}
            className={cn(CABECERA, 'w-18 pl-2 text-right')}
          >
            {cifra.titulo}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {campanas.map((campana) => (
        <TableRow
          key={campana.codigo}
          className="border-t border-b-0 hover:bg-transparent"
        >
          <TableCell className={CELDA}>
            <span className="block texto-etiqueta whitespace-normal text-texto-principal">
              {campana.nombre}
            </span>
            <span className="block texto-leyenda whitespace-normal text-texto-secundario">
              {detalleCampana(campana)}
            </span>
          </TableCell>
          {CIFRAS.map((cifra) => (
            <TableCell
              key={cifra.titulo}
              className={cn(
                CELDA,
                'pl-2 text-right text-texto-principal tabular-nums',
              )}
            >
              {cifra.valor(campana)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular: «Última campaña» con sus seis cifras (Figma 2042:1135). */
const UltimaCampana = ({ campana }: { campana: ResultadoCampana }) => (
  <div className="flex flex-col gap-3">
    <p className="texto-pequeno text-texto-principal">
      {campana.nombre} · {fechaCampana(campana)}
    </p>
    <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
      {CIFRAS.map((cifra) => (
        <Cifra
          key={cifra.texto}
          valor={cifra.valor(campana)}
          texto={cifra.texto}
        />
      ))}
    </dl>
  </div>
);

/**
 * Resultados de las campañas del período (E14-H3 criterio 2). Escritorio: una tabla con todas;
 * celular: la última, desde «Más» › Reportes. Las cifras y porcentajes los entrega el backend.
 */
export const CampanasDelPeriodo = ({ rango }: { rango: RangoDelPeriodo }) => {
  const consulta = useCampanasDelPeriodo(rango);

  if (consulta.isError) {
    return (
      <Alert variant="destructive" className="min-[85rem]:flex-1">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!consulta.data) return <EsqueletoCampanas />;

  const { campanas } = consulta.data;
  const ultima = campanas.at(0);

  return (
    <section
      aria-labelledby="titulo-campanas"
      className={`${TARJETA_REPORTE} min-[85rem]:flex-1`}
    >
      <h2
        id="titulo-campanas"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        <span className="lg:hidden">Última campaña</span>
        <span className="max-lg:hidden">Resultados de campañas</span>
      </h2>
      {!ultima ? (
        <p className="texto-pequeno text-texto-secundario">{SIN_CAMPANAS}</p>
      ) : (
        <>
          <div className="max-lg:hidden">
            <TablaCampanas campanas={campanas} />
          </div>
          <div className="lg:hidden">
            <UltimaCampana campana={ultima} />
          </div>
        </>
      )}
      <Link
        href="/panel/campanas"
        className="inline-flex min-h-10 items-center self-start texto-etiqueta text-marca-profundo underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo lg:hidden"
      >
        Ver todas las campañas
      </Link>
    </section>
  );
};

/** Misma caja que la tarjeta, para que nada salte al cargar (RNF-17). */
const EsqueletoCampanas = () => (
  <div aria-hidden className={`${TARJETA_REPORTE} min-[85rem]:flex-1`}>
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-5 w-56 lg:hidden" />
    <Skeleton className="h-22 w-full lg:h-44" />
    <Skeleton className="h-10 w-44 lg:hidden" />
  </div>
);
