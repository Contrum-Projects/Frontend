import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/compartido/ui/button';
import { RUTAS } from '@/tienda/diseno/enlaces';

/**
 * Tarjeta centrada con ícono, título, texto y un botón (Figma › 04b Carrito vacío 2060:2381).
 * Sirve para el carrito vacío y para pedir que ingrese al visitante.
 */
export const AvisoCarrito = ({
  titulo,
  texto,
  accion,
}: {
  titulo: string;
  texto?: string;
  accion: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-2.5 rounded-lg bg-fondo-superficie px-6 py-10 text-center md:py-16">
    <ShoppingCart
      className="size-9 text-texto-principal"
      strokeWidth={1.75}
      aria-hidden
    />
    <h2 className="titulo-h3 text-texto-principal">{titulo}</h2>
    {texto && <p className="texto-pequeno text-texto-secundario">{texto}</p>}
    <div className="mt-2">{accion}</div>
  </div>
);

/** Criterio 3: sin artículos, el mensaje y el botón al catálogo (sin sugerencias). */
export const CarritoVacio = () => (
  <AvisoCarrito
    titulo="Tu carrito está vacío"
    texto="Busca un producto o explora las categorías para empezar."
    accion={
      <Button asChild>
        <Link href={RUTAS.catalogo}>Ver catálogo</Link>
      </Button>
    }
  />
);
