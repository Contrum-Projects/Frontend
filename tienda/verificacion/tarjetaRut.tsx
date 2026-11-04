import { Check } from 'lucide-react';
import Link from 'next/link';
import type { Ref } from 'react';
import { formatearRut } from '@/compartido/formato/rut';
import { cn } from '@/compartido/lib/utils';
import { RUTAS } from '@/tienda/diseno/enlaces';

/**
 * «RUT de tu cuenta» (Figma 2020:1740). La verificación usa el RUT registrado en Mis datos
 * (E10-H1): aquí solo se muestra y se enlaza para editarlo. Con la solicitud abierta el backend no
 * deja cambiarlo, así que no lleva enlace.
 */
export const TarjetaRut = ({
  rut,
  editable,
  error,
  refEnlace,
}: {
  rut: string | null;
  editable: boolean;
  error?: string;
  refEnlace?: Ref<HTMLAnchorElement>;
}) => (
  <div className="flex flex-col gap-1.5">
    <div
      className={cn(
        'flex min-h-16 items-center gap-3 rounded-lg border border-fondo-hueso-oscuro bg-fondo-superficie px-4 py-3',
        error && 'border-destructive',
      )}
    >
      {rut && (
        <Check
          aria-hidden
          className="size-5 shrink-0 text-marca-acento"
          strokeWidth={1.75}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="texto-etiqueta text-texto-principal">
          RUT de tu cuenta
        </span>
        <span className="texto-pequeno text-texto-secundario">
          {rut ? formatearRut(rut) : 'Aún no registras tu RUT'}
        </span>
      </div>
      {editable && (
        <Link
          ref={refEnlace}
          href={RUTAS.misDatos}
          aria-describedby={error ? 'rut-error' : undefined}
          className="flex min-h-10 items-center texto-etiqueta text-marca-profundo hover:underline"
        >
          {rut ? 'Editar' : 'Registrar RUT'}
        </Link>
      )}
    </div>
    {error && (
      <p id="rut-error" role="alert" className="texto-pequeno text-destructive">
        {error}
      </p>
    )}
  </div>
);
