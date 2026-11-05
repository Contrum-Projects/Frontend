import type { ReporteVentas, TotalesVentas } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import {
  formatearPesos,
  formatearPesosCompactos,
} from '@/compartido/formato/moneda';
import { formatearNumero } from '@/compartido/formato/numero';
import { abreviaturaMes, lineasDelEje, nombreMes } from './periodos';

export interface VentasDelMes {
  clave: string;
  reporte: ReporteVentas;
}

/** Cliente = precio minorista, Profesional = precio mayorista (Figma P6). */
export const SERIES = [
  { campo: 'minorista', texto: 'Cliente', color: 'bg-grafico-serie-1' },
  { campo: 'mayorista', texto: 'Profesional', color: 'bg-grafico-serie-2' },
] as const;

const textoPedidos = (pedidos: number) =>
  `${formatearNumero(pedidos)} ${pedidos === 1 ? 'pedido' : 'pedidos'}`;

/** «$2.380.000 · 96 pedidos» */
export const textoTotales = ({ montoTotal, pedidos }: TotalesVentas) =>
  `${formatearPesos(montoTotal)} · ${textoPedidos(pedidos)}`;

const Muestra = ({ color, chica }: { color: string; chica?: boolean }) => (
  <span
    aria-hidden
    className={cn('shrink-0 rounded-xs', chica ? 'size-2' : 'size-2.5', color)}
  />
);

/** Leyenda «Cliente · Profesional» (Figma 2041:1354). */
export const LeyendaVentas = ({ className }: { className?: string }) => (
  <ul aria-hidden className={cn('flex gap-4', className)}>
    {SERIES.map((serie) => (
      <li
        key={serie.campo}
        className="flex items-center gap-1.5 texto-leyenda text-texto-principal"
      >
        <Muestra color={serie.color} />
        {serie.texto}
      </li>
    ))}
  </ul>
);

const porcentaje = (monto: number, tope: number) =>
  tope > 0 ? `${(monto / tope) * 100}%` : '0%';

/**
 * Barras por mes y tipo de cliente (Figma P6 2041:1361 y celular). Cada mes se enfoca con el
 * teclado y muestra su detalle al pasar el mouse o al enfocarlo; ese detalle es texto real, así
 * el lector de pantalla lee los montos de cada mes.
 */
export const GraficoVentas = ({ meses }: { meses: VentasDelMes[] }) => {
  const maximo = Math.max(
    0,
    ...meses.flatMap(({ reporte }) =>
      SERIES.map((serie) => reporte[serie.campo].montoTotal),
    ),
  );
  const lineas = lineasDelEje(maximo);
  const tope = lineas[lineas.length - 1];
  const ultimo = meses.length - 1;

  return (
    <div className="flex gap-2">
      {/* Eje de montos */}
      <div
        aria-hidden
        className="relative mb-6 w-12 shrink-0 texto-leyenda text-texto-secundario"
      >
        {lineas.map((linea) => (
          <span
            key={linea}
            className="absolute left-0 translate-y-1/2 whitespace-nowrap"
            style={{ bottom: porcentaje(linea, tope) }}
          >
            {formatearPesosCompactos(linea)}
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
              style={{ bottom: porcentaje(linea, tope) }}
            />
          ))}
        </div>

        <ol aria-label="Ventas por mes" className="relative flex h-46 lg:h-62">
          {meses.map(({ clave, reporte }, indice) => (
            <li
              key={clave}
              // Enfocable para ver el detalle con el teclado (el lector de pantalla ya lo lee)
              tabIndex={0}
              className="group relative flex flex-1 flex-col rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
            >
              <div className="relative flex flex-1 items-end justify-center gap-0.5 group-hover:bg-fondo-hueso-oscuro/35 group-focus-visible:bg-fondo-hueso-oscuro/35">
                {SERIES.map((serie) => {
                  const { montoTotal } = reporte[serie.campo];
                  return (
                    <div
                      key={serie.campo}
                      aria-hidden
                      className={cn(
                        'relative w-4 rounded-t-sm lg:w-7.5',
                        serie.color,
                      )}
                      style={{ height: porcentaje(montoTotal, tope) }}
                    >
                      {/* Monto del último mes sobre sus barras (Figma 2041:1388) */}
                      {indice === ultimo && montoTotal > 0 && (
                        <span className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 texto-leyenda whitespace-nowrap text-texto-principal max-lg:hidden">
                          {formatearPesosCompactos(montoTotal)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <span
                aria-hidden
                className="flex h-6 items-end justify-center texto-leyenda text-texto-secundario"
              >
                {abreviaturaMes(clave)}
              </span>

              {/* Detalle del mes (Figma 2041:1390) */}
              <div
                className={cn(
                  // En el celular no cabe junto a las barras (RNF-25): solo para el lector de pantalla
                  'pointer-events-none absolute top-1 z-10 flex flex-col gap-1 rounded-md bg-texto-principal px-3 py-2 texto-leyenda whitespace-nowrap text-texto-sobre-oscuro transition-opacity max-lg:sr-only lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100',
                  indice < meses.length / 2
                    ? 'left-full ml-1'
                    : 'right-full mr-1',
                  meses.length === 1 &&
                    'right-auto left-1/2 ml-0 -translate-x-1/2',
                )}
              >
                <span>{nombreMes(clave)}</span>
                {SERIES.map((serie) => (
                  <span key={serie.campo} className="flex items-center gap-1.5">
                    <Muestra color={serie.color} chica />
                    {serie.texto}: {textoTotales(reporte[serie.campo])}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
