'use client';

import { Check } from 'lucide-react';
import { useId } from 'react';
import type { PreferenciaOfertas } from '@/compartido/api/respuestas';
import { formatearFechaLarga } from '@/compartido/formato/fecha';
import { Separator } from '@/compartido/ui/separator';
import { Switch } from '@/compartido/ui/switch';
import { useCambiarOfertas } from './consultasOfertas';

/** Lo que incluye la publicidad por correo (Figma 2066:3845 a 2066:3856). */
const INCLUYE = [
  'Campañas con ofertas y novedades de la tienda.',
  'Un saludo en tu cumpleaños, si registraste tu fecha de nacimiento.',
  'Recordatorios si dejas productos en el carrito.',
] as const;

const estadoActual = (acepta: boolean, fecha: string | null) => {
  if (!acepta) return 'No recibes ofertas por correo.';
  return fecha
    ? `Activado el ${formatearFechaLarga(fecha)}.`
    : 'Recibes ofertas por correo.';
};

/**
 * Tarjeta «Preferencia» (Figma 2066:3712). El interruptor guarda al tocarlo: Figma no tiene
 * botón «Guardar». No muestra el aviso de correo sin verificar (E12-H2, criterio 2): una cuenta
 * compradora no puede iniciar sesión sin verificarlo, así que aquí siempre lo está (SCRUM-150).
 */
export const TarjetaOfertas = ({
  preferencia,
}: {
  preferencia: PreferenciaOfertas;
}) => {
  const id = useId();
  const cambio = useCambiarOfertas();
  // Mientras guarda muestra lo pedido; si el backend lo rechaza, vuelve a lo guardado
  const acepta = cambio.isPending ? cambio.variables : preferencia.acepta;
  // El interruptor deshabilitado no se enfoca: el error se lee con su descripción
  const descripcion = [`${id}-estado`, cambio.isError && `${id}-error`]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="flex flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <div className="flex items-start gap-4">
        <Switch
          id={`${id}-interruptor`}
          checked={acepta}
          disabled={cambio.isPending}
          onCheckedChange={(valor) => cambio.mutate(valor)}
          aria-describedby={descripcion}
          className="order-last md:order-first"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2
            id={`${id}-titulo`}
            className="texto-cuerpo-fuerte text-texto-principal"
          >
            <label htmlFor={`${id}-interruptor`}>
              Recibir ofertas y novedades por correo
            </label>
          </h2>
          <p
            id={`${id}-estado`}
            aria-live="polite"
            className="texto-pequeno text-texto-secundario"
          >
            {/* Mientras guarda no se muestra el estado anterior junto al interruptor ya movido */}
            {cambio.isPending
              ? 'Guardando…'
              : estadoActual(
                  preferencia.acepta,
                  preferencia.fechaConsentimiento,
                )}
          </p>
        </div>
      </div>

      {cambio.isError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="texto-pequeno text-estado-error"
        >
          {cambio.error.message}
        </p>
      )}

      <Separator />

      <p className="texto-etiqueta text-texto-principal">
        Con esta opción activa recibes
      </p>
      <ul className="flex flex-col gap-3">
        {INCLUYE.map((texto) => (
          <li key={texto} className="flex items-start gap-3">
            <Check
              aria-hidden
              className="mt-0.5 size-4 shrink-0 stroke-[1.75] text-texto-principal"
            />
            <span className="texto-pequeno text-texto-principal">{texto}</span>
          </li>
        ))}
      </ul>
      <p className="texto-pequeno text-texto-secundario">
        Los correos de tus pedidos, pagos y cuenta llegan siempre, aunque
        desactives esta opción. También puedes darte de baja desde el enlace de
        cualquier correo de ofertas.
      </p>
    </section>
  );
};
