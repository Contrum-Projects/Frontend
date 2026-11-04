'use client';

import { File } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { Button } from '@/compartido/ui/button';
import { useDescargarDocumento } from './consultasPedidos';

type DocumentoFactura = NonNullable<DetallePedidoCuenta['documento']>;

/**
 * E9-H4 · El documento del pedido (Figma 2019:1739; celular 2019:3056). Con factura: «pendiente»
 * hasta que el personal la registra y, luego, su descarga. Con boleta, el comprobante es el de
 * Mercado Pago y no hay archivo: se muestra su n.º de operación. Sin ninguno, no hay tarjeta.
 */
export const DocumentoPedido = ({
  pedido,
}: {
  pedido: DetallePedidoCuenta;
}) => {
  if (pedido.documento) {
    return (
      <FacturaPedido
        codigoPedido={pedido.codigoPublico}
        factura={pedido.documento}
      />
    );
  }
  if (!pedido.idTransaccionPago) return null;
  return (
    <TarjetaDocumento tipo="Comprobante de pago">
      <p className="texto-pequeno wrap-break-word text-texto-secundario">
        N.º de operación de Mercado Pago: {pedido.idTransaccionPago}
      </p>
    </TarjetaDocumento>
  );
};

const FacturaPedido = ({
  codigoPedido,
  factura,
}: {
  codigoPedido: string;
  factura: DocumentoFactura;
}) => {
  const descarga = useDescargarDocumento(codigoPedido);

  if (factura.estado === 'pendiente') {
    return (
      <TarjetaDocumento tipo="Factura">
        <p className="texto-pequeno text-texto-secundario">
          Pendiente: la descargas aquí cuando esté lista.
        </p>
      </TarjetaDocumento>
    );
  }

  return (
    <TarjetaDocumento
      tipo={factura.folio ? `Factura n.º ${factura.folio}` : 'Factura'}
      accion={
        <Button
          type="button"
          variant="link"
          className="h-auto min-h-10 gap-1.5 px-0 texto-etiqueta aria-disabled:opacity-50"
          // aria-disabled y no disabled: el botón conserva el foco y se lee «Descargando…»
          aria-disabled={descarga.isPending}
          onClick={() => {
            if (!descarga.isPending) descarga.mutate();
          }}
        >
          <File className="size-4.5" aria-hidden />
          {descarga.isPending ? (
            'Descargando…'
          ) : (
            <span>
              {/* En celular se lee «Descargar»; el nombre accesible siempre dice el formato */}
              Descargar <span className="sr-only md:not-sr-only">PDF</span>
            </span>
          )}
        </Button>
      }
    >
      {descarga.isError && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {descarga.error.message}
        </p>
      )}
    </TarjetaDocumento>
  );
};

/**
 * En escritorio, título «Documento», el tipo y debajo la acción. En celular la tarjeta es una
 * fila: el tipo destacado y la acción a la derecha; el título queda para los lectores de pantalla.
 */
const TarjetaDocumento = ({
  tipo,
  accion,
  children,
}: {
  tipo: string;
  accion?: ReactNode;
  children?: ReactNode;
}) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-2 rounded-lg border bg-fondo-superficie p-4 md:p-6"
    >
      <h2
        id={idTitulo}
        className="sr-only texto-cuerpo-fuerte text-texto-principal md:not-sr-only"
      >
        Documento
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-x-4 md:flex-col md:items-start md:gap-2">
        <p className="texto-cuerpo-fuerte wrap-break-word text-texto-principal md:texto-pequeno md:text-texto-secundario">
          {tipo}
        </p>
        {accion}
      </div>
      {children}
    </section>
  );
};
