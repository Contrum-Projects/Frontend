import { cn } from '@/compartido/lib/utils';

interface Persona {
  nombre: string;
  apellido: string;
}

/** «Camila Rojas» → «CR»; con un solo nombre, su primera letra. */
export const iniciales = ({ nombre, apellido }: Persona) =>
  `${nombre.trim().charAt(0)}${apellido.trim().charAt(0)}`.toUpperCase();

export const nombreCompleto = ({ nombre, apellido }: Persona) =>
  `${nombre} ${apellido}`.trim();

/** Círculo con las iniciales (Figma: Avatar del menú lateral y de la barra superior). */
export const AvatarPanel = ({
  persona,
  className,
}: {
  persona: Persona;
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn(
      'flex size-[34px] shrink-0 items-center justify-center rounded-full bg-marca-acento texto-etiqueta text-marca-profundo',
      className,
    )}
  >
    {iniciales(persona)}
  </span>
);
