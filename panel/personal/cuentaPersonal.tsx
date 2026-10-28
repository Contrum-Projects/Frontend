import type { CuentaPersonal } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';

export const nombreCompleto = (cuenta: CuentaPersonal) =>
  `${cuenta.nombre} ${cuenta.apellido}`;

const iniciales = (cuenta: CuentaPersonal) =>
  `${cuenta.nombre.charAt(0)}${cuenta.apellido.charAt(0)}`.toUpperCase();

/** Círculo con las iniciales (Figma 2049:1989): acento suave, o hueso oscuro si está desactivada. */
export const AvatarCuenta = ({ cuenta }: { cuenta: CuentaPersonal }) => (
  <span
    aria-hidden
    className={cn(
      'flex size-9 shrink-0 items-center justify-center rounded-full texto-leyenda',
      cuenta.activo
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-secundario',
    )}
  >
    {iniciales(cuenta)}
  </span>
);

/**
 * Estado de la cuenta. Figma tiene «Activa» y «Desactivada»; «Invitación pendiente» reemplaza
 * la columna «Último acceso», que la API aún no entrega (decisión del 28-10-2026).
 */
export const estadoDeCuenta = (cuenta: CuentaPersonal) => {
  if (!cuenta.activo) return 'Desactivada';
  return cuenta.invitacionPendiente ? 'Invitación pendiente' : 'Activa';
};

const COLORES_ESTADO: Record<ReturnType<typeof estadoDeCuenta>, string> = {
  Activa: 'bg-marca-acento-suave text-marca-profundo',
  Desactivada: 'bg-fondo-hueso-oscuro text-texto-principal',
  'Invitación pendiente': 'bg-estado-aviso-fondo text-estado-aviso-texto',
};

/** Etiqueta del estado (Figma 2049:1997). */
export const EstadoCuenta = ({ cuenta }: { cuenta: CuentaPersonal }) => {
  const estado = estadoDeCuenta(cuenta);
  return (
    <Badge className={cn('texto-leyenda', COLORES_ESTADO[estado])}>
      {estado}
    </Badge>
  );
};
