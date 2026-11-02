'use client';

import { Receipt, Store } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { RadioGroup, RadioGroupItem } from '@/compartido/ui/radio-group';

/** Una sección numerada del formulario: «1. Entrega», «2. Documento». */
const SeccionCheckout = ({
  titulo,
  children,
}: {
  titulo: string;
  children: (idTitulo: string) => ReactNode;
}) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-3 md:gap-4"
    >
      <h2 id={idTitulo} className="titulo-h2 text-texto-principal">
        {titulo}
      </h2>
      {children(idTitulo)}
    </section>
  );
};

/**
 * E5-H3, criterio 1 · La entrega (Figma › 05 Checkout 2010:1088). Hoy solo retiro en tienda,
 * ya elegido; el despacho a domicilio con su dirección y costo lo agrega SCRUM-122.
 */
export const SeccionEntrega = () => {
  const idRetiro = useId();
  return (
    <SeccionCheckout titulo="1. ¿Cómo quieres recibirlo?">
      {(idTitulo) => (
        <RadioGroup aria-labelledby={idTitulo} value="retiro">
          <label
            htmlFor={idRetiro}
            className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-marca-profundo bg-marca-acento-suave px-4 py-4 md:px-6"
          >
            <RadioGroupItem id={idRetiro} value="retiro" />
            <Store
              className="hidden size-6 shrink-0 text-texto-principal md:block"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="texto-cuerpo-fuerte text-texto-principal">
                Retiro en tienda
              </span>
              <span className="texto-pequeno text-texto-secundario">
                Te avisamos por correo cuando tu pedido esté listo para retiro.
              </span>
            </span>
          </label>
        </RadioGroup>
      )}
    </SeccionCheckout>
  );
};

/**
 * E5-H3, criterio 1 · El documento (Figma › 05 Checkout 2010:1121). Hoy el comprobante
 * electrónico de pago; el interruptor «Necesito factura» lo agrega SCRUM-125.
 */
export const SeccionDocumento = () => (
  <SeccionCheckout titulo="2. Documento">
    {() => (
      <div className="flex items-center gap-4 rounded-lg border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie px-4 py-4 md:px-6">
        <Receipt
          className="size-6 shrink-0 text-texto-principal"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="texto-pequeno text-texto-secundario">
          Recibes el comprobante electrónico de pago en tu correo.
        </p>
      </div>
    )}
  </SeccionCheckout>
);
