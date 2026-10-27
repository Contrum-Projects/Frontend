import { LogOut } from 'lucide-react';
import { cn } from '@/compartido/lib/utils';

/** Ícono de «Cerrar sesión» de Figma: la flecha sale hacia la izquierda (LogOut reflejado). */
export const IconoCerrarSesion = ({ className }: { className?: string }) => (
  <LogOut
    className={cn('-scale-x-100', className)}
    strokeWidth={1.75}
    aria-hidden
  />
);
