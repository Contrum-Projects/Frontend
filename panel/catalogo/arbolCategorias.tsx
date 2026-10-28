'use client';

import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';

/**
 * Árbol de categorías (Figma P3b 2039:1386, E3-H4 criterio 2): cada categoría con sus
 * subcategorías debajo, que se pueden plegar. Todas parten desplegadas, así una subcategoría
 * recién creada se ve bajo su categoría.
 */
export const ArbolCategorias = ({
  arbol,
  alEditar,
}: {
  arbol: CategoriaTienda[];
  alEditar: (categoria: CategoriaTienda) => void;
}) => {
  const [plegadas, setPlegadas] = useState<ReadonlySet<number>>(new Set());

  const alternar = (id: number) =>
    setPlegadas((antes) => {
      const despues = new Set(antes);
      if (!despues.delete(id)) despues.add(id);
      return despues;
    });

  return (
    <ul>
      {arbol.map((categoria) => (
        <NodoCategoria
          key={categoria.id}
          categoria={categoria}
          nivel={0}
          plegadas={plegadas}
          alAlternar={alternar}
          alEditar={alEditar}
        />
      ))}
    </ul>
  );
};

/** Ancho del botón del chevron: 32 px en escritorio y 40 px (táctil) en celular. */
const HUECO = 'size-8 shrink-0 max-lg:size-10';

const NodoCategoria = ({
  categoria,
  nivel,
  plegadas,
  alAlternar,
  alEditar,
}: {
  categoria: CategoriaTienda;
  nivel: number;
  plegadas: ReadonlySet<number>;
  alAlternar: (id: number) => void;
  alEditar: (categoria: CategoriaTienda) => void;
}) => {
  const tieneHijas = categoria.subcategorias.length > 0;
  const plegada = plegadas.has(categoria.id);
  const idHijas = `subcategorias-${categoria.id}`;
  const Chevron = plegada ? ChevronRight : ChevronDown;

  return (
    <li>
      <div className="flex min-h-12 items-center gap-2 border-t px-2 py-1">
        {/*
         * Cada fila deja el hueco del chevron, así las hermanas quedan alineadas. Como en
         * Figma, el primer nivel de subcategorías alinea su nombre con el de su categoría;
         * de ahí en adelante, cada nivel se corre un hueco más.
         */}
        {Array.from({ length: Math.max(nivel - 1, 0) }, (_, i) => (
          <span key={i} aria-hidden className={HUECO} />
        ))}
        {tieneHijas ? (
          <Button
            variant="ghost"
            size="icono-chico"
            onClick={() => alAlternar(categoria.id)}
            aria-expanded={!plegada}
            aria-controls={idHijas}
            aria-label={`${plegada ? 'Mostrar' : 'Ocultar'} subcategorías de ${categoria.nombre}`}
            className="text-texto-principal max-lg:size-10"
          >
            <Chevron aria-hidden />
          </Button>
        ) : (
          <span aria-hidden className={HUECO} />
        )}
        <span
          className={cn(
            'min-w-0 flex-1 break-words text-texto-principal',
            nivel === 0 ? 'texto-etiqueta' : 'texto-pequeno',
          )}
        >
          {categoria.nombre}
        </span>
        <Button
          variant="ghost"
          size="icono-chico"
          onClick={() => alEditar(categoria)}
          aria-label={`Editar ${categoria.nombre}`}
          className="text-texto-principal max-lg:size-10"
        >
          <Pencil aria-hidden />
        </Button>
      </div>
      {tieneHijas && (
        // Siempre montada, así `aria-controls` apunta a algo aunque esté plegada
        <ul id={idHijas} hidden={plegada}>
          {categoria.subcategorias.map((subcategoria) => (
            <NodoCategoria
              key={subcategoria.id}
              categoria={subcategoria}
              nivel={nivel + 1}
              plegadas={plegadas}
              alAlternar={alAlternar}
              alEditar={alEditar}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
