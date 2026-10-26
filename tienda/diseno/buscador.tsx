import { Search } from 'lucide-react';
import { cn } from '@/compartido/lib/utils';
import { RUTAS } from './enlaces';

/**
 * Buscador del header (RF-02.07). Es un formulario GET a `/buscar?q=`: la página de resultados
 * llega con SCRUM-107.
 */
export const Buscador = ({
  id,
  placeholder,
  className,
}: {
  /** El header lo muestra dos veces (escritorio y celular): cada uno con su id. */
  id: string;
  placeholder: string;
  className?: string;
}) => (
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
    <label htmlFor={id} className="sr-only">
      Buscar
    </label>
    <input
      id={id}
      name="q"
      type="search"
      placeholder={placeholder}
      className="min-w-0 flex-1 bg-transparent py-3 texto-pequeno text-texto-principal outline-none placeholder:text-texto-secundario"
    />
  </form>
);
