import Image from 'next/image';
import { useId } from 'react';
import { formatearPesos } from '@/compartido/formato/moneda';
import { textoUnidades } from '@/tienda/carrito/textos';

/** Lo que muestra la línea: sirve para un artículo del carrito y para uno del pedido. */
export interface DatosLineaResumen {
  nombre: string;
  nombreFormato: string | null;
  imagen: string | null;
  cantidad: number;
  /** Con IVA, como lo entrega el backend; `null` si no se puede mostrar. */
  subtotal: number | null;
}

/**
 * Foto de 56 px, nombre, formato y unidades, y el subtotal con IVA (Figma › 05 Checkout y
 * 09 Resultado del pago).
 */
export const LineaResumen = ({ linea }: { linea: DatosLineaResumen }) => {
  const idNombre = useId();
  return (
    <li aria-labelledby={idNombre} className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-marca-acento-suave">
        {linea.imagen && (
          <Image
            src={linea.imagen}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p id={idNombre} className="texto-etiqueta text-texto-principal">
          {linea.nombre}
        </p>
        <p className="texto-leyenda text-texto-secundario">
          {[linea.nombreFormato, textoUnidades(linea.cantidad)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {linea.subtotal !== null && (
        <p className="texto-etiqueta text-texto-principal tabular-nums">
          {formatearPesos(linea.subtotal)}
        </p>
      )}
    </li>
  );
};
