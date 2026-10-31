import { Search } from 'lucide-react';
import type { Proveedor } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';

/** Coincide por razón social o por RUT, con o sin puntos y guion. */
export const coincideConBusqueda = (proveedor: Proveedor, busqueda: string) => {
  const texto = busqueda.trim().toLowerCase();
  if (!texto) return true;
  if (proveedor.razonSocial.toLowerCase().includes(texto)) return true;
  const rut = texto.replace(/[.\s-]/g, '').toUpperCase();
  return rut !== '' && proveedor.rut.replace('-', '').includes(rut);
};

/** Buscador «RUT o razón social» (Figma 2064:3115): filtra la lista ya cargada, la API no busca. */
export const BuscadorProveedores = ({
  id,
  valor,
  alCambiar,
  className,
}: {
  id: string;
  valor: string;
  alCambiar: (texto: string) => void;
  className?: string;
}) => (
  <div
    role="search"
    className={cn(
      'flex items-center gap-2 rounded-full border-[1.5px] px-4 focus-within:ring-[3px] focus-within:ring-ring/60',
      className,
    )}
  >
    <Search
      className="size-4 shrink-0 text-texto-secundario"
      strokeWidth={1.75}
      aria-hidden
    />
    <label htmlFor={id} className="sr-only">
      Buscar proveedores
    </label>
    <input
      id={id}
      type="search"
      value={valor}
      onChange={(evento) => alCambiar(evento.target.value)}
      placeholder="RUT o razón social"
      autoComplete="off"
      className="min-w-0 flex-1 bg-transparent py-3 texto-pequeno text-texto-principal outline-none placeholder:text-texto-secundario"
    />
  </div>
);
