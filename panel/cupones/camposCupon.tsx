'use client';

import type { ReactNode } from 'react';
import { Input } from '@/compartido/ui/input';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';

/** Una tarjeta del formulario de cupón, como las de Campañas. */
export const Tarjeta = ({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) => (
  <section
    aria-label={titulo}
    className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6"
  >
    <h2 className="texto-cuerpo-fuerte text-texto-principal">{titulo}</h2>
    {children}
  </section>
);

/**
 * Un entero opcional (pesos, porcentaje o usos): vacío es «sin valor». Solo acepta dígitos; si el
 * valor sirve lo decide el backend y su mensaje queda debajo.
 */
export const CampoEntero = ({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  prefijo,
  sufijo,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor: number | null;
  alCambiar: (valor: number | null) => void;
  error?: string;
  prefijo?: string;
  sufijo?: string;
  ayuda?: string;
}) => (
  <CampoFormulario id={id} etiqueta={etiqueta} error={error}>
    {(control) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {prefijo && (
            <span aria-hidden className="texto-pequeno text-texto-secundario">
              {prefijo}
            </span>
          )}
          <Input
            {...control}
            aria-describedby={
              [control['aria-describedby'], ayuda && `${id}-ayuda`]
                .filter(Boolean)
                .join(' ') || undefined
            }
            inputMode="numeric"
            autoComplete="off"
            value={valor === null ? '' : String(valor)}
            onChange={(evento) => {
              const digitos = evento.target.value.replace(/\D/g, '');
              alCambiar(digitos === '' ? null : Number(digitos));
            }}
            className="max-w-40"
          />
          {sufijo && (
            <span className="texto-pequeno text-texto-secundario">
              {sufijo}
            </span>
          )}
        </div>
        {ayuda && (
          <p id={`${id}-ayuda`} className="texto-leyenda text-texto-secundario">
            {ayuda}
          </p>
        )}
      </div>
    )}
  </CampoFormulario>
);
