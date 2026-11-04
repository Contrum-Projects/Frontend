'use client';

import { File as IconoArchivo } from 'lucide-react';
import { useState, type Ref } from 'react';
import { cn } from '@/compartido/lib/utils';
import { ACEPTA } from './esquemaVerificacion';

/**
 * «Subir documento» (Figma 2020:1747): caja punteada para arrastrar archivos o elegirlos. El input
 * está dentro de la etiqueta, así que se abre con el teclado y el foco se ve en la caja.
 */
export const ZonaDocumentos = ({
  alElegir,
  error,
  ref,
}: {
  alElegir: (archivos: File[]) => void;
  error?: string;
  /** Para que el formulario enfoque la zona cuando falta un documento. */
  ref?: Ref<HTMLInputElement>;
}) => {
  const [encima, setEncima] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        onDragOver={(evento) => {
          evento.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(evento) => {
          evento.preventDefault();
          setEncima(false);
          alElegir(Array.from(evento.dataTransfer.files));
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-[1.5px] border-dashed border-texto-secundario bg-fondo-superficie px-4 py-8 text-center hover:bg-marca-acento-suave/40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marca-profundo md:py-12',
          encima && 'bg-marca-acento-suave/40',
          error && 'border-destructive',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-marca-acento-suave">
          <IconoArchivo
            aria-hidden
            className="size-6 text-marca-profundo"
            strokeWidth={1.75}
          />
        </span>
        <span className="texto-cuerpo text-texto-principal">
          <span className="max-md:hidden">Arrastra tu archivo o </span>
          <span className="texto-cuerpo-fuerte text-marca-profundo">
            <span className="md:hidden">Elige un documento</span>
            <span className="max-md:hidden">elige uno</span>
          </span>
        </span>
        <span className="texto-leyenda text-texto-secundario">
          PDF, JPG o PNG
        </span>
        <input
          ref={ref}
          type="file"
          multiple
          accept={ACEPTA}
          className="sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'documentos-error' : undefined}
          onChange={(evento) => {
            alElegir(Array.from(evento.target.files ?? []));
            // Permite volver a elegir el mismo archivo después de quitarlo
            evento.target.value = '';
          }}
        />
      </label>
      {error && (
        <p
          id="documentos-error"
          role="alert"
          className="texto-pequeno text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
};
