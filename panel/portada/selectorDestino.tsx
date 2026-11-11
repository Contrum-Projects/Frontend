'use client';

import { Search } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/compartido/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/compartido/ui/radio-group';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  NOMBRES_TIPO_DESTINO,
  type TipoDestino,
} from '@/tienda/portada/destinoPortada';
import { type DestinoElegido, useOpcionesDestino } from './consultasPortada';

const TIPOS = Object.keys(NOMBRES_TIPO_DESTINO) as TipoDestino[];

/** Plural en minúscula para los textos de ayuda («No hay marcas…»). */
const PLURALES: Record<TipoDestino, string> = {
  producto: 'productos',
  pack: 'packs',
  categoria: 'categorías',
  marca: 'marcas',
  pagina: 'páginas',
};

/** Espera a que se deje de escribir antes de buscar. */
const useDiferido = (valor: string, milisegundos = 300) => {
  const [diferido, setDiferido] = useState(valor);
  useEffect(() => {
    const espera = window.setTimeout(() => setDiferido(valor), milisegundos);
    return () => window.clearTimeout(espera);
  }, [valor, milisegundos]);
  return diferido;
};

interface SelectorDestinoProps {
  valor: DestinoElegido | null;
  alCambiar: (destino: DestinoElegido | null) => void;
  /** Mensaje del backend para el campo `destino`. */
  error?: string;
}

/**
 * A dónde lleva la imagen (SCRUM-157, criterio 2): primero el tipo y después una opción de la
 * lista que entrega el backend, que solo trae lo que está a la venta. Nunca se escribe una URL.
 */
export function SelectorDestino({
  valor,
  alCambiar,
  error,
}: SelectorDestinoProps) {
  const [tipo, setTipo] = useState<TipoDestino>(valor?.tipoDestino ?? 'pack');
  const [texto, setTexto] = useState('');
  const buscar = useDiferido(texto.trim());
  const opciones = useOpcionesDestino(tipo, tipo === 'pagina' ? '' : buscar);
  const idTipo = useId();
  const idBuscar = useId();
  const idError = useId();
  const elegido = valor?.tipoDestino === tipo ? valor.destino : '';

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={error ? idError : undefined}
    >
      <legend className="mb-1 texto-etiqueta text-texto-principal">
        ¿A dónde lleva la imagen?
      </legend>
      <div className="flex flex-col gap-2">
        <Label htmlFor={idTipo}>Tipo de destino</Label>
        <NativeSelect
          id={idTipo}
          value={tipo}
          contenedorClassName="w-full"
          onChange={(evento) => {
            setTipo(evento.target.value as TipoDestino);
            setTexto('');
            alCambiar(null);
          }}
        >
          {TIPOS.map((opcion) => (
            <NativeSelectOption key={opcion} value={opcion}>
              {NOMBRES_TIPO_DESTINO[opcion]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {tipo !== 'pagina' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={idBuscar}>Buscar por nombre</Label>
          <div className="relative">
            <Search
              aria-hidden
              strokeWidth={1.75}
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-texto-secundario"
            />
            <Input
              id={idBuscar}
              type="search"
              value={texto}
              className="pl-12"
              onChange={(evento) => setTexto(evento.target.value)}
            />
          </div>
        </div>
      )}
      {opciones.isPending ? (
        <div aria-hidden className="flex flex-col gap-2">
          {[0, 1, 2].map((fila) => (
            <Skeleton key={fila} className="h-11 rounded-md" />
          ))}
        </div>
      ) : opciones.isError ? (
        <p className="texto-pequeno text-estado-error">
          {opciones.error.message}
        </p>
      ) : opciones.data.length === 0 ? (
        <p className="rounded-md border bg-fondo-hueso px-4 py-3 texto-pequeno text-texto-secundario">
          {buscar
            ? `No hay ${PLURALES[tipo]} a la venta con ese nombre.`
            : `No hay ${PLURALES[tipo]} a la venta para elegir.`}
        </p>
      ) : (
        <RadioGroup
          aria-label={`${NOMBRES_TIPO_DESTINO[tipo]} de destino`}
          value={elegido}
          onValueChange={(destino) => alCambiar({ tipoDestino: tipo, destino })}
          className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border bg-fondo-superficie p-1"
        >
          {opciones.data.map((opcion) => {
            const id = `${idTipo}-${opcion.destino}`;
            return (
              <label
                key={opcion.destino}
                htmlFor={id}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-3 texto-pequeno text-texto-principal hover:bg-fondo-hueso',
                  elegido === opcion.destino && 'bg-marca-acento-suave',
                )}
              >
                <RadioGroupItem id={id} value={opcion.destino} />
                {opcion.nombre}
              </label>
            );
          })}
        </RadioGroup>
      )}
      {error && (
        <p id={idError} className="texto-pequeno text-estado-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
