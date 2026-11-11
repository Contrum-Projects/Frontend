'use client';

import { ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { problemaDelArchivo } from '@/panel/productos/fotosFormato';

interface CampoImagenProps {
  etiqueta: string;
  /** Tamaño recomendado y qué pasa si falta. */
  ayuda: string;
  /** Proporción de la vista previa: la misma con que la tienda la muestra. */
  proporcion: 'escritorio' | 'celular';
  archivo: File | null;
  alCambiar: (archivo: File | null) => void;
  /** Mensaje del backend (o de la revisión previa) para este campo. */
  error?: string;
  opcional?: boolean;
}

/** URL temporal para ver el archivo elegido; se libera al cambiarlo o al cerrar. */
const useVistaPrevia = (archivo: File | null) => {
  const url = useMemo(
    () => (archivo ? URL.createObjectURL(archivo) : null),
    [archivo],
  );
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
};

/**
 * Imagen de un slide nuevo, con su vista previa en la proporción de la tienda (12:5 en escritorio,
 * 4:5 en celular). Revisa el tipo y el peso antes de enviar, con los mismos mensajes del backend.
 */
export function CampoImagen({
  etiqueta,
  ayuda,
  proporcion,
  archivo,
  alCambiar,
  error,
  opcional = false,
}: CampoImagenProps) {
  const id = useId();
  const [problema, setProblema] = useState<string | null>(null);
  const vista = useVistaPrevia(archivo);
  const mensaje = problema ?? error;

  const alElegir = (evento: ChangeEvent<HTMLInputElement>) => {
    const elegido = evento.target.files?.[0];
    evento.target.value = '';
    if (!elegido) return;
    const motivo = problemaDelArchivo(elegido);
    setProblema(motivo);
    if (!motivo) alCambiar(elegido);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="texto-etiqueta text-texto-principal">
          {etiqueta}
          {opcional && (
            <span className="texto-pequeno text-texto-secundario">
              {' '}
              (opcional)
            </span>
          )}
        </label>
        {archivo && opcional && (
          <Button
            type="button"
            variant="link"
            size="icono-chico"
            className="w-auto gap-1 texto-pequeno"
            onClick={() => alCambiar(null)}
          >
            <X aria-hidden />
            Quitar
          </Button>
        )}
      </div>
      <label
        htmlFor={id}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-[1.5px] border-dashed border-texto-secundario bg-fondo-hueso texto-etiqueta text-marca-profundo focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-marca-profundo hover:bg-marca-acento-suave',
          proporcion === 'escritorio' ? 'aspect-[12/5]' : 'aspect-[4/5] w-40',
          vista && 'border-solid border-fondo-hueso-oscuro',
          mensaje && 'border-estado-error',
        )}
      >
        {vista ? (
          // Vista previa local (blob:), next/image no la optimiza
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vista}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <>
            <ImagePlus aria-hidden strokeWidth={1.75} className="size-5" />
            <span>Elegir imagen</span>
          </>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-describedby={`${id}-ayuda`}
          aria-invalid={mensaje ? true : undefined}
          onChange={alElegir}
        />
      </label>
      <p id={`${id}-ayuda`} className="texto-leyenda text-texto-secundario">
        {ayuda}
      </p>
      {mensaje && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {mensaje}
        </p>
      )}
    </div>
  );
}
