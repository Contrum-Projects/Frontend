import { cn } from '@/compartido/lib/utils';

const PASOS = ['Entrega', 'Documento', 'Pago'] as const;

/** Entrega y documento se eligen en esta pantalla; el pago sigue en Mercado Pago. */
const PASO_ACTUAL = 2;

/**
 * Pasos del checkout (Figma › 05 Checkout 2010:1071; celular 2010:2211, «Paso 2 de 3»).
 * Los pasos hechos y el actual van en profundo; los que faltan, en hueso oscuro.
 */
export const PasosCheckout = () => (
  <>
    <p className="texto-pequeno text-texto-secundario md:hidden">
      Paso {PASO_ACTUAL} de {PASOS.length}
    </p>
    <ol
      aria-label="Pasos de la compra"
      className="hidden items-center gap-3 md:flex"
    >
      {PASOS.map((paso, indice) => {
        const numero = indice + 1;
        const alcanzado = numero <= PASO_ACTUAL;
        return (
          <li
            key={paso}
            aria-current={numero === PASO_ACTUAL ? 'step' : undefined}
            className="flex items-center gap-3"
          >
            {indice > 0 && (
              <span aria-hidden className="h-0.5 w-12 bg-fondo-hueso-oscuro" />
            )}
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  'flex size-7 items-center justify-center rounded-full texto-leyenda',
                  alcanzado
                    ? 'bg-marca-profundo text-texto-sobre-oscuro'
                    : 'bg-fondo-hueso-oscuro text-texto-secundario',
                )}
              >
                {numero}
              </span>
              <span
                className={cn(
                  'texto-etiqueta',
                  alcanzado ? 'text-texto-principal' : 'text-texto-secundario',
                )}
              >
                {paso}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  </>
);
