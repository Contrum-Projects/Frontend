'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { PerfilProfesionalCuenta } from '@/compartido/api/respuestas';
import { formatearFechaLarga } from '@/compartido/formato/fecha';
import { Button } from '@/compartido/ui/button';
import { textoEspecialidad, textoModalidad } from './opcionesPerfil';

const Dato = ({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <dt className="texto-etiqueta text-texto-secundario">{etiqueta}</dt>
    <dd className="texto-cuerpo break-words text-texto-principal">
      {children}
    </dd>
  </div>
);

/**
 * El perfil guardado (E10-H5, criterio 1). Tras guardar muestra la confirmación y la enfoca,
 * así el lector de pantalla la anuncia y el foco no queda en `body`.
 */
export const ResumenPerfil = ({
  perfil,
  recienGuardado,
  alEditar,
}: {
  perfil: PerfilProfesionalCuenta;
  recienGuardado: boolean;
  alEditar: () => void;
}) => {
  const confirmacion = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (recienGuardado) confirmacion.current?.focus();
  }, [recienGuardado]);
  const anos = perfil.anosExperiencia;

  return (
    <section
      aria-labelledby="titulo-perfil"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:p-6"
    >
      {recienGuardado && (
        <p
          ref={confirmacion}
          tabIndex={-1}
          role="status"
          className="flex items-center gap-2 rounded-md bg-marca-acento-suave px-4 py-3 texto-pequeno text-marca-profundo outline-none"
        >
          <Check aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
          Guardamos tu perfil profesional.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2
            id="titulo-perfil"
            className="texto-cuerpo-fuerte text-texto-principal"
          >
            Tu perfil profesional
          </h2>
          <p className="texto-leyenda text-texto-secundario">
            Actualizado el {formatearFechaLarga(perfil.fechaActualizacion)}.
          </p>
        </div>
        <Button
          variant="contorno"
          onClick={alEditar}
          className="w-full max-md:h-14 max-md:px-7 max-md:texto-cuerpo-fuerte sm:w-auto"
        >
          Editar perfil
        </Button>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <Dato etiqueta="Años de experiencia">
          {anos} {anos === 1 ? 'año' : 'años'}
        </Dato>
        <Dato etiqueta="Modalidad de trabajo">
          {textoModalidad(perfil.modalidad)}
        </Dato>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <dt className="texto-etiqueta text-texto-secundario">
            Especialidades
          </dt>
          <dd>
            <ul className="flex flex-wrap gap-2">
              {perfil.especialidades.map((especialidad) => (
                <li
                  key={especialidad}
                  className="rounded-full bg-marca-acento-suave px-4 py-2 texto-etiqueta text-marca-profundo"
                >
                  {textoEspecialidad(especialidad)}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {perfil.nombreLugarTrabajo && (
          <Dato etiqueta="Lugar de trabajo">{perfil.nombreLugarTrabajo}</Dato>
        )}
        {perfil.redSocial && (
          <Dato etiqueta="Red social">
            {/* El backend solo guarda enlaces https de Instagram, Facebook o TikTok; si no
                lo fuera, se muestra como texto y no como enlace */}
            {perfil.redSocial.startsWith('https://') ? (
              <a
                href={perfil.redSocial}
                target="_blank"
                rel="noopener noreferrer"
                className="text-marca-profundo underline underline-offset-4"
              >
                {perfil.redSocial}
              </a>
            ) : (
              perfil.redSocial
            )}
          </Dato>
        )}
      </dl>
    </section>
  );
};
