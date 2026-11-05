'use client';

import { type ReactNode, useId } from 'react';
import type {
  CambioSaludoCumpleanos,
  SaludoCumpleanos,
} from '@/compartido/api/respuestas';
import {
  formatearNumero,
  formatearPorcentaje,
} from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Separator } from '@/compartido/ui/separator';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Switch } from '@/compartido/ui/switch';
import {
  useCambiarSaludoCumpleanos,
  useSaludoCumpleanos,
} from './consultasCampanas';

const CLASES_TARJETA =
  'flex flex-col gap-3 rounded-lg border bg-card p-4 lg:p-6';

/**
 * Tarjeta «Saludo de cumpleaños» de «Campañas» (Figma P7 2045:1740, E12-H5). Los interruptores
 * guardan al tocarlos, sin botón «Guardar». En celular va completa sobre la lista (Figma solo
 * dibuja un resumen, pero la oferta también se cambia ahí). «Editar mensaje» no está: no hay
 * historia ni pantalla para editarlo.
 */
export const TarjetaCumpleanos = () => {
  const consulta = useSaludoCumpleanos();

  if (consulta.isPending) return <EsqueletoCumpleanos />;
  if (consulta.isError) {
    return (
      <section aria-labelledby="titulo-saludo-error" className={CLASES_TARJETA}>
        <h2
          id="titulo-saludo-error"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Saludo de cumpleaños
        </h2>
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      </section>
    );
  }
  return <ContenidoCumpleanos saludo={consulta.data} />;
};

const ContenidoCumpleanos = ({ saludo }: { saludo: SaludoCumpleanos }) => {
  const id = useId();
  const cambio = useCambiarSaludoCumpleanos();
  // Mientras guarda muestra lo pedido; si el backend lo rechaza, vuelve a lo guardado
  const mostrado = cambio.isPending
    ? { ...saludo, ...cambio.variables }
    : saludo;
  const error = cambio.isError ? `${id}-error` : undefined;
  // Mientras guarda no se usa `disabled`: sacaría el foco del interruptor recién tocado
  const guardar = (pedido: CambioSaludoCumpleanos) => {
    if (!cambio.isPending) cambio.mutate(pedido);
  };

  return (
    <section aria-labelledby={`${id}-titulo`} className={CLASES_TARJETA}>
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`${id}-titulo`}
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Saludo de cumpleaños
        </h2>
        {/* Nombrado por el título, sin <label>: tocar el título no cambia el saludo */}
        <Switch
          aria-labelledby={`${id}-titulo`}
          checked={mostrado.activo}
          aria-disabled={cambio.isPending || undefined}
          onCheckedChange={(activo) => guardar({ activo })}
          aria-describedby={[`${id}-descripcion`, error]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      <p
        id={`${id}-descripcion`}
        className="texto-pequeno text-texto-secundario"
      >
        Se envía una vez al año, el día del cumpleaños, a quienes registraron su
        fecha de nacimiento y aceptan publicidad.
      </p>

      <Separator />

      {/* E12-H5, criterio 2 · La oferta solo se decide con el saludo activo */}
      <div className="flex items-center justify-between gap-3 py-1">
        <label
          htmlFor={`${id}-oferta`}
          className={cn(
            'texto-etiqueta',
            mostrado.activo ? 'text-texto-principal' : 'text-texto-secundario',
          )}
        >
          Incluir oferta
        </label>
        <Switch
          id={`${id}-oferta`}
          checked={mostrado.incluyeOferta}
          disabled={!mostrado.activo}
          aria-disabled={cambio.isPending || undefined}
          onCheckedChange={(incluyeOferta) => guardar({ incluyeOferta })}
          aria-describedby={error}
        />
      </div>

      <Separator />

      <dl className="flex flex-col gap-2 texto-leyenda">
        <Dato termino="Asunto">{saludo.asunto}</Dato>
        <Dato termino="Este mes">
          {formatearNumero(saludo.programadosEsteMes)}{' '}
          {saludo.programadosEsteMes === 1
            ? 'saludo programado'
            : 'saludos programados'}
        </Dato>
        <Dato termino="Último mes">
          {saludo.porcentajeAperturaUltimoMes === null
            ? '—'
            : `${formatearPorcentaje(saludo.porcentajeAperturaUltimoMes)} de apertura`}
        </Dato>
      </dl>

      <p aria-live="polite" className="sr-only">
        {cambio.isPending ? 'Guardando…' : ''}
      </p>
      {cambio.isError && (
        <p id={error} role="alert" className="texto-pequeno text-estado-error">
          {cambio.error.message}
        </p>
      )}
    </section>
  );
};

const Dato = ({
  termino,
  children,
}: {
  termino: string;
  children: ReactNode;
}) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="shrink-0 text-texto-secundario">{termino}</dt>
    <dd className="min-w-0 text-right break-words text-texto-principal tabular-nums">
      {children}
    </dd>
  </div>
);

/** Con las mismas filas que la tarjeta, para que nada salte al cargar (RNF-17). */
const EsqueletoCumpleanos = () => (
  <div aria-hidden className={CLASES_TARJETA}>
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-6 w-44" />
      <Skeleton className="h-6 w-10 rounded-full" />
    </div>
    {/* Tres líneas de texto-pequeno (20 px de interlineado) */}
    <div className="flex flex-col">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
    </div>
    <Separator />
    <div className="flex items-center justify-between gap-3 py-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-10 rounded-full" />
    </div>
    <Separator />
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((fila) => (
        <div key={fila} className="flex justify-between gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
);
