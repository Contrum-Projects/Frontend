'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Checkbox } from '@/compartido/ui/checkbox';
import type { OpcionCategoria, OpcionMarca } from './opcionesFiltros';
import {
  alternarCategoria,
  alternarMarca,
  type SeleccionFiltros,
} from './seleccionFiltros';

interface PropsLista {
  categorias: OpcionCategoria[];
  marcas: OpcionMarca[];
  seleccion: SeleccionFiltros;
  alCambiar: (seleccion: SeleccionFiltros) => void;
  /** En la búsqueda se ven todas las subcategorías con resultados; en el catálogo, solo las de la marcada. */
  expandirTodo: boolean;
  /** Los filtros están dos veces en la página (escritorio y celular): cada uno con sus ids. */
  prefijo: string;
  celular?: boolean;
}

/**
 * Casillas de categoría (con sus subcategorías) y marca (Figma › 02 Catálogo › Filtros 2006:451
 * y filtros del celular 2005:662). El número es cuántos productos hay con los demás filtros.
 */
export function ListaFiltros({
  categorias,
  marcas,
  seleccion,
  alCambiar,
  expandirTodo,
  prefijo,
  celular = false,
}: PropsLista) {
  const fila = { prefijo, celular };
  return (
    <div className={cn('flex flex-col', celular ? 'gap-4' : 'gap-6')}>
      {categorias.length > 0 && (
        <Grupo titulo="Categoría" celular={celular}>
          {categorias.map((opcion) => (
            <FilaCategoria
              key={opcion.id}
              opcion={opcion}
              nivel={0}
              seleccion={seleccion}
              expandirTodo={expandirTodo}
              alAlternar={(id) =>
                alCambiar(alternarCategoria(categorias, seleccion, id))
              }
              {...fila}
            />
          ))}
        </Grupo>
      )}
      {marcas.length > 0 && (
        <Grupo titulo="Marca" celular={celular}>
          {marcas.map((opcion) => (
            <Fila
              key={opcion.id}
              id={`${prefijo}-marca-${opcion.id}`}
              opcion={opcion}
              marcada={seleccion.marcaIds.includes(opcion.id)}
              alAlternar={() => alCambiar(alternarMarca(seleccion, opcion.id))}
              {...fila}
            />
          ))}
        </Grupo>
      )}
    </div>
  );
}

/** En escritorio, cada grupo se pliega con su flecha; en el celular, todo queda a la vista. */
const Grupo = ({
  titulo,
  celular,
  children,
}: {
  titulo: string;
  celular: boolean;
  children: ReactNode;
}) => {
  const lista = (
    <ul
      aria-label={titulo}
      className={cn('flex flex-col', celular ? 'mt-1' : 'mt-3 gap-3')}
    >
      {children}
    </ul>
  );
  if (celular) {
    return (
      <section>
        <h3 className="texto-sobretitulo text-texto-principal">{titulo}</h3>
        {lista}
      </section>
    );
  }
  return (
    <details open className="group border-b pb-6">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md texto-sobretitulo text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo [&::-webkit-details-marker]:hidden">
        {titulo}
        <ChevronDown
          className="size-[18px] text-texto-principal transition-transform group-open:rotate-180"
          strokeWidth={1.75}
          aria-hidden
        />
      </summary>
      {lista}
    </details>
  );
};

interface PropsFila {
  prefijo: string;
  celular: boolean;
}

const contiene = (opcion: OpcionCategoria, ids: number[]): boolean =>
  ids.includes(opcion.id) ||
  opcion.subcategorias.some((sub) => contiene(sub, ids));

const FilaCategoria = ({
  opcion,
  nivel,
  seleccion,
  expandirTodo,
  alAlternar,
  ...fila
}: PropsFila & {
  opcion: OpcionCategoria;
  nivel: number;
  seleccion: SeleccionFiltros;
  expandirTodo: boolean;
  alAlternar: (id: number) => void;
}) => {
  const abierta = expandirTodo || contiene(opcion, seleccion.categoriaIds);
  return (
    <>
      <Fila
        id={`${fila.prefijo}-categoria-${opcion.id}`}
        opcion={opcion}
        nivel={nivel}
        marcada={seleccion.categoriaIds.includes(opcion.id)}
        alAlternar={() => alAlternar(opcion.id)}
        {...fila}
      />
      {abierta &&
        opcion.subcategorias.map((sub) => (
          <FilaCategoria
            key={sub.id}
            opcion={sub}
            nivel={nivel + 1}
            seleccion={seleccion}
            expandirTodo={expandirTodo}
            alAlternar={alAlternar}
            {...fila}
          />
        ))}
    </>
  );
};

const SANGRIA = ['', 'pl-8', 'pl-16', 'pl-24'] as const;

const Fila = ({
  id,
  opcion,
  marcada,
  alAlternar,
  nivel = 0,
  celular,
}: PropsFila & {
  id: string;
  opcion: OpcionCategoria | OpcionMarca;
  marcada: boolean;
  alAlternar: () => void;
  nivel?: number;
}) => (
  <li
    className={cn(
      'flex items-center gap-3',
      // En el celular la etiqueta ocupa toda la fila (40 px): cualquier punto marca la casilla
      celular && 'min-h-10 items-stretch',
      SANGRIA[Math.min(nivel, SANGRIA.length - 1)],
    )}
  >
    <Checkbox
      id={id}
      checked={marcada}
      onCheckedChange={alAlternar}
      className={cn(celular && 'size-5.5 self-center')}
    />
    <label
      htmlFor={id}
      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3"
    >
      <span className={marcada ? 'texto-cuerpo-fuerte' : 'texto-cuerpo'}>
        {opcion.nombre}
      </span>{' '}
      {opcion.total !== undefined && (
        <span className="texto-leyenda text-texto-secundario tabular-nums">
          {opcion.total}{' '}
          <span className="sr-only">
            {opcion.total === 1 ? 'producto' : 'productos'}
          </span>
        </span>
      )}
    </label>
  </li>
);
