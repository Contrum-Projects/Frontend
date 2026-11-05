'use client';

import type { CarritosDelMes } from '@/compartido/api/respuestas';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Cifra, TARJETA_REPORTE } from './cifra';
import { useCarritosDelPeriodo } from './consultasReportes';
import {
  GraficoCarritos,
  LeyendaCarritos,
  textoCarritos,
} from './graficoCarritos';
import { abreviaturaMes, type RangoDelPeriodo } from './periodos';

// Lado a lado desde 1360 px (Figma 2041:1418): con menos ancho, la tabla de campañas no cabe
const ANCHO = 'min-[85rem]:w-105 min-[85rem]:shrink-0';

const SIN_ABANDONOS = 'No hay carritos abandonados en el período.';

/** Celular: solo las cifras del último mes del período (Figma 2042:1125). */
const CifrasDelMes = ({ mes }: { mes: CarritosDelMes }) => (
  <dl className="grid grid-cols-3 gap-x-4 gap-y-2 lg:hidden">
    <Cifra
      valor={formatearNumero(mes.abandonados)}
      texto={`abandonados (${abreviaturaMes(mes.mes).toLocaleLowerCase('es-CL')})`}
    />
    <Cifra valor={formatearNumero(mes.recuperados)} texto="con compra" />
    <Cifra
      valor={
        mes.porcentajeRecuperados === null
          ? '–'
          : formatearPorcentaje(mes.porcentajeRecuperados)
      }
      texto="recuperados"
    />
  </dl>
);

/**
 * Carritos abandonados del período (E14-H3 criterio 1): por mes, los abandonados y los que
 * terminaron en compra. Cuentas y porcentaje los entrega el backend.
 */
export const CarritosDelPeriodo = ({ rango }: { rango: RangoDelPeriodo }) => {
  const consulta = useCarritosDelPeriodo(rango);

  if (consulta.isError) {
    return (
      <Alert variant="destructive" className={ANCHO}>
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!consulta.data) return <EsqueletoCarritos />;

  const { meses } = consulta.data;
  const ultimo = meses.at(-1);
  const sinAbandonos = meses.every((mes) => mes.abandonados === 0);

  return (
    <section
      aria-labelledby="titulo-carritos"
      className={`${TARJETA_REPORTE} ${ANCHO}`}
    >
      <h2
        id="titulo-carritos"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        Carritos abandonados
      </h2>
      <div className="flex flex-col gap-4 max-lg:hidden">
        <LeyendaCarritos />
        <GraficoCarritos meses={meses} />
      </div>
      {sinAbandonos || !ultimo ? (
        <p className="texto-pequeno text-texto-secundario">{SIN_ABANDONOS}</p>
      ) : (
        <>
          <p className="texto-leyenda text-texto-principal max-lg:hidden">
            {abreviaturaMes(ultimo.mes)}: {textoCarritos(ultimo)}
          </p>
          <CifrasDelMes mes={ultimo} />
        </>
      )}
    </section>
  );
};

/** Misma caja que la tarjeta, para que nada salte al cargar (RNF-17). */
const EsqueletoCarritos = () => (
  <div aria-hidden className={`${TARJETA_REPORTE} ${ANCHO}`}>
    <Skeleton className="h-6 w-44" />
    <Skeleton className="h-4 w-56 max-lg:hidden" />
    <Skeleton className="h-44 w-full max-lg:hidden" />
    <Skeleton className="h-10 w-full lg:h-4" />
  </div>
);
