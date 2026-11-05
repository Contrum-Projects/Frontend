import { Check, TriangleAlert } from 'lucide-react';
import type {
  CodigoObjetivo,
  IndicadorObjetivo,
} from '@/compartido/api/respuestas';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';

interface TextosObjetivo {
  titulo: string;
  /** En el celular, si el título no cabe junto al valor (Figma 2042:1058). */
  tituloCorto?: string;
  detalle: (cumplen: string, total: string) => string;
  sinRegistros: string;
}

/** Textos de Figma P6 (2041:1309). Las cifras vienen del backend. */
const TEXTOS: Record<CodigoObjetivo, TextosObjetivo> = {
  OE1: {
    titulo: 'Peluqueros que compran',
    detalle: (cumplen, total) =>
      `${cumplen} de ${total} cuentas con solicitud están verificadas y compraron a precio mayorista`,
    sinRegistros: 'No hay cuentas con solicitud en el período.',
  },
  OE2: {
    titulo: 'Verificaciones en 48 horas',
    tituloCorto: 'Verificaciones en 48 h',
    detalle: (cumplen, total) =>
      `${cumplen} de ${total} solicitudes resueltas dentro de 48 horas`,
    sinRegistros: 'No hay solicitudes resueltas en el período.',
  },
  OE3: {
    titulo: 'Descripciones con IA',
    detalle: (cumplen, total) =>
      `${cumplen} de ${total} productos nuevos usan la descripción de IA o IA editada`,
    sinRegistros: 'No hay productos nuevos en el período.',
  },
};

/** Solo para dibujar la barra: el porcentaje lo calcula el backend. */
const enBarra = (valor: number) => `${Math.min(100, Math.max(0, valor))}%`;

const Estado = ({ estado }: Pick<IndicadorObjetivo, 'estado'>) => {
  if (estado === 'sin-datos') return null;
  const bajo = estado === 'bajo-la-meta';
  const Icono = bajo ? TriangleAlert : Check;
  return (
    <p
      className={cn(
        'flex items-center gap-2 texto-leyenda',
        bajo ? 'text-estado-aviso-texto' : 'text-marca-profundo',
      )}
    >
      <Icono aria-hidden strokeWidth={1.75} className="size-3.5 lg:size-4" />
      {bajo ? 'Bajo la meta' : 'Sobre la meta'}
    </p>
  );
};

/**
 * Un objetivo (Figma P6): tarjeta propia en escritorio (2041:1310) y fila de la tarjeta
 * «Objetivos» en el celular (2042:1044), sin la frase de detalle.
 */
export const TarjetaObjetivo = ({
  objetivo,
}: {
  objetivo: IndicadorObjetivo;
}) => {
  const { codigo, meta, porcentaje, cumplen, total, estado } = objetivo;
  const textos = TEXTOS[codigo];
  const titulo = `${codigo} · ${textos.titulo}`;
  const sinDatos = estado === 'sin-datos' || porcentaje === null;

  return (
    <li className="flex flex-col gap-2 max-lg:border-t max-lg:pt-3 max-lg:first:border-t-0 max-lg:first:pt-0 lg:rounded-lg lg:border lg:bg-card lg:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 lg:flex-col lg:flex-nowrap lg:justify-start">
        <h3 className="texto-etiqueta text-texto-principal lg:text-texto-secundario">
          {textos.tituloCorto ? (
            <>
              {/* El lector de pantalla siempre lee el título completo */}
              <span aria-hidden className="lg:hidden">
                {`${codigo} · ${textos.tituloCorto}`}
              </span>
              <span className="max-lg:sr-only">{titulo}</span>
            </>
          ) : (
            titulo
          )}
        </h3>
        <p className="flex shrink-0 items-baseline gap-2 lg:min-h-11.5 lg:gap-3">
          {sinDatos ? (
            <span className="texto-etiqueta text-texto-principal lg:texto-cuerpo-fuerte lg:tracking-normal">
              Sin datos en el período
            </span>
          ) : (
            <span className="texto-cuerpo-fuerte text-texto-principal tabular-nums lg:titulo-h1">
              {formatearPorcentaje(porcentaje)}
            </span>
          )}
          <span className="texto-leyenda text-texto-secundario lg:texto-pequeno lg:tracking-normal">
            meta {formatearPorcentaje(meta)}
          </span>
        </p>
      </div>

      {/* Sin datos, la barra queda vacía y solo se ve: el texto ya lo dice */}
      <div
        {...(sinDatos
          ? { 'aria-hidden': true }
          : {
              role: 'meter',
              'aria-label': `Avance de ${codigo}`,
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-valuenow': porcentaje,
              'aria-valuetext': `${formatearPorcentaje(porcentaje)}, meta ${formatearPorcentaje(meta)}`,
            })}
        className="relative my-1 h-1.5 w-full rounded-full bg-fondo-hueso-oscuro lg:h-2"
      >
        {!sinDatos && (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-grafico-serie-1"
            style={{ width: enBarra(porcentaje) }}
          />
        )}
        {/* Marca de la meta (Figma 2041:1317) */}
        <span
          className="absolute -top-1 h-3.5 w-0.5 bg-texto-principal lg:h-4"
          style={{ left: enBarra(meta) }}
        />
      </div>

      <Estado estado={estado} />

      <p className="texto-leyenda text-texto-secundario max-lg:hidden">
        {sinDatos
          ? textos.sinRegistros
          : textos.detalle(formatearNumero(cumplen), formatearNumero(total))}
      </p>
    </li>
  );
};
