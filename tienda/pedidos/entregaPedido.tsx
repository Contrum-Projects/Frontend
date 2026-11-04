import { useId, type ReactNode } from 'react';
import type {
  DetallePedidoCuenta,
  EnvioPedido,
} from '@/compartido/api/respuestas';
import { formatearDiaHora } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { etiquetaEnvio } from './estadoEnvio';

/** «Av. Ejemplo 1234, depto. 56, Ñuñoa», con lo que guardó el pedido. */
export const textoDireccion = (envio: EnvioPedido) =>
  [`${envio.calle} ${envio.numero}`, envio.referencia, envio.comuna.nombre]
    .filter(Boolean)
    .join(', ');

/** Tarjeta de los datos del pedido (Figma 2019:1734): título y líneas de texto. */
const TarjetaDato = ({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-2 rounded-lg border bg-fondo-superficie p-4 md:p-6"
    >
      <h2 id={idTitulo} className="texto-cuerpo-fuerte text-texto-principal">
        {titulo}
      </h2>
      {children}
    </section>
  );
};

/**
 * E7-H3 · El despacho: servicio, código de seguimiento, estado del envío y dirección (Figma
 * 2019:1734; en celular, 2019:3052 junta servicio y código en una línea). El código y el estado
 * aparecen al despachar: antes el envío no tiene código y su «pendiente» ya lo dice el historial.
 */
const TarjetaEnvio = ({ envio }: { envio: EnvioPedido }) => {
  const codigo = envio.codigoSeguimiento;

  return (
    <TarjetaDato titulo="Envío">
      {/* En celular, servicio y código en una línea secundaria; en escritorio, el servicio destaca */}
      <p
        className={cn(
          'texto-pequeno wrap-break-word text-texto-principal',
          codigo && 'text-texto-secundario md:text-texto-principal',
        )}
      >
        {envio.servicio}
        {codigo && (
          <span className="md:hidden">
            {' · '}Código {codigo}
          </span>
        )}
      </p>
      {codigo && (
        <>
          <p className="hidden texto-pequeno wrap-break-word text-texto-secundario md:block">
            Código de seguimiento: {codigo}
          </p>
          <p className="texto-pequeno text-texto-secundario">
            Estado del envío: {etiquetaEnvio(envio.estado)}
          </p>
        </>
      )}
      <p className="texto-pequeno wrap-break-word text-texto-secundario">
        {textoDireccion(envio)}
      </p>
    </TarjetaDato>
  );
};

/**
 * E8-H1, criterio 2 · Cómo se entrega el pedido y, si ya se pagó, cuándo. El comprobante o la
 * factura son de SCRUM-128.
 */
export const DatosPedido = ({ pedido }: { pedido: DetallePedidoCuenta }) => {
  // La fecha del pago es la del cambio a «pagado» del historial
  const pago = pedido.historial.find((cambio) => cambio.estado === 'pagado');

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {pedido.envio ? (
        <TarjetaEnvio envio={pedido.envio} />
      ) : (
        <TarjetaDato titulo="Entrega">
          <p className="texto-pequeno text-texto-principal">Retiro en tienda</p>
        </TarjetaDato>
      )}
      {pago && (
        <TarjetaDato titulo="Pago">
          <p className="texto-pequeno text-texto-secundario">
            Pagado el{' '}
            <time dateTime={pago.fecha}>{formatearDiaHora(pago.fecha)}</time>
          </p>
        </TarjetaDato>
      )}
    </div>
  );
};
