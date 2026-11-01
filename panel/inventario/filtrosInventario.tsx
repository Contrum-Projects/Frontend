'use client';

import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { formatearDia } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Calendar } from '@/compartido/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/compartido/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { aFecha, aTexto } from '@/tienda/cuenta/selectorFecha';
import { bodegasDe, useUbicaciones } from './consultasEntradas';

/**
 * Filtros comunes de las listas de Inventario (Figma P5a, P5d y P5e): bodega, buscador, rango de
 * fechas y chips. Los aplica el backend.
 */

/** Espera tras la última tecla antes de buscar, para no pedir una búsqueda por letra. */
const ESPERA_BUSQUEDA_MS = 300;
/** Radix no admite un ítem con valor vacío. */
const TODAS = 'todas';

const PILDORA =
  'h-10 data-[size=sm]:h-10 rounded-full border-[1.5px] border-input bg-fondo-hueso px-4 texto-etiqueta text-texto-principal';

/** «Todas las bodegas» (valor vacío) o una bodega de las ubicaciones activas. */
export const FiltroBodega = ({
  valor,
  alCambiar,
  className,
}: {
  valor: string;
  alCambiar: (bodegaId: string) => void;
  className?: string;
}) => {
  const ubicaciones = useUbicaciones();
  const bodegas = bodegasDe(ubicaciones.data ?? []);
  if (ubicaciones.isError) {
    return (
      <p role="alert" className="texto-leyenda text-destructive">
        No pudimos cargar las bodegas: {ubicaciones.error.message}
      </p>
    );
  }
  return (
    <Select
      disabled={ubicaciones.isPending}
      value={valor || TODAS}
      onValueChange={(nuevo) => alCambiar(nuevo === TODAS ? '' : nuevo)}
    >
      <SelectTrigger
        size="sm"
        aria-label="Bodega"
        className={cn(PILDORA, 'lg:w-auto lg:min-w-44', className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={TODAS}>Todas las bodegas</SelectItem>
        {bodegas.map((bodega) => (
          <SelectItem key={bodega.id} value={String(bodega.id)}>
            {bodega.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/** Texto que se envía al backend al dejar de escribir. */
export const Buscador = ({
  id,
  etiqueta,
  placeholder,
  alCambiar,
}: {
  id: string;
  /** Para lectores de pantalla: «Buscar entradas por proveedor o documento». */
  etiqueta: string;
  placeholder: string;
  alCambiar: (texto: string) => void;
}) => {
  const [texto, setTexto] = useState('');
  // alCambiar cambia en cada render del padre: solo el texto vuelve a programar la búsqueda
  const buscar = useEffectEvent((valor: string) => alCambiar(valor));
  useEffect(() => {
    const espera = setTimeout(() => buscar(texto.trim()), ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(espera);
  }, [texto]);

  return (
    <div
      role="search"
      className="flex h-10 items-center gap-2 rounded-full border-[1.5px] bg-fondo-hueso px-4 focus-within:ring-[3px] focus-within:ring-ring/60 lg:w-80"
    >
      <Search
        className="size-4 shrink-0 text-texto-secundario"
        strokeWidth={1.75}
        aria-hidden
      />
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <input
        id={id}
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent texto-cuerpo text-texto-principal outline-none placeholder:text-texto-secundario lg:texto-pequeno"
      />
    </div>
  );
};

/** «1 sep 2026 – 12 oct 2026», «Desde 1 sep 2026», «Todas las fechas». */
const textoRango = (desde: string, hasta: string) => {
  if (desde && hasta) return `${formatearDia(desde)} – ${formatearDia(hasta)}`;
  if (desde) return `Desde ${formatearDia(desde)}`;
  if (hasta) return `Hasta ${formatearDia(hasta)}`;
  return 'Todas las fechas';
};

/** Rango de días (AAAA-MM-DD), hasta hoy. */
export const FiltroFechas = ({
  etiqueta,
  desde,
  hasta,
  alCambiar,
}: {
  /** «Fechas de recepción», «Período». */
  etiqueta: string;
  desde: string;
  hasta: string;
  alCambiar: (desde: string, hasta: string) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        aria-label={`${etiqueta}: ${textoRango(desde, hasta)}`}
        className={cn(PILDORA, 'justify-between hover:bg-fondo-hueso-oscuro')}
      >
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden className="text-texto-secundario" />
          {textoRango(desde, hasta)}
        </span>
        <ChevronDown aria-hidden />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto p-0">
      <Calendar
        mode="range"
        selected={{ from: aFecha(desde), to: aFecha(hasta) }}
        defaultMonth={aFecha(desde)}
        disabled={{ after: new Date() }}
        onSelect={(rango) =>
          alCambiar(
            rango?.from ? aTexto(rango.from) : '',
            rango?.to ? aTexto(rango.to) : '',
          )
        }
      />
      {(desde || hasta) && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => alCambiar('', '')}
          >
            Quitar fechas
          </Button>
        </div>
      )}
    </PopoverContent>
  </Popover>
);

export interface OpcionChip<T extends string> {
  valor: T;
  texto: string;
}

/**
 * Chips de filtro (Figma 2043:1311), uno a la vez. En celular pasan a otra línea si no caben,
 * como en P5d 2069:1548.
 */
export const ChipsFiltro = <T extends string>({
  etiqueta,
  opciones,
  valor,
  alCambiar,
}: {
  etiqueta: string;
  opciones: readonly OpcionChip<T>[];
  /** `null`: ninguno marcado (aún no se sabe cuál corresponde). */
  valor: T | null;
  alCambiar: (valor: T) => void;
}) => (
  <ul aria-label={etiqueta} className="flex flex-wrap gap-2">
    {opciones.map((opcion) => {
      const activo = opcion.valor === valor;
      return (
        <li key={opcion.valor}>
          <button
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(opcion.valor)}
            className={cn(
              'inline-flex min-h-10 cursor-pointer items-center rounded-full border-[1.5px] px-3 texto-etiqueta whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 lg:min-h-8',
              activo
                ? 'border-marca-profundo bg-marca-profundo text-texto-sobre-oscuro'
                : 'bg-fondo-superficie text-texto-principal hover:border-marca-profundo',
            )}
          >
            {opcion.texto}
          </button>
        </li>
      );
    })}
  </ul>
);
