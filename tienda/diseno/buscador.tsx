import { Search } from 'lucide-react';
import { Suspense } from 'react';
import { cn } from '@/compartido/lib/utils';
import { CampoBuscador, type PropsCampoBuscador } from './campoBuscador';
import { RUTAS } from './enlaces';

/**
 * Buscador del header (RF-02.07). Es un formulario GET a `/buscar?q=` (SCRUM-107). En la
 * búsqueda, el campo muestra lo que se buscó; mientras lee la URL, el mismo campo vacío.
 */
export const Buscador = ({
  className,
  ...campo
}: PropsCampoBuscador & { className?: string }) => (
  <form
    action={RUTAS.buscar}
    role="search"
    className={cn(
      'flex items-center gap-2 rounded-full border-[1.5px] bg-fondo-superficie px-4 focus-within:ring-[3px] focus-within:ring-ring/60',
      className,
    )}
  >
    <Search
      className="size-5 shrink-0 text-texto-secundario"
      strokeWidth={1.75}
      aria-hidden
    />
    <label htmlFor={campo.id} className="sr-only">
      Buscar
    </label>
    <Suspense fallback={<CampoBuscador {...campo} />}>
      <CampoBuscador {...campo} conBusqueda />
    </Suspense>
  </form>
);
