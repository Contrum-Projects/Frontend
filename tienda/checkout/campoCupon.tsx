'use client';

import { TicketPercent, X } from 'lucide-react';
import { useId, useState } from 'react';
import type { CuponCarrito } from '@/compartido/api/respuestas';
import { ErrorDeApi } from '@/compartido/api/errores';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { useValidarCupon } from './consultasCheckout';

interface CampoCuponProps {
  cupon: CuponCarrito | null;
  alCambiar: (cupon: CuponCarrito | null) => void;
  /** Mientras se crea el pedido no se cambia el cupón. */
  deshabilitado?: boolean;
}

/** El mensaje del backend para el código (va en `codigoCupon`) o el general. */
const mensajeDe = (error: Error) =>
  error instanceof ErrorDeApi
    ? (error.errores.find((e) => e.campo === 'codigoCupon')?.mensaje ??
      error.message)
    : error.message;

/**
 * «¿Tienes un cupón?» (SCRUM-150; sin diseño en Figma, sigue el resumen del checkout). El backend
 * decide si aplica y cuánto descuenta; su mensaje queda bajo el campo, sin perder lo escrito.
 */
export const CampoCupon = ({
  cupon,
  alCambiar,
  deshabilitado = false,
}: CampoCuponProps) => {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [codigo, setCodigo] = useState('');
  const validar = useValidarCupon();

  if (cupon) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-md bg-marca-acento-suave p-3">
        <p className="flex min-w-0 items-start gap-2 texto-pequeno text-marca-profundo">
          <TicketPercent
            aria-hidden
            strokeWidth={1.75}
            className="size-5 shrink-0"
          />
          <span className="min-w-0">
            <span className="texto-etiqueta">{cupon.codigo}</span> aplicado: −
            {formatearPesos(cupon.descuento)}
            {cupon.descripcion && (
              <span className="block text-texto-secundario">
                {cupon.descripcion}
              </span>
            )}
          </span>
        </p>
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => {
            alCambiar(null);
            setCodigo('');
          }}
          aria-label={`Quitar el cupón ${cupon.codigo}`}
          className="-m-2 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-marca-profundo hover:bg-fondo-superficie focus-visible:outline-2 focus-visible:outline-marca-profundo disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>
    );
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 texto-etiqueta text-marca-profundo underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
      >
        <TicketPercent aria-hidden strokeWidth={1.75} className="size-4" />
        ¿Tienes un cupón?
      </button>
    );
  }

  const error = validar.error ? mensajeDe(validar.error) : null;
  return (
    <form
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault();
        const limpio = codigo.trim();
        if (!limpio) return;
        validar.mutate(limpio, { onSuccess: alCambiar });
      }}
      className="flex flex-col gap-1"
    >
      <label htmlFor={id} className="texto-etiqueta text-texto-principal">
        Código del cupón
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 uppercase"
        />
        <Button
          type="submit"
          variant="contorno"
          disabled={deshabilitado || validar.isPending || !codigo.trim()}
          aria-busy={validar.isPending}
        >
          Aplicar
          {validar.isPending && <Spinner aria-label="Revisando el cupón" />}
        </Button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="texto-pequeno text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
};
