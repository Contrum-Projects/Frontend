'use client';

import { Store, Truck, type LucideIcon } from 'lucide-react';
import { useId, useRef, type ReactNode, type Ref } from 'react';
import { formatearPesos } from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { RadioGroup, RadioGroupItem } from '@/compartido/ui/radio-group';
import { Skeleton } from '@/compartido/ui/skeleton';
import { DireccionDespacho } from './direccionDespacho';
import { SeccionCheckout } from './seccionesCheckout';
import type { Entrega, TipoEntrega } from './useEntrega';

/**
 * E7-H1 · «¿Cómo quieres recibirlo?» (Figma › 05 Checkout 2010:1088; celular 2010:2254):
 * despacho a domicilio, con su dirección y el costo que cotiza el backend, o retiro en tienda.
 *
 * Figma pone la dirección entre las dos opciones. Para respetar ese orden sin dejar botones ni
 * otro grupo de radios dentro de un `radiogroup`, el contenedor es un `group`: las flechas siguen
 * pasando de una opción a la otra.
 */
export const SeccionEntrega = ({ entrega }: { entrega: Entrega }) => {
  const conDespacho = entrega.tipo === 'despacho';
  const { cotizacion } = entrega;
  const radioRetiro = useRef<HTMLButtonElement>(null);
  return (
    <SeccionCheckout titulo="1. ¿Cómo quieres recibirlo?">
      {(idTitulo) => (
        <RadioGroup
          role="group"
          aria-labelledby={idTitulo}
          value={entrega.tipo}
          onValueChange={(valor) => entrega.cambiarTipo(valor as TipoEntrega)}
          className="gap-3"
        >
          <OpcionEntrega
            valor="despacho"
            elegida={conDespacho}
            Icono={Truck}
            titulo="Despacho a domicilio"
            descripcion="Chilexpress, cotizado para tu comuna."
            costo={conDespacho && <CostoDespacho entrega={entrega} />}
          />
          {conDespacho && <DireccionDespacho entrega={entrega} />}
          {conDespacho && cotizacion.isError && (
            <Alert variant="aviso" className="md:ml-16 md:w-auto">
              <AlertDescription className="flex flex-col items-start gap-3">
                <p>{cotizacion.error.message}</p>
                {entrega.ofreceRetiro && (
                  <Button
                    variant="contorno"
                    onClick={() => {
                      entrega.cambiarTipo('retiro');
                      // El aviso desaparece: el foco pasa a la opción que quedó elegida
                      radioRetiro.current?.focus();
                    }}
                  >
                    Retirar en tienda
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          <OpcionEntrega
            refRadio={radioRetiro}
            valor="retiro"
            elegida={!conDespacho}
            Icono={Store}
            titulo="Retiro en tienda"
            descripcion="Te avisamos por correo cuando tu pedido esté listo para retiro."
          />
        </RadioGroup>
      )}
    </SeccionCheckout>
  );
};

/** El costo con IVA que entrega el backend; mientras cotiza, un esqueleto. */
const CostoDespacho = ({ entrega }: { entrega: Entrega }) => {
  const { cotizacion, direccion } = entrega;
  if (!direccion || cotizacion.isError) return null;
  if (cotizacion.isPending) {
    return (
      <>
        <Skeleton aria-hidden className="h-6 w-16" />
        <span className="sr-only">Cotizando el despacho</span>
      </>
    );
  }
  return (
    <span className="texto-cuerpo-fuerte text-texto-principal tabular-nums">
      {formatearPesos(cotizacion.data.costo)}
    </span>
  );
};

/**
 * Una opción de entrega: elegida, borde profundo sobre acento suave. El foco se marca en toda la
 * tarjeta, no solo en el círculo.
 */
const OpcionEntrega = ({
  refRadio,
  valor,
  elegida,
  Icono,
  titulo,
  descripcion,
  costo,
}: {
  refRadio?: Ref<HTMLButtonElement>;
  valor: TipoEntrega;
  elegida: boolean;
  Icono: LucideIcon;
  titulo: string;
  descripcion: string;
  costo?: ReactNode;
}) => {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-lg px-4 py-4 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60 md:px-6',
        elegida
          ? 'border-2 border-marca-profundo bg-marca-acento-suave'
          : 'border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie',
      )}
    >
      <RadioGroupItem ref={refRadio} id={id} value={valor} />
      <Icono
        className="hidden size-6 shrink-0 text-texto-principal md:block"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="texto-cuerpo-fuerte text-texto-principal">
          {titulo}
        </span>
        <span className="texto-pequeno text-texto-secundario">
          {descripcion}
        </span>
      </span>
      {costo}
    </label>
  );
};
