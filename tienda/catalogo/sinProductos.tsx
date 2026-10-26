import { PackageOpen } from 'lucide-react';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { ChipsCategorias } from './chipsCategorias';

/**
 * Estado vacío del catálogo (criterio 3 de SCRUM-106): lo indica y ofrece explorar las otras
 * categorías. Sin promesas que no existen (docs/diseno.md: nada de «avísame cuando llegue»).
 */
export const SinProductos = ({
  titulo,
  categorias,
}: {
  /** Nombre de la categoría o marca que se abrió; sin filtro, el catálogo completo. */
  titulo?: string;
  categorias: CategoriaTienda[];
}) => (
  <section className="flex flex-col items-center rounded-lg border bg-fondo-superficie px-6 py-12 text-center md:py-16">
    <PackageOpen
      className="size-10 text-texto-secundario"
      strokeWidth={1.75}
      aria-hidden
    />
    <h2 className="mt-4 titulo-h3 text-texto-principal">
      {titulo
        ? `Todavía no hay productos en ${titulo}`
        : 'Todavía no hay productos'}
    </h2>
    {categorias.length > 0 && (
      <>
        <p className="mt-2 text-texto-secundario">Explora otras categorías:</p>
        <ChipsCategorias
          categorias={categorias}
          className="mt-6 max-w-2xl justify-center"
        />
      </>
    )}
  </section>
);
