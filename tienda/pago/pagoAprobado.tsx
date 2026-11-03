'use client';

import { CheckIcon, TruckIcon } from 'lucide-react';
import { useId } from 'react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Separator } from '@/compartido/ui/separator';
import { LineaResumen } from '@/tienda/checkout/lineaResumen';
import { useMisDatos } from '@/tienda/cuenta/consultasCuenta';
import { RUTAS, urlPedido } from '@/tienda/diseno/enlaces';
import { AccionesResultado, EnlaceResultado } from './accionesResultado';
import { EncabezadoResultado } from './encabezadoResultado';

/**
 * E6-H2, criterio 1 · «Recibimos tu pago» (Figma › 09 Resultado del pago, escritorio 2034:2106).
 * El resumen es el del pedido que entrega el backend: líneas, despacho y total con IVA, sin
 * calcular nada (RNF-03). La confirmación la envía el backend al correo de la cuenta.
 */
export const PagoAprobado = ({ pedido }: { pedido: DetallePedidoCuenta }) => {
  const datos = useMisDatos();
  const correo = datos.data?.email;

  return (
    <div className="flex flex-col items-start gap-4 md:gap-6">
      <EncabezadoResultado
        tono="exito"
        icono={<CheckIcon aria-hidden className="size-7" strokeWidth={1.75} />}
        titulo="Recibimos tu pago"
      >
        Pedido {pedido.codigoPublico}
        {correo && ` · Te enviamos la confirmación a ${correo}`}
      </EncabezadoResultado>
      <ResumenPagado pedido={pedido} />
      <p className="flex w-full items-center gap-3 rounded-lg bg-marca-acento-suave px-4 py-3 texto-pequeno text-marca-profundo">
        <TruckIcon
          aria-hidden
          className="size-5.5 shrink-0"
          strokeWidth={1.75}
        />
        {/* Lo mismo que dice el correo de confirmación del backend */}
        {pedido.tipoEntrega === 'despacho'
          ? 'Te avisaremos por correo cuando tu pedido salga a despacho.'
          : 'Te avisaremos por correo cuando tu pedido esté listo para retiro.'}
      </p>
      <AccionesResultado>
        <EnlaceResultado href={urlPedido(pedido.codigoPublico)}>
          Ver mi pedido
        </EnlaceResultado>
        <EnlaceResultado href={RUTAS.catalogo} contorno>
          Seguir comprando
        </EnlaceResultado>
      </AccionesResultado>
    </div>
  );
};

const ResumenPagado = ({ pedido }: { pedido: DetallePedidoCuenta }) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex w-full flex-col gap-3 rounded-xl border bg-fondo-superficie p-4 md:p-6"
    >
      <h2 id={idTitulo} className="sr-only">
        Resumen del pedido
      </h2>
      {pedido.items.length > 0 && (
        <>
          <ul aria-label="Productos del pedido" className="flex flex-col gap-3">
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
      <dl className="flex flex-col gap-3">
        {pedido.envio && (
          <div className="flex justify-between gap-4 texto-pequeno">
            <dt className="text-texto-secundario">
              Despacho a {pedido.envio.comuna.nombre}
            </dt>
            <dd className="text-texto-principal tabular-nums">
              {formatearPesos(pedido.envio.costo)}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4 texto-cuerpo-fuerte text-texto-principal">
          <dt>Total pagado</dt>
          <dd className="tabular-nums">
            {formatearPesos(pedido.montos.total)}
          </dd>
        </div>
      </dl>
    </section>
  );
};
