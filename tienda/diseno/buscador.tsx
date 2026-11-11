'use client';

import { Search, X } from 'lucide-react';
import { Suspense, type ComponentProps, type FocusEvent } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { CampoBuscador, type PropsCampoBuscador } from './campoBuscador';
import { RUTAS } from './enlaces';

interface BuscadorProps
  extends
    PropsCampoBuscador,
    Pick<ComponentProps<'form'>, 'inert' | 'aria-hidden'> {
  className?: string;
  /**
   * Con esta función el buscador se abre desde el header: muestra la X y se cierra con Esc o
   * al salir de él vacío (quien lo abre le da el foco). `devolverFoco` es falso cuando el foco ya
   * se fue a otra parte (clic fuera) y no hay que traerlo de vuelta.
   */
  alCerrar?: (devolverFoco: boolean) => void;
}

/**
 * Buscador del header (RF-02.07). Es un formulario GET a `/buscar?q=` (SCRUM-107). En la
 * búsqueda, el campo muestra lo que se buscó; mientras lee la URL, el mismo campo vacío.
 */
export const Buscador = ({
  className,
  alCerrar,
  inert,
  'aria-hidden': oculto,
  ...campo
}: BuscadorProps) => {
  const alSalir = (evento: FocusEvent<HTMLFormElement>) => {
    if (!alCerrar) return;
    if (evento.currentTarget.contains(evento.relatedTarget)) return;
    const texto = evento.currentTarget.querySelector('input')?.value ?? '';
    if (texto.trim() === '') alCerrar(false);
  };

  return (
    <form
      inert={inert}
      aria-hidden={oculto}
      action={RUTAS.buscar}
      role="search"
      onBlur={alSalir}
      onKeyDown={(evento) => {
        if (alCerrar && evento.key === 'Escape') alCerrar(true);
      }}
      className={cn(
        'flex items-center gap-2 rounded-full border-[1.5px] bg-fondo-superficie px-4 focus-within:ring-[3px] focus-within:ring-ring/60',
        alCerrar && 'pr-1',
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
      {alCerrar && (
        <Button
          type="button"
          variant="ghost"
          size="icono-chico"
          aria-label="Cerrar búsqueda"
          onClick={() => alCerrar(true)}
        >
          <X />
        </Button>
      )}
    </form>
  );
};
