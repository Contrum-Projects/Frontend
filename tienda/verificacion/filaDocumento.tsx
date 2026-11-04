'use client';

import { File as IconoArchivo, X } from 'lucide-react';
import type { TipoDocumentoVerificacion } from '@/compartido/api/respuestas';
import { Button } from '@/compartido/ui/button';
import { Label } from '@/compartido/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { formatearTamano, TIPOS_DOCUMENTO } from './esquemaVerificacion';

/**
 * Un archivo elegido (Figma 2020:1756): nombre, tamaño y quitar. El backend pide el tipo de cada
 * documento (E10-H2), que Figma no muestra: va en un selector junto al archivo (SCRUM-134).
 */
export const FilaDocumento = ({
  indice,
  archivo,
  tipo,
  error,
  alCambiarTipo,
  alQuitar,
}: {
  indice: number;
  archivo: File;
  tipo: TipoDocumentoVerificacion | '';
  error?: string;
  alCambiarTipo: (tipo: TipoDocumentoVerificacion) => void;
  alQuitar: () => void;
}) => {
  const idTipo = `documento-${indice}-tipo`;
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-fondo-hueso-oscuro bg-fondo-superficie px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_13rem_auto] sm:items-end">
      <IconoArchivo
        aria-hidden
        className="size-5 text-texto-principal"
        strokeWidth={1.75}
      />
      <div className="flex min-w-0 flex-col">
        <span className="texto-etiqueta wrap-anywhere text-texto-principal">
          {archivo.name}
        </span>
        <span className="texto-leyenda text-texto-secundario">
          {formatearTamano(archivo.size)}
        </span>
      </div>
      {/* En celular, debajo del nombre a todo el ancho; en escritorio, entre el nombre y quitar */}
      <div className="col-span-3 row-start-2 flex flex-col gap-1.5 sm:col-span-1 sm:col-start-3 sm:row-start-1">
        <Label htmlFor={idTipo}>Tipo de documento</Label>
        <Select
          value={tipo || undefined}
          onValueChange={(valor) =>
            alCambiarTipo(valor as TipoDocumentoVerificacion)
          }
        >
          <SelectTrigger
            id={idTipo}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${idTipo}-error` : undefined}
            className="w-full"
          >
            <SelectValue placeholder="¿Qué documento es?" />
          </SelectTrigger>
          <SelectContent position="popper">
            {TIPOS_DOCUMENTO.map(({ valor, texto }) => (
              <SelectItem key={valor} value={valor}>
                {texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p
            id={`${idTipo}-error`}
            role="alert"
            className="texto-pequeno text-destructive"
          >
            {error}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icono"
        aria-label={`Quitar ${archivo.name}`}
        onClick={alQuitar}
        className="col-start-3 row-start-1 sm:col-start-4"
      >
        <X />
      </Button>
    </li>
  );
};
