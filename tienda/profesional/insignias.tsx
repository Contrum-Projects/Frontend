import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/compartido/ui/badge';

/**
 * Sobre la foto de un exclusivo (Figma › Componentes › Tarjeta de producto 5:117 y 9:768): solo el
 * profesional lo ve, porque el backend no entrega exclusivos a nadie más.
 */
export const InsigniaExclusivo = () => (
  // En celular la foto mide unos 130 px: la insignia no pasa del borde derecho y el texto baja
  <Badge className="absolute top-2 right-2 left-2 gap-1 rounded-lg px-2 py-1 texto-leyenda whitespace-normal md:top-3 md:right-3 md:left-3 md:rounded-full md:px-3 [&>svg]:size-3.5 [&>svg]:shrink-0">
    <BadgeCheck aria-hidden strokeWidth={1.75} />
    Exclusivo profesional
  </Badge>
);

/** «Precio profesional · cuenta verificada» sobre el precio de la ficha (Figma 2007:1762). */
export const InsigniaPrecioProfesional = () => (
  <Badge
    variant="secondary"
    className="gap-2 py-1 pr-3 pl-2 texto-leyenda [&>svg]:size-4"
  >
    <BadgeCheck aria-hidden strokeWidth={1.75} />
    Precio profesional · cuenta verificada
  </Badge>
);
