import Link from 'next/link';
import { buttonVariants } from '@/compartido/ui/button';
import { RUTAS } from '@/tienda/diseno/enlaces';

/**
 * E8-H1, criterio 4 · El backend responde 404 igual si el pedido no existe o es de otra cuenta:
 * la pantalla tampoco los distingue.
 */
export const PedidoNoEncontrado = () => (
  <div className="flex flex-col items-start gap-4">
    <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
      No encontramos este pedido
    </h1>
    <p className="texto-cuerpo text-texto-secundario">
      Revisa el enlace o busca el pedido en Mis pedidos.
    </p>
    <Link href={RUTAS.misPedidos} className={buttonVariants()}>
      Ir a Mis pedidos
    </Link>
  </div>
);
