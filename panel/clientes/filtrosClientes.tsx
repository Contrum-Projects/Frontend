'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/compartido/lib/utils';
import type { ConteosClientes, FiltroClientes } from './consultasClientes';

/** Espera tras la última tecla antes de buscar, para no pedir una página por letra. */
const ESPERA_BUSQUEDA_MS = 300;

/** Buscador del listado, como el de Productos (Figma 2039:1064). */
export const BuscadorClientes = ({
  alBuscar,
  className,
}: {
  alBuscar: (texto: string) => void;
  className?: string;
}) => {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const espera = setTimeout(() => alBuscar(texto.trim()), ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(espera);
  }, [texto, alBuscar]);

  return (
    <form
      role="search"
      onSubmit={(evento) => {
        evento.preventDefault();
        alBuscar(texto.trim());
      }}
      className={cn(
        'flex items-center gap-2 rounded-full border-[1.5px] bg-fondo-hueso px-4 focus-within:ring-[3px] focus-within:ring-ring/60 max-lg:bg-fondo-superficie',
        className,
      )}
    >
      <Search
        className="size-4 shrink-0 text-texto-secundario"
        strokeWidth={1.75}
        aria-hidden
      />
      <label htmlFor="buscar-clientes" className="sr-only">
        Buscar clientes
      </label>
      <input
        id="buscar-clientes"
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Nombre, correo o RUT"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-3 texto-pequeno text-texto-principal outline-none placeholder:text-texto-secundario"
      />
    </form>
  );
};

const FILTROS: {
  filtro: FiltroClientes;
  texto: string;
  conteo: keyof ConteosClientes;
}[] = [
  { filtro: 'todos', texto: 'Todos', conteo: 'todos' },
  { filtro: 'clientes', texto: 'Clientes', conteo: 'clientes' },
  { filtro: 'profesionales', texto: 'Profesionales', conteo: 'profesionales' },
  { filtro: 'desactivados', texto: 'Desactivadas', conteo: 'desactivados' },
];

/** Chips de filtro, uno a la vez, como los de Productos. En celular se desplazan en una fila. */
export const FiltrosClientes = ({
  filtro,
  conteos,
  alCambiar,
}: {
  filtro: FiltroClientes;
  conteos?: ConteosClientes;
  alCambiar: (filtro: FiltroClientes) => void;
}) => (
  <ul
    aria-label="Filtros"
    className="flex gap-2 max-lg:-mx-4 max-lg:snap-x max-lg:scroll-px-4 max-lg:[scrollbar-width:none] max-lg:overflow-x-auto max-lg:px-4 max-lg:pb-1"
  >
    {FILTROS.map((opcion) => {
      const activo = opcion.filtro === filtro;
      return (
        <li key={opcion.filtro} className="shrink-0 snap-start">
          <button
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(opcion.filtro)}
            className={cn(
              'inline-flex min-h-10 cursor-pointer items-center rounded-full border-[1.5px] px-3 texto-etiqueta whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 lg:min-h-8',
              activo
                ? 'border-marca-profundo bg-marca-profundo text-texto-sobre-oscuro'
                : 'bg-fondo-superficie text-texto-principal hover:border-marca-profundo',
            )}
          >
            {opcion.texto}
            {conteos && ` · ${conteos[opcion.conteo]}`}
          </button>
        </li>
      );
    })}
  </ul>
);
