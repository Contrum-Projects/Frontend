'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ConteosProductosPanel } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import type { FiltroProductos } from './consultasProductos';

/** Espera tras la última tecla antes de buscar, para no pedir una página por letra. */
const ESPERA_BUSQUEDA_MS = 300;

/**
 * Buscador del listado (Figma 2039:1064). El backend hoy busca solo en el nombre: «marca o
 * SKU» de Figma se pidió a SCRUM-26 y no se promete en el texto de ayuda.
 */
export const BuscadorProductos = ({
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
      <label htmlFor="buscar-productos" className="sr-only">
        Buscar productos
      </label>
      <input
        id="buscar-productos"
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Nombre del producto"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-3 texto-pequeno text-texto-principal outline-none placeholder:text-texto-secundario"
      />
    </form>
  );
};

/** En Figma el celular usa nombres cortos y pone «Stock bajo» antes que «Exclusivos». */
const FILTROS: {
  filtro: FiltroProductos;
  texto: string;
  corto?: string;
  conteo: keyof ConteosProductosPanel;
  ordenCelular: string;
}[] = [
  { filtro: 'todos', texto: 'Todos', conteo: 'todos', ordenCelular: '' },
  {
    filtro: 'exclusivos',
    texto: 'Exclusivos profesionales',
    corto: 'Exclusivos',
    conteo: 'exclusivos',
    ordenCelular: 'max-lg:order-2',
  },
  {
    filtro: 'stock-bajo',
    texto: 'Con stock bajo',
    corto: 'Stock bajo',
    conteo: 'stockBajo',
    ordenCelular: 'max-lg:order-1',
  },
  {
    filtro: 'inactivos',
    texto: 'Inactivos',
    conteo: 'inactivos',
    ordenCelular: 'max-lg:order-3',
  },
];

/**
 * Chips de filtro (Figma 2039:1069), uno a la vez, con el conteo que entrega el backend. En
 * celular se desplazan en una fila.
 */
export const FiltrosProductos = ({
  filtro,
  conteos,
  alCambiar,
}: {
  filtro: FiltroProductos;
  conteos?: ConteosProductosPanel;
  alCambiar: (filtro: FiltroProductos) => void;
}) => (
  <ul
    aria-label="Filtros"
    className="flex gap-2 max-lg:-mx-4 max-lg:snap-x max-lg:scroll-px-4 max-lg:[scrollbar-width:none] max-lg:overflow-x-auto max-lg:px-4 max-lg:pb-1"
  >
    {FILTROS.map((opcion) => {
      const activo = opcion.filtro === filtro;
      return (
        <li
          key={opcion.filtro}
          className={cn('shrink-0 snap-start', opcion.ordenCelular)}
        >
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
            {opcion.corto ? (
              <>
                <span className="lg:hidden">{opcion.corto}</span>
                <span className="max-lg:hidden">{opcion.texto}</span>
              </>
            ) : (
              opcion.texto
            )}
            {conteos && ` · ${conteos[opcion.conteo]}`}
          </button>
        </li>
      );
    })}
  </ul>
);
