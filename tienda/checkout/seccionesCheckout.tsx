'use client';

import { Receipt } from 'lucide-react';
import { useId, type ReactNode } from 'react';

/** Una sección numerada del formulario: «1. Entrega», «2. Documento». */
export const SeccionCheckout = ({
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
