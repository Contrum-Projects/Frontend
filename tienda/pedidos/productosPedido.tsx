import { useId } from 'react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Separator } from '@/compartido/ui/separator';
import { LineaResumen } from '@/tienda/checkout/lineaResumen';

/**
 * E8-H1, criterio 2 · Los artículos con su subtotal con IVA, el despacho y el total, todo como
 * lo entrega el backend (RNF-03). Sin la línea «Productos» de Figma: la API no entrega ese
 * subtotal y el frontend no lo calcula (pedido a SCRUM-57 como `montos.productos`).
 */
export const ProductosPedido = ({
  pedido,
}: {
  pedido: DetallePedidoCuenta;
}) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-4 rounded-lg border bg-fondo-superficie p-4 md:px-6"
    >
      {/* En celular se ve (Figma 2019:2970); en escritorio, solo para lectores de pantalla */}
      <h2
        id={idTitulo}
        className="texto-cuerpo-fuerte text-texto-principal md:sr-only"
      >
        Productos
      </h2>
      {pedido.items.length > 0 && (
        <>
          <ul aria-label="Productos del pedido" className="flex flex-col gap-4">
            {pedido.items.map((linea) => (
              <LineaResumen
                key={`${linea.tipo}-${linea.articuloId}`}
                linea={linea}
              />
            ))}
          </ul>
          <Separator />
        </>
      )}
      <dl className="flex flex-col gap-2">
        {pedido.envio && (
          <div className="flex justify-between gap-4 texto-pequeno">
            <dt className="text-texto-secundario">Despacho</dt>
            <dd className="text-texto-principal tabular-nums">
              {formatearPesos(pedido.envio.costo)}
            </dd>
          </div>
        )}
        {pedido.montos.descuento > 0 && (
          <div className="flex justify-between gap-4 texto-pequeno">
            <dt className="text-texto-secundario">
              Cupón{pedido.cupon ? ` ${pedido.cupon}` : ''}
            </dt>
            <dd className="text-marca-profundo tabular-nums">
              −{formatearPesos(pedido.montos.descuento)}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4 texto-cuerpo-fuerte text-texto-principal">
          <dt>Total</dt>
          <dd className="tabular-nums">
            {formatearPesos(pedido.montos.total)}
          </dd>
        </div>
      </dl>
    </section>
  );
};
