import type { CarritosDelMes } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
import { abreviaturaMes, lineasDelEje, nombreMes } from './periodos';

/** Series de Figma P6 (2041:1422): la parte que terminó en compra va abajo. */
const SERIES = [
  { texto: 'Terminaron en compra', color: 'bg-grafico-serie-1' },
  { texto: 'Sin compra', color: 'bg-fondo-hueso-oscuro' },
] as const;

const conPlural = (cantidad: number, singular: string, plural: string) =>
  `${formatearNumero(cantidad)} ${cantidad === 1 ? singular : plural}`;

/**
 * «110 carritos abandonados, 27 terminaron en compra (25%).» Las cifras y el porcentaje son del
 * backend; sin porcentaje (`null`), se omite.
 */
export const textoCarritos = ({
  abandonados,
  recuperados,
  porcentajeRecuperados,
}: CarritosDelMes) => {
  const porcentaje =
    porcentajeRecuperados === null
      ? ''
      : ` (${formatearPorcentaje(porcentajeRecuperados)})`;
  const carritos = conPlural(
    abandonados,
    'carrito abandonado',
    'carritos abandonados',
  );
  const compras = conPlural(recuperados, 'terminó', 'terminaron');
  return `${carritos}, ${compras} en compra${porcentaje}.`;
};

/** Leyenda «Terminaron en compra · Sin compra» (Figma 2041:1422). */
export const LeyendaCarritos = () => (
  <ul aria-hidden className="flex flex-wrap gap-x-3 gap-y-1">
    {SERIES.map((serie) => (
      <li
        key={serie.texto}
        className="flex items-center gap-1.5 texto-leyenda text-texto-principal"
      >
        <span className={cn('size-2.5 shrink-0 rounded-xs', serie.color)} />
        {serie.texto}
      </li>
    ))}
  </ul>
);

const enPorcentaje = (valor: number, tope: number) =>
  tope > 0 ? `${Math.min(100, (valor / tope) * 100)}%` : '0%';

/**
 * Barras apiladas por mes (Figma P6 2041:1429): el alto de la barra son los abandonados y, dentro,
 * la parte que terminó en compra. Es solo dibujo: las cifras son las del backend. Cada mes trae su
 * detalle como texto para el lector de pantalla.
 */
export const GraficoCarritos = ({ meses }: { meses: CarritosDelMes[] }) => {
  const maximo = Math.max(0, ...meses.map((mes) => mes.abandonados));
  const lineas = lineasDelEje(maximo);
  const tope = lineas[lineas.length - 1];

  return (
    <div className="flex gap-2">
      {/* Eje de cantidades */}
      <div
        aria-hidden
        className="relative mb-6 w-6 shrink-0 texto-leyenda text-texto-secundario"
      >
        {lineas.map((linea) => (
          <span
            key={linea}
            className="absolute left-0 translate-y-1/2 whitespace-nowrap"
            style={{ bottom: enPorcentaje(linea, tope) }}
          >
            {formatearNumero(linea)}
          </span>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        {/* Grilla: la línea del cero es más oscura, como en Figma */}
        <div aria-hidden className="absolute inset-x-0 top-0 bottom-6">
          {lineas.map((linea) => (
            <span
              key={linea}
              className={cn(
                'absolute inset-x-0 h-px',
                linea === 0 ? 'bg-texto-secundario' : 'bg-fondo-hueso-oscuro',
              )}
              style={{ bottom: enPorcentaje(linea, tope) }}
            />
          ))}
        </div>

        <ol aria-label="Carritos por mes" className="relative flex h-44">
          {meses.map((mes) => (
            <li key={mes.mes} className="flex flex-1 flex-col">
              <div aria-hidden className="flex flex-1 items-end justify-center">
                <div
                  className="flex w-6.5 flex-col justify-end overflow-hidden rounded-t-sm bg-fondo-hueso-oscuro"
                  style={{ height: enPorcentaje(mes.abandonados, tope) }}
                >
                  <div
                    className="bg-grafico-serie-1"
                    style={{
                      height: enPorcentaje(mes.recuperados, mes.abandonados),
                    }}
                  />
                </div>
              </div>
              <span
                aria-hidden
                className="flex h-6 items-end justify-center texto-leyenda text-texto-secundario"
              >
                {abreviaturaMes(mes.mes)}
              </span>
              <span className="sr-only">
                {nombreMes(mes.mes)}: {textoCarritos(mes)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
