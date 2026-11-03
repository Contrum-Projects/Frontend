'use client';

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
