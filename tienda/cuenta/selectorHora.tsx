'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';

const dosCifras = (numero: number) => String(numero).padStart(2, '0');

const HORAS = Array.from({ length: 24 }, (_, i) => dosCifras(i));
const MINUTOS = Array.from({ length: 12 }, (_, i) => dosCifras(i * 5));

/** Minutos de 5 en 5, más el guardado si no calza (p. ej. «59» de un fin a las 23:59). */
const opcionesMinutos = (actual: string) =>
  !actual || MINUTOS.includes(actual) ? MINUTOS : [...MINUTOS, actual].sort();

/** Hora y minutos (HH:mm) con dos Select de shadcn, para el pie de `SelectorFecha`. */
export const SelectorHora = ({
  id,
  valor,
  alCambiar,
  deshabilitado,
}: {
  id: string;
  /** HH:mm, o vacío si aún no hay día elegido. */
  valor: string;
  alCambiar: (valor: string) => void;
  deshabilitado: boolean;
}) => {
  const [hora = '', minutos = ''] = valor ? valor.split(':') : [];

  return (
    <div
      role="group"
      aria-labelledby={id}
      className="flex items-center gap-3 border-t p-3"
    >
      <span id={id} className="texto-etiqueta text-texto-principal">
        Hora
      </span>
      <Select
        value={hora}
        onValueChange={(nueva) => alCambiar(`${nueva}:${minutos || '00'}`)}
        disabled={deshabilitado}
      >
        <SelectTrigger aria-label="Hora" className="w-24">
          <SelectValue placeholder="hh" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60">
          {HORAS.map((opcion) => (
            <SelectItem key={opcion} value={opcion}>
              {opcion}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span aria-hidden>:</span>
      <Select
        value={minutos}
        onValueChange={(nuevos) => alCambiar(`${hora || '00'}:${nuevos}`)}
        disabled={deshabilitado}
      >
        <SelectTrigger aria-label="Minutos" className="w-24">
          <SelectValue placeholder="mm" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60">
          {opcionesMinutos(minutos).map((opcion) => (
            <SelectItem key={opcion} value={opcion}>
              {opcion}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
