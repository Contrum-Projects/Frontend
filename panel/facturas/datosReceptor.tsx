import { useId, type ReactNode } from 'react';
import type { DetalleFacturaGestion } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { formatearRut } from '@/compartido/formato/rut';
import { cn } from '@/compartido/lib/utils';

const Monto = ({
  texto,
  monto,
  destacado = false,
}: {
  texto: ReactNode;
  monto: number;
  destacado?: boolean;
}) => (
  <div
    className={cn(
      // En celular van en una línea, separados por «·»
      // El «·» lleva texto alternativo vacío: los lectores de pantalla no lo leen
      `flex justify-between gap-4 texto-pequeno text-texto-principal max-lg:gap-1 max-lg:not-first:before:content-['·'_/_'']`,
      destacado ? 'lg:texto-etiqueta' : 'lg:text-texto-secundario',
    )}
  >
    <dt>{texto}</dt>
    <dd
      className={cn(
        'tabular-nums',
        !destacado && 'lg:text-texto-principal',
        destacado && 'lg:font-semibold',
      )}
    >
      {formatearPesos(monto)}
    </dd>
  </div>
);

/**
 * E9-H3, criterio 2 · «Datos para emitir en el SII»: el receptor que eligió el cliente y los
 * montos del pedido, tal como los entrega el backend (RNF-03). En escritorio, un monto por fila;
 * en celular, en una sola línea (Figma 2051:1443).
 */
export const DatosReceptor = ({
  factura,
}: {
  factura: DetalleFacturaGestion;
}) => {
  const idTitulo = useId();
  const { receptor, montos } = factura;
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-3 rounded-lg bg-fondo-hueso p-4 max-lg:border max-lg:bg-card"
    >
      <div className="flex flex-col gap-1">
        <h3 id={idTitulo} className="texto-leyenda text-texto-secundario">
          Datos para emitir en el SII
        </h3>
        <p className="texto-etiqueta wrap-break-word text-texto-principal">
          {receptor.razonSocial}
        </p>
        <p className="texto-pequeno wrap-break-word text-texto-principal">
          RUT {formatearRut(receptor.rut)} · Giro: {receptor.giro}
        </p>
        <p className="texto-pequeno wrap-break-word text-texto-principal">
          {receptor.direccion}, {receptor.comuna}
        </p>
      </div>
      <dl className="flex flex-col gap-1 max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-1">
        <Monto texto="Neto" monto={montos.neto} />
        <Monto
          texto={
            <>
              IVA
              <span className="max-lg:hidden">{` (${factura.porcentajeIva}%)`}</span>
            </>
          }
          monto={montos.iva}
        />
        <Monto texto="Total" monto={montos.total} destacado />
      </dl>
    </section>
  );
};
