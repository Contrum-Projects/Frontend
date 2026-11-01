'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, type Ref } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/compartido/ui/popover';
import { Skeleton } from '@/compartido/ui/skeleton';
import { nombreDelFormato } from '@/panel/packs/buscadorFormatos';
import { useFormatosParaPack } from '@/panel/packs/consultasPacks';
import type { PropsControl } from '@/tienda/cuenta/campoFormulario';
import type { FormatoSalida } from './esquemaSalida';

/** Espera tras la última tecla antes de buscar, para no pedir una búsqueda por letra. */
const ESPERA_BUSQUEDA_MS = 300;

/**
 * Campo «Formato» de la salida (Figma P5c 2043:1969): muestra el formato elegido con su SKU y,
 * al abrirlo, busca en el backend por producto, formato o SKU.
 */
export const SelectorFormatoSalida = ({
  propsControl,
  ref,
  valor,
  alCambiar,
  alSalir,
}: {
  propsControl: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: FormatoSalida | null;
  alCambiar: (formato: FormatoSalida) => void;
  alSalir: () => void;
}) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <Popover
      open={abierto}
      onOpenChange={(siguiente) => {
        setAbierto(siguiente);
        if (!siguiente) alSalir();
      }}
    >
      <PopoverTrigger asChild>
        <button
          {...propsControl}
          ref={ref}
          type="button"
          className="flex min-h-[51px] w-full cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-input bg-fondo-superficie px-3 py-2 text-left outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            {valor ? (
              <>
                <span className="texto-etiqueta break-words text-texto-principal">
                  {nombreDelFormato(valor)}
                </span>
                <span className="texto-leyenda text-texto-secundario">
                  {valor.sku}
                </span>
              </>
            ) : (
              <span className="texto-cuerpo text-muted-foreground">
                Busca el formato
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-texto-secundario"
            strokeWidth={1.75}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label="Buscar formato"
        className="w-(--radix-popover-trigger-width) p-3"
      >
        <Busqueda
          elegido={valor?.formatoId}
          alElegir={(formato) => {
            alCambiar(formato);
            setAbierto(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const Busqueda = ({
  elegido,
  alElegir,
}: {
  elegido?: number;
  alElegir: (formato: FormatoSalida) => void;
}) => {
  const [texto, setTexto] = useState('');
  const [buscar, setBuscar] = useState('');
  useEffect(() => {
    const espera = setTimeout(
      () => setBuscar(texto.trim()),
      ESPERA_BUSQUEDA_MS,
    );
    return () => clearTimeout(espera);
  }, [texto]);
  const formatos = useFormatosParaPack(buscar, true);
  const lista = formatos.data?.items ?? [];

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        autoComplete="off"
        aria-label="Buscar formato"
        placeholder="Producto, formato o SKU"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      {formatos.isPending && (
        <div aria-hidden className="flex flex-col gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      )}
      {formatos.isError && (
        <Alert variant="destructive">
          <AlertDescription>{formatos.error.message}</AlertDescription>
        </Alert>
      )}
      {formatos.isSuccess && lista.length === 0 && (
        <p role="status" className="texto-pequeno text-texto-secundario">
          No encontramos formatos con esa búsqueda.
        </p>
      )}
      {lista.length > 0 && (
        <ul
          aria-label="Formatos encontrados"
          className="flex max-h-64 flex-col overflow-y-auto"
        >
          {lista.map((formato) => (
            <li key={formato.formatoId} className="border-t first:border-t-0">
              <button
                type="button"
                aria-pressed={formato.formatoId === elegido}
                onClick={() => alElegir(formato)}
                className={cn(
                  'flex w-full cursor-pointer flex-col rounded-sm px-2 py-2 text-left hover:bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo',
                  formato.formatoId === elegido && 'bg-marca-acento-suave',
                )}
              >
                <span className="texto-pequeno break-words text-texto-principal">
                  {nombreDelFormato(formato)}
                </span>
                <span className="texto-leyenda text-texto-secundario">
                  {formato.sku}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {formatos.isSuccess && formatos.data.total > lista.length && (
        <p className="texto-leyenda text-texto-secundario">
          Hay más formatos: escribe para acotar la búsqueda.
        </p>
      )}
    </div>
  );
};
