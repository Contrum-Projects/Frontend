import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import { Separator } from '@/compartido/ui/separator';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { textoUnidades } from './textos';

interface ResumenCarritoProps {
  carrito: CarritoCuenta;
  unidades: number;
}

/**
 * Resumen (Figma › 04 Carrito 2008:872, celular 2035:4957): el total con IVA que entrega el
 * backend y «Continuar con la compra». Si el backend dice que el pedido no se puede crear
 * (`puedeCrearPedido`), el botón queda deshabilitado con el motivo debajo (criterio 2).
 */
export function ResumenCarrito({ carrito, unidades }: ResumenCarritoProps) {
  const idMotivo = useId();
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-3 rounded-xl border bg-fondo-superficie p-4 md:gap-4 md:p-8"
    >
      <h2
        id={idTitulo}
        className="sr-only md:not-sr-only md:mb-2 md:titulo-h2 md:text-texto-principal"
      >
        Resumen
      </h2>
      <dl className="flex flex-col gap-3 texto-pequeno md:gap-4">
        <div className="flex justify-between gap-4">
          <dt className="text-texto-secundario">
            Productos
            <span className="hidden md:inline">
              {' '}
              ({textoUnidades(unidades)})
            </span>
          </dt>
          <dd className="text-texto-principal tabular-nums">
            {formatearPesos(carrito.total)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-texto-secundario">Despacho</dt>
          <dd className="text-right text-texto-principal">
            <span className="hidden md:inline">
              Se calcula en el siguiente paso
            </span>
            <span className="md:hidden">En el siguiente paso</span>
          </dd>
        </div>
        <Separator className="hidden md:block" />
        <div className="flex items-baseline justify-between gap-4 md:pt-2">
          <dt className="texto-cuerpo-fuerte text-texto-principal">Total</dt>
          <dd className="texto-precio text-marca-profundo md:texto-precio-ficha-celular">
            {formatearPesos(carrito.total)}
          </dd>
        </div>
      </dl>
      <p className="texto-leyenda text-texto-secundario">IVA incluido</p>
      {carrito.puedeCrearPedido ? (
        <Button asChild size="grande" className="mt-1 w-full md:mt-2">
          {/* TODO(SCRUM-118): la pantalla de checkout */}
          <Link href={RUTAS.checkout}>
            Continuar con la compra
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      ) : (
        <>
          <Button
            type="button"
            size="grande"
            disabled
            aria-describedby={idMotivo}
            className="mt-1 w-full md:mt-2"
          >
            Continuar con la compra
            <ArrowRight aria-hidden />
          </Button>
          <p id={idMotivo} className="texto-leyenda text-estado-aviso-texto">
            Ajusta los productos marcados para continuar.
          </p>
        </>
      )}
    </section>
  );
}
