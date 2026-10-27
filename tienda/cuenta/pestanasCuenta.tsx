import Link from 'next/link';
import { cn } from '@/compartido/lib/utils';
import { RUTAS } from '@/tienda/diseno/enlaces';

const PESTANAS = [
  { id: 'ingresar', texto: 'Ingresar', href: RUTAS.ingresar },
  { id: 'registro', texto: 'Crear cuenta', href: RUTAS.registro },
] as const;

/**
 * Pestañas «Ingresar | Crear cuenta» del celular (Figma 2018:2508). Ingreso y registro son
 * páginas separadas, así que cada pestaña es un enlace; en escritorio no se muestran (se
 * enlazan bajo el botón de cada formulario).
 */
export const PestanasCuenta = ({
  activa,
}: {
  activa: (typeof PESTANAS)[number]['id'];
}) => (
  <nav
    aria-label="Ingresar o crear cuenta"
    className="flex rounded-full border bg-card p-1 md:hidden"
  >
    {PESTANAS.map((pestana) => (
      <Link
        key={pestana.id}
        href={pestana.href}
        aria-current={pestana.id === activa ? 'page' : undefined}
        className={cn(
          'flex min-h-10 flex-1 items-center justify-center rounded-full texto-etiqueta text-texto-principal',
          pestana.id === activa && 'bg-marca-profundo text-texto-sobre-oscuro',
        )}
      >
        {pestana.texto}
      </Link>
    ))}
  </nav>
);
