'use client';

import { Input } from '@/compartido/ui/input';
import { MensajeError } from './mensajeError';

interface CampoNumeroProps {
  id: string;
  /** Lo que se lee antes del campo («Compró en los últimos»). */
  etiqueta: string;
  /** Lo que va después («días»); el prefijo, antes del número («$»). */
  sufijo?: string;
  prefijo?: string;
  valor: number | null;
  alCambiar: (valor: number | null) => void;
  error?: string;
}

/**
 * Un número entero opcional del segmento (SCRUM-150): vacío es «sin ese filtro». Solo acepta
 * dígitos; si el rango sirve lo decide el backend y su mensaje queda debajo.
 */
export const CampoNumero = ({
  id,
  etiqueta,
  sufijo,
  prefijo,
  valor,
  alCambiar,
  error,
}: CampoNumeroProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="texto-pequeno text-texto-principal">
        {etiqueta}
      </label>
      <div className="flex items-center gap-1">
        {prefijo && (
          <span aria-hidden className="texto-pequeno text-texto-secundario">
            {prefijo}
          </span>
        )}
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={valor === null ? '' : String(valor)}
          onChange={(evento) => {
            const digitos = evento.target.value.replace(/\D/g, '');
            alCambiar(digitos === '' ? null : Number(digitos));
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-10 w-24"
        />
        {sufijo && (
          <span className="texto-pequeno text-texto-secundario">{sufijo}</span>
        )}
      </div>
    </div>
    <MensajeError id={`${id}-error`} mensaje={error} />
  </div>
);
