'use client';

import { CalendarIcon } from 'lucide-react';
import { useState, type Ref } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Calendar } from '@/compartido/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/compartido/ui/popover';
import type { PropsControl } from './campoFormulario';

/** «1990-05-21» → fecha local (sin hora), o `undefined` si viene vacío. */
const aFecha = (valor: string) => {
  const [anio, mes, dia] = valor.split('-').map(Number);
  return valor ? new Date(anio!, mes! - 1, dia) : undefined;
};

const dosCifras = (numero: number) => String(numero).padStart(2, '0');

/** Fecha local → «1990-05-21», el formato que recibe la API. */
const aTexto = (fecha: Date) =>
  `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

/** «1990-05-21» → «21/05/1990», como lo escribe una persona en Chile. */
const paraMostrar = (valor: string) => valor.split('-').reverse().join('/');

/**
 * Date picker de shadcn (Popover + Calendar) para una fecha sin hora (AAAA-MM-DD). El botón
 * tiene la caja de <Input>; el calendario abre con mes y año en listas, para llegar rápido a
 * una fecha antigua como la de nacimiento.
 */
export const SelectorFecha = ({
  valor,
  alCambiar,
  desde,
  hasta,
  control,
  ref,
}: {
  /** Para que el formulario enfoque el campo cuando tiene un error. */
  ref?: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Primer mes que se puede elegir. */
  desde: Date;
  /** Último día que se puede elegir. */
  hasta: Date;
  control: PropsControl;
}) => {
  const [abierto, setAbierto] = useState(false);
  const seleccionada = aFecha(valor);

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          {...control}
          className={cn(
            'flex h-[51px] w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border-[1.5px] border-input bg-fondo-superficie px-4 texto-cuerpo text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            !valor && 'text-muted-foreground',
          )}
        >
          {valor ? paraMostrar(valor) : 'dd/mm/aaaa'}
          <CalendarIcon
            aria-hidden
            className="size-5 shrink-0 stroke-[1.75] text-texto-secundario"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={seleccionada}
          defaultMonth={seleccionada ?? hasta}
          startMonth={desde}
          endMonth={hasta}
          disabled={{ after: hasta }}
          onSelect={(fecha) => {
            alCambiar(fecha ? aTexto(fecha) : '');
            setAbierto(false);
          }}
        />
        {valor && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                alCambiar('');
                setAbierto(false);
              }}
            >
              Quitar fecha
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
