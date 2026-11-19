import { Check, TriangleAlert } from 'lucide-react';
import type {
  CodigoObjetivo,
  IndicadorObjetivo,
} from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';

/**
 * Cómo se lee el porcentaje que entrega el backend: `crecimiento` (OE1) es cuánto subió frente al
 * período anterior; `reduccion` (OE2) es cuánto bajó, y se muestra con signo menos. Sin
 * `variacion`, es una proporción (OE3).
 */
type Variacion = 'crecimiento' | 'reduccion';

interface TextosObjetivo {
  titulo: string;
  /** En el celular, si el título no cabe junto al valor (Figma 2042:1058). */
  tituloCorto?: string;
  variacion?: Variacion;
  /** `cumplidos` y `total` como los define el backend para cada objetivo. */
  detalle: (cumplidos: number, total: number) => string;
  sinRegistros: string;
}

const quiebres = (cantidad: number) =>
  `${formatearNumero(cantidad)} ${cantidad === 1 ? 'quiebre' : 'quiebres'}`;

/** Objetivos específicos (decisión del 18-11-2026). Las cifras vienen del backend. */
const TEXTOS: Record<CodigoObjetivo, TextosObjetivo> = {
  OE1: {
    titulo: 'Facturación digital',
    variacion: 'crecimiento',
    detalle: (cumplidos, total) =>
      `${formatearPesos(cumplidos)} vendidos en línea, contra ${formatearPesos(total)} en el período anterior`,
    sinRegistros: 'No hay ventas en el período anterior para comparar.',
  },
  OE2: {
    titulo: 'Quiebres de stock',
    variacion: 'reduccion',
    detalle: (cumplidos, total) =>
      `${quiebres(cumplidos)} de stock en el período, contra ${formatearNumero(total)} en el anterior`,
    sinRegistros:
      'No hubo quiebres de stock en el período anterior para comparar.',
  },
  OE3: {
    titulo: 'Alcance territorial',
    detalle: (cumplidos, total) =>
      `${formatearNumero(cumplidos)} de ${formatearNumero(total)} pedidos se despacharon fuera de Talcahuano y comunas aledañas`,
    sinRegistros: 'No hay pedidos pagados en el período.',
  },
};

/** «+25%» y «−90%» en las variaciones; la proporción, sin signo. */
const valorConSigno = (variacion: Variacion | undefined, valor: number) => {
  if (!variacion) return formatearPorcentaje(valor);
  // En la reducción, el backend entrega cuánto bajó: se muestra como un cambio negativo
  const cambio = variacion === 'reduccion' ? -valor : valor;
  if (cambio === 0) return formatearPorcentaje(0);
  return `${cambio > 0 ? '+' : '−'}${formatearPorcentaje(Math.abs(cambio))}`;
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
  const { codigo, meta, porcentaje, cumplidos, total, estado } = objetivo;
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
              {valorConSigno(textos.variacion, porcentaje)}
            </span>
          )}
          <span className="texto-leyenda text-texto-secundario lg:texto-pequeno lg:tracking-normal">
            meta {valorConSigno(textos.variacion, meta)}
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
              'aria-valuetext': `${valorConSigno(textos.variacion, porcentaje)}, meta ${valorConSigno(textos.variacion, meta)}`,
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
        {sinDatos ? textos.sinRegistros : textos.detalle(cumplidos, total)}
      </p>
    </li>
  );
};
