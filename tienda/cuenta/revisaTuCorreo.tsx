'use client';

import { MailIcon } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * «Revisa tu correo» (Figma 2034:4841): tras crear la cuenta, al abrir /confirmar-correo sin
 * enlace y tras pedir el enlace para recuperar la contraseña. En el registro «Reenviar correo»
 * no se muestra: el backend aún no tiene esa ruta.
 */
export const RevisaTuCorreo = ({
  email,
  mensaje,
  alCambiar,
  children,
}: {
  /** El correo recién escrito; sin él se habla de «tu correo». */
  email?: string;
  /** Reemplaza el texto de la confirmación de la cuenta (lo entrega el backend). */
  mensaje?: string;
  /** Vuelve al formulario con lo escrito («¿No es tu correo? Cambiarlo»). */
  alCambiar?: () => void;
  /** Acciones entre el texto y «Cambiarlo» («Reenviar correo»). */
  children?: ReactNode;
}) => {
  const titulo = useRef<HTMLHeadingElement>(null);

  // Lleva el foco al aviso, que reemplaza al formulario
  useEffect(() => {
    if (email) titulo.current?.focus();
  }, [email]);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex size-14 items-center justify-center rounded-full bg-marca-acento-suave text-marca-profundo">
        <MailIcon aria-hidden className="size-6 stroke-[1.75]" />
      </div>
      <h1 ref={titulo} tabIndex={-1} className="titulo-h2 outline-none">
        Revisa tu correo
      </h1>
      <p className="texto-pequeno text-texto-secundario">
        {mensaje ?? <TextoConfirmacion email={email} />}
      </p>
      {children}
      {alCambiar && (
        <button
          type="button"
          onClick={alCambiar}
          className="inline-flex min-h-10 cursor-pointer items-center texto-etiqueta text-marca-profundo outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
        >
          ¿No es tu correo? Cambiarlo
        </button>
      )}
    </div>
  );
};

const TextoConfirmacion = ({ email }: { email?: string }) => (
  <>
    {email ? (
      <>
        Te enviamos un enlace a{' '}
        <span className="break-all text-texto-principal">{email}</span> para
        confirmar tu cuenta.
      </>
    ) : (
      'Te enviamos un enlace a tu correo para confirmar tu cuenta.'
    )}{' '}
    Necesitas confirmarlo para comprar.
  </>
);
