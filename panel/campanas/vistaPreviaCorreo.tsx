'use client';

import { useState } from 'react';
import type { CorreoCampana } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Logo } from '@/compartido/marca/logo';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';

type Ancho = 'escritorio' | 'celular';

const ANCHOS: { valor: Ancho; texto: string }[] = [
  { valor: 'escritorio', texto: 'Escritorio' },
  { valor: 'celular', texto: 'Celular' },
];

interface VistaPreviaCorreoProps {
  vista: CorreoCampana | undefined;
  /** Mensaje de error del backend, si no se pudo armar. */
  error?: string;
  /** Aún falta el asunto o el mensaje: no hay correo que armar. */
  incompleta: boolean;
}

/** El remitente de todo correo de la tienda (RNF-26). La respuesta no lo trae: es la tienda. */
const REMITENTE = 'Cabello Perfecto';

/**
 * Los párrafos del texto plano que arma el backend (asunto, cuerpo, pie y enlace de baja,
 * separados por una línea en blanco), sin el asunto, que va en la cabecera.
 */
const parrafosDe = ({ asunto, texto }: CorreoCampana) => {
  const parrafos = texto.split(/\n\s*\n/).map((parrafo) => parrafo.trim());
  return (parrafos[0] === asunto ? parrafos.slice(1) : parrafos).filter(
    Boolean,
  );
};

/**
 * E12-H3, criterio 2 · El correo como lo verá quien lo recibe (P7a 2046:1781): remitente, asunto,
 * cuerpo y el pie con el enlace de baja que lleva todo correo publicitario (RNF-26). Lo arma el
 * backend (decisión del 6 nov, SCRUM-150); aquí se muestra su versión en texto (sin HTML crudo).
 */
export const VistaPreviaCorreo = ({
  vista,
  error,
  incompleta,
}: VistaPreviaCorreoProps) => {
  const [ancho, setAncho] = useState<Ancho>('escritorio');

  return (
    <section
      aria-labelledby="titulo-vista-previa"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="titulo-vista-previa"
          className="texto-cuerpo-fuerte text-texto-principal max-lg:sr-only"
        >
          Vista previa
        </h2>
        <div
          role="group"
          aria-label="Ancho de la vista previa"
          className="flex gap-3 max-lg:hidden"
        >
          {ANCHOS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={ancho === opcion.valor}
              onClick={() => setAncho(opcion.valor)}
              className="cursor-pointer rounded-sm texto-etiqueta text-texto-secundario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo aria-pressed:text-marca-profundo"
            >
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>
      {error && !vista ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <article
          aria-label="Correo"
          className={cn(
            'w-full self-center overflow-hidden rounded-lg border bg-fondo-superficie',
            ancho === 'celular' && 'lg:max-w-xs',
          )}
        >
          {incompleta ? (
            <p className="px-4 py-6 texto-pequeno text-texto-secundario">
              Escribe el asunto y el mensaje para ver el correo.
            </p>
          ) : vista ? (
            <Correo vista={vista} />
          ) : (
            <EsqueletoCorreo />
          )}
        </article>
      )}
    </section>
  );
};

const Correo = ({ vista }: { vista: CorreoCampana }) => (
  <>
    <header className="flex flex-col gap-1 border-b px-4 py-3">
      <p className="texto-leyenda text-texto-secundario">De: {REMITENTE}</p>
      <p className="texto-etiqueta wrap-break-word text-texto-principal">
        {vista.asunto}
      </p>
    </header>
    <div className="flex flex-col items-center gap-3 bg-fondo-hueso px-6 py-6">
      <Logo aria-hidden className="h-14 w-24 text-marca-logo" />
      <div className="flex w-full flex-col gap-3">
        {parrafosDe(vista).map((parrafo, indice) => (
          <p
            // Los párrafos no tienen id y su orden es el del texto
            key={indice}
            className="texto-pequeno wrap-break-word whitespace-pre-line text-texto-principal"
          >
            {parrafo}
          </p>
        ))}
      </div>
    </div>
  </>
);

const EsqueletoCorreo = () => (
  <div aria-hidden className="flex flex-col">
    <div className="flex flex-col gap-1 border-b px-4 py-3">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-4 w-56 max-w-full" />
    </div>
    <div className="flex flex-col gap-3 bg-fondo-hueso px-6 py-6">
      <Skeleton className="h-14 w-24 self-center" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="flex flex-col gap-1 px-4 py-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);
