import { Search } from 'lucide-react';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { ChipsCategorias } from './chipsCategorias';

/**
 * Búsqueda sin resultados (criterio 2 de SCRUM-107, Figma › 11 Búsqueda › sin resultados
 * 2060:2396): lo indica y propone las categorías para seguir explorando.
 */
export const SinResultados = ({
  buscar,
  categorias,
}: {
  buscar: string;
  categorias: CategoriaTienda[];
}) => (
  <div className="flex flex-col gap-8">
    <section className="flex flex-col items-center rounded-lg bg-fondo-superficie px-6 py-12 text-center md:py-16">
      <Search
        className="size-8 text-texto-principal"
        strokeWidth={1.75}
        aria-hidden
      />
      <h2 className="mt-4 titulo-h3 text-texto-principal">
        No encontramos productos para «{buscar}»
      </h2>
      <p className="mt-2 max-w-sm texto-pequeno text-texto-secundario">
        Revisa cómo lo escribiste o busca por nombre, marca o categoría.
      </p>
    </section>
    {categorias.length > 0 && (
      <section aria-labelledby="explora-categorias">
        <h2
          id="explora-categorias"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Explora por categoría
        </h2>
        <ChipsCategorias categorias={categorias} className="mt-4" />
      </section>
    )}
  </div>
);
