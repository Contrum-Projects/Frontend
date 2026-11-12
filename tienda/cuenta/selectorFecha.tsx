'use client';

import { CalendarIcon } from 'lucide-react';
import { useState, type Ref } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Calendar } from '@/compartido/ui/calendar';
import { Input } from '@/compartido/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/compartido/ui/popover';
import type { PropsControl } from './campoFormulario';

/** «1990-05-21» (o «1990-05-21T18:30») → fecha local (sin hora), o `undefined` si viene vacío. */
export const aFecha = (valor: string) => {
  const [anio, mes, dia] = valor.slice(0, 10).split('-').map(Number);
  return valor ? new Date(anio!, mes! - 1, dia) : undefined;
};

const dosCifras = (numero: number) => String(numero).padStart(2, '0');

/** Fecha local → «1990-05-21», el formato que recibe la API. */
export const aTexto = (fecha: Date) =>
  `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

/** «1990-05-21» → «21/05/1990»; «2026-11-12T18:30» → «12/11/2026 18:30», como en Chile. */
const paraMostrar = (valor: string) => {
  const [dia, hora] = valor.split('T');
  const fecha = dia!.split('-').reverse().join('/');
  return hora ? `${fecha} ${hora}` : fecha;
};

/**
 * Date picker de shadcn (Popover + Calendar). Sin `conHora`, una fecha sin hora (AAAA-MM-DD);
 * con `conHora`, fecha y hora local (AAAA-MM-DDTHH:mm, como `datetime-local`) y un campo de hora
 * bajo el calendario. El botón tiene la caja de <Input>; el calendario abre con mes y año en
 * listas, para llegar rápido a una fecha antigua como la de nacimiento.
 */
export const SelectorFecha = ({
  valor,
  alCambiar,
  desde,
  hasta,
  mesInicial,
  conHora = false,
  horaInicial = '00:00',
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
  /** Mes que muestra el calendario sin fecha elegida; si falta, el de `hasta`. */
  mesInicial?: Date;
  /** Pide también la hora y entrega AAAA-MM-DDTHH:mm. */
  conHora?: boolean;
  /** Con `conHora`: la hora que toma un día recién elegido (HH:mm), p. ej. «23:59» para un fin. */
  horaInicial?: string;
  control: PropsControl;
}) => {
  const [abierto, setAbierto] = useState(false);
  const seleccionada = aFecha(valor);
  const hora = valor.split('T')[1] ?? '';

  const elegirDia = (fecha: Date | undefined) => {
    if (!fecha) return alCambiar('');
    if (!conHora) {
      alCambiar(aTexto(fecha));
      return setAbierto(false);
    }
    // Se queda abierto para ajustar la hora
    alCambiar(`${aTexto(fecha)}T${hora || horaInicial}`);
  };

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
          {valor
            ? paraMostrar(valor)
            : conHora
              ? 'dd/mm/aaaa hh:mm'
              : 'dd/mm/aaaa'}
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
          defaultMonth={seleccionada ?? mesInicial ?? hasta}
          startMonth={desde}
          endMonth={hasta}
          disabled={{ after: hasta }}
          onSelect={elegirDia}
        />
        {conHora && (
          <div className="flex items-center gap-3 border-t p-3">
            <label
              htmlFor={`${control.id}-hora`}
              className="texto-etiqueta text-texto-principal"
            >
              Hora
            </label>
            <Input
              id={`${control.id}-hora`}
              type="time"
              value={hora}
              disabled={!seleccionada}
              onChange={(evento) =>
                seleccionada &&
                evento.target.value &&
                alCambiar(`${aTexto(seleccionada)}T${evento.target.value}`)
              }
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
        )}
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
