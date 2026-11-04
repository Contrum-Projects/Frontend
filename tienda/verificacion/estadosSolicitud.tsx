'use client';

import { BadgeCheck, Clock, File as IconoArchivo, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { SolicitudVerificacionCuenta } from '@/compartido/api/respuestas';
import { formatearFechaLarga } from '@/compartido/formato/fecha';
import { formatearRut } from '@/compartido/formato/rut';
import { Button } from '@/compartido/ui/button';
import { textoTipoDocumento } from './esquemaVerificacion';

/**
 * Título del estado. Si la pantalla acaba de cambiar (se envió la solicitud), recibe el foco para
 * que no quede en `body` y el lector de pantalla lo anuncie.
 */
const TituloEstado = ({
  enfocar,
  className,
  children,
}: {
  enfocar: boolean;
  className: string;
  children: string;
}) => {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (enfocar) titulo.current?.focus();
  }, [enfocar]);
  return (
    <h2
      ref={titulo}
      id="titulo-estado"
      tabIndex={-1}
      className={`titulo-h3 outline-none ${className}`}
    >
      {children}
    </h2>
  );
};

/**
 * «Solicitud en revisión» (Figma 2020:3006): el personal revisa los documentos (E10-H3). El
 * backend no avisa por correo un rechazo, así que el texto no lo promete.
 */
export const SolicitudEnRevision = ({
  solicitud,
  rut,
  enfocar = false,
}: {
  solicitud: SolicitudVerificacionCuenta;
  rut: string | null;
  enfocar?: boolean;
}) => (
  <>
    <section
      aria-labelledby="titulo-estado"
      className="flex flex-col gap-2 rounded-lg bg-marca-acento-suave p-4 md:p-6"
    >
      <div className="flex items-center gap-2">
        <Clock
          aria-hidden
          className="size-6 shrink-0 text-marca-profundo"
          strokeWidth={1.75}
        />
        <TituloEstado enfocar={enfocar} className="text-marca-profundo">
          Solicitud en revisión
        </TituloEstado>
      </div>
      <p className="texto-pequeno text-texto-principal">
        La recibimos el {formatearFechaLarga(solicitud.fechaSolicitud)}. El
        equipo de la tienda revisará tus documentos y aquí verás el resultado.
      </p>
    </section>
    {solicitud.documentos.length > 0 && (
      <section
        aria-labelledby="titulo-documentos"
        className="flex flex-col gap-4 rounded-lg border border-fondo-hueso-oscuro bg-fondo-superficie p-4 md:p-6"
      >
        <h2
          id="titulo-documentos"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Documentos enviados
        </h2>
        <ul className="flex flex-col gap-3">
          {solicitud.documentos.map((documento, indice) => (
            <li
              key={`${documento.nombreArchivo}-${indice}`}
              className="flex items-center gap-3"
            >
              <IconoArchivo
                aria-hidden
                className="size-5 shrink-0 text-texto-principal"
                strokeWidth={1.75}
              />
              <div className="flex min-w-0 flex-col">
                <span className="texto-etiqueta wrap-anywhere text-texto-principal">
                  {documento.nombreArchivo}
                </span>
                <span className="texto-leyenda text-texto-secundario">
                  {textoTipoDocumento(documento.tipo)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )}
    {rut && (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-fondo-hueso-oscuro bg-fondo-superficie p-4 md:px-6">
        <span className="texto-etiqueta text-texto-principal">RUT</span>
        <span className="texto-pequeno text-texto-secundario">
          {formatearRut(rut)}
        </span>
      </div>
    )}
  </>
);

/** «Tu solicitud no fue aprobada» (Figma 2038:2518): el motivo y enviar una nueva. */
export const SolicitudRechazada = ({
  solicitud,
  alReenviar,
}: {
  solicitud: SolicitudVerificacionCuenta;
  alReenviar: () => void;
}) => (
  <>
    <section
      aria-labelledby="titulo-estado"
      className="flex flex-col gap-2 rounded-lg bg-estado-aviso-fondo p-4 md:p-6"
    >
      <div className="flex items-center gap-2">
        <X
          aria-hidden
          className="size-6 shrink-0 text-estado-aviso-texto"
          strokeWidth={1.75}
        />
        <TituloEstado enfocar={false} className="text-estado-aviso-texto">
          Tu solicitud no fue aprobada
        </TituloEstado>
      </div>
      {solicitud.motivoRechazo && (
        <p className="texto-pequeno wrap-anywhere text-texto-principal">
          Motivo: {solicitud.motivoRechazo}
        </p>
      )}
      {solicitud.fechaResolucion && (
        <p className="texto-leyenda text-texto-secundario">
          Revisada el {formatearFechaLarga(solicitud.fechaResolucion)}
        </p>
      )}
    </section>
    <Button
      size="grande"
      className="w-full sm:w-auto sm:self-start"
      onClick={alReenviar}
    >
      Enviar nueva solicitud
    </Button>
  </>
);

/**
 * «Cuenta verificada» (Figma 08c, 2038:2666 y 2038:5397; E10-H4). Debajo va la invitación a
 * completar el perfil profesional, que la pantalla agrega aparte.
 */
export const CuentaProfesionalActiva = ({
  enfocar = false,
}: {
  enfocar?: boolean;
}) => (
  <section
    aria-labelledby="titulo-estado"
    className="flex items-center gap-3 rounded-lg bg-marca-acento-suave p-4 md:p-6"
  >
    <BadgeCheck
      aria-hidden
      className="size-6 shrink-0 text-marca-profundo"
      strokeWidth={1.75}
    />
    <div className="flex min-w-0 flex-col gap-1">
      <TituloEstado enfocar={enfocar} className="text-marca-profundo">
        Cuenta verificada
      </TituloEstado>
      <p className="texto-pequeno text-texto-principal">
        Ya ves el precio profesional en todo el catálogo.
      </p>
    </div>
  </section>
);
