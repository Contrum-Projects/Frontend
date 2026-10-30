'use client';

import { X } from 'lucide-react';
import { useOptimistic } from 'react';
import { ListaFiltros } from './listaFiltros';
import type { OpcionCategoria, OpcionMarca } from './opcionesFiltros';
import { contarFiltros, type SeleccionFiltros } from './seleccionFiltros';
import { useAplicarFiltros, type ContextoFiltros } from './usarFiltros';

export interface PropsFiltros extends ContextoFiltros {
  categorias: OpcionCategoria[];
  marcas: OpcionMarca[];
  seleccion: SeleccionFiltros;
}

const SIN_FILTROS: SeleccionFiltros = { categoriaIds: [], marcaIds: [] };

/**
 * Filtros de la columna izquierda en escritorio (Figma › 02 Catálogo 2006:451): cada casilla
 * aplica al instante. La casilla cambia de inmediato y los resultados llegan después.
 */
export function FiltrosEscritorio({
  categorias,
  marcas,
  seleccion,
  ...contexto
}: PropsFiltros) {
  const [marcada, fijarMarcada] = useOptimistic(seleccion);
  const { aplicar } = useAplicarFiltros(contexto);
  const cambiar = (nueva: SeleccionFiltros) => aplicar(nueva, fijarMarcada);

  return (
    <div className="flex flex-col gap-6">
      <ListaFiltros
        categorias={categorias}
        marcas={marcas}
        seleccion={marcada}
        alCambiar={cambiar}
        expandirTodo={Boolean(contexto.buscar)}
        prefijo="filtro"
      />
      {contarFiltros(marcada) > 0 && (
        <button
          type="button"
          onClick={() => cambiar(SIN_FILTROS)}
          className="flex items-center gap-2 self-start rounded-md texto-etiqueta text-marca-profundo hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
