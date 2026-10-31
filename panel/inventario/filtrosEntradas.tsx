'use client';

import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { formatearDia } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';
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
import {
  bodegasDe,
  useUbicaciones,
  type FiltrosEntradas as Filtros,
} from './consultasEntradas';

/** Espera tras la última tecla antes de buscar, para no pedir una búsqueda por letra. */
const ESPERA_BUSQUEDA_MS = 300;
/** Radix no admite un ítem con valor vacío. */
const TODAS = 'todas';

const PILDORA =
  'h-10 rounded-full border-[1.5px] border-input bg-fondo-hueso px-4 texto-etiqueta text-texto-principal';

/**
 * Filtros de «Entradas» (Figma P5e 2064:2670): bodega, proveedor o documento y rango de fechas.
 * Los aplica el backend.
 */
export const FiltrosEntradas = ({
  filtros,
  alCambiar,
}: {
  filtros: Filtros;
  alCambiar: (filtros: Filtros) => void;
}) => {
  const cambiar = (parcial: Partial<Filtros>) =>
    alCambiar({ ...filtros, ...parcial });
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <FiltroBodega
        valor={filtros.bodegaId}
        alCambiar={(bodegaId) => cambiar({ bodegaId })}
      />
      <Buscador alCambiar={(buscar) => cambiar({ buscar })} />
      <FiltroFechas
        desde={filtros.desde}
        hasta={filtros.hasta}
        alCambiar={(desde, hasta) => cambiar({ desde, hasta })}
      />
    </div>
  );
};

const FiltroBodega = ({
  valor,
  alCambiar,
}: {
  valor: string;
  alCambiar: (bodegaId: string) => void;
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
        className={cn(PILDORA, 'lg:w-auto lg:min-w-44')}
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

/** «Proveedor o documento»: se envía al backend al dejar de escribir. */
const Buscador = ({ alCambiar }: { alCambiar: (texto: string) => void }) => {
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
      <label htmlFor="buscar-entradas" className="sr-only">
        Buscar entradas por proveedor o documento
      </label>
      <input
        id="buscar-entradas"
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Proveedor o documento"
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

const FiltroFechas = ({
  desde,
  hasta,
  alCambiar,
}: {
  desde: string;
  hasta: string;
  alCambiar: (desde: string, hasta: string) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        aria-label={`Fechas de recepción: ${textoRango(desde, hasta)}`}
        className={cn(PILDORA, 'justify-between hover:bg-fondo-hueso-oscuro')}
      >
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden className="text-texto-secundario" />
          {textoRango(desde, hasta)}
        </span>
        <ChevronDown aria-hidden />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="entradas-desde">Desde</Label>
        <Input
          id="entradas-desde"
          type="date"
          value={desde}
          max={hasta || undefined}
          onChange={(evento) => alCambiar(evento.target.value, hasta)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="entradas-hasta">Hasta</Label>
        <Input
          id="entradas-hasta"
          type="date"
          value={hasta}
          min={desde || undefined}
          onChange={(evento) => alCambiar(desde, evento.target.value)}
        />
      </div>
      {(desde || hasta) && (
        <Button
          variant="link"
          className="self-start"
          onClick={() => alCambiar('', '')}
        >
          Quitar fechas
        </Button>
      )}
    </PopoverContent>
  </Popover>
);
