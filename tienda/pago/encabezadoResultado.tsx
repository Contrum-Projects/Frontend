'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useRef, type ReactNode } from 'react';

const circulo = cva('flex size-14 items-center justify-center rounded-full', {
  variants: {
    tono: {
      exito: 'bg-marca-profundo text-texto-sobre-oscuro',
      aviso: 'bg-estado-aviso-fondo text-estado-aviso-texto',
      neutro: 'bg-fondo-hueso-oscuro text-texto-principal',
    },
  },
});

interface EncabezadoResultadoProps extends Required<
  VariantProps<typeof circulo>
> {
  icono: ReactNode;
  titulo: string;
  children: ReactNode;
}

/**
 * Ícono en un círculo de 56 px, título y mensaje (Figma › 09 Resultado del pago). El título
 * recibe el foco al aparecer: si el resultado cambia (el pago pendiente se confirma), el lector
 * de pantalla lo anuncia.
 */
export const EncabezadoResultado = ({
  tono,
  icono,
  titulo,
  children,
}: EncabezadoResultadoProps) => {
  const encabezado = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    encabezado.current?.focus();
  }, []);

  return (
    <>
      <div className={circulo({ tono })}>{icono}</div>
      <div className="flex flex-col gap-4 md:gap-2">
        <h1
          ref={encabezado}
          tabIndex={-1}
          className="titulo-h2 text-texto-principal outline-none md:titulo-h1"
        >
          {titulo}
        </h1>
        <p className="texto-pequeno text-texto-secundario md:texto-cuerpo">
          {children}
        </p>
      </div>
    </>
  );
};
