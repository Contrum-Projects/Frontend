'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Aviso que reemplaza a un formulario o a un esqueleto de la cuenta: ícono, título, mensaje
 * del backend y acciones (confirmación del correo, recuperación de la contraseña). El foco va
 * al título para que se anuncie.
 */
export const ResultadoCuenta = ({
  icono,
  titulo,
  mensaje,
  children,
}: {
  icono: ReactNode;
  titulo: string;
  mensaje: ReactNode;
  children?: ReactNode;
}) => {
  const encabezado = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    encabezado.current?.focus();
  }, [titulo]);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex size-14 items-center justify-center rounded-full bg-marca-acento-suave text-marca-profundo">
        {icono}
      </div>
      <h1 ref={encabezado} tabIndex={-1} className="titulo-h2 outline-none">
        {titulo}
      </h1>
      <p className="texto-pequeno text-texto-secundario">{mensaje}</p>
      {children}
    </div>
  );
};
