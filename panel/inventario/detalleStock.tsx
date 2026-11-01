'use client';

import type { StockFormato } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { formatearPesosNetos } from '@/compartido/formato/moneda';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Badge } from '@/compartido/ui/badge';
import { Skeleton } from '@/compartido/ui/skeleton';
import { PanelLateral } from '@/panel/catalogo/panelLateral';
import { nombreUbicacion } from './consultasEntradas';
import { useStockFormato } from './consultasStock';

/**
 * Detalle del stock de un formato (flecha de la fila en P5a): unidades en cada ubicación, total y
 * última entrada, de GET /inventario/stock/formatos/{id} (SCRUM-40). Se pide al abrir.
 */
export const DetalleStock = ({
  formato,
  alCerrar,
}: {
  /** El formato elegido, o null con el panel cerrado. */
  formato: { formatoId: number; titulo: string } | null;
  alCerrar: () => void;
}) => (
  <PanelLateral
    titulo={formato?.titulo ?? 'Stock por ubicación'}
    abierto={formato !== null}
    alCambiarAbierto={(abierto) => {
      if (!abierto) alCerrar();
    }}
  >
    {formato && <Contenido formatoId={formato.formatoId} />}
  </PanelLateral>
);

const Contenido = ({ formatoId }: { formatoId: number }) => {
  const consulta = useStockFormato(formatoId);

  if (consulta.isPending) return <EsqueletoDetalle />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  return <Detalle stock={consulta.data} />;
};

const Detalle = ({ stock }: { stock: StockFormato }) => (
  <div className="flex flex-col gap-6">
    <p className="texto-pequeno text-texto-secundario">
      {stock.formato.sku}
      {!stock.formato.activo && (
        <Badge variant="secondary" className="ml-2">
          Inactivo
        </Badge>
      )}
    </p>

    <section
      aria-labelledby="stock-ubicaciones"
      className="flex flex-col gap-2"
    >
      <h3 id="stock-ubicaciones" className="texto-cuerpo-fuerte">
        Ubicaciones
      </h3>
      {stock.ubicaciones.length === 0 ? (
        <p className="texto-pequeno text-texto-secundario">
          No hay unidades en ninguna ubicación.
        </p>
      ) : (
        <ul className="flex flex-col">
          {stock.ubicaciones.map((ubicacion) => (
            <li
              key={ubicacion.id}
              className="flex items-center justify-between gap-3 border-t py-2 texto-pequeno first:border-t-0"
            >
              <span>
                {nombreUbicacion(ubicacion)}
                {!ubicacion.activa && (
                  <span className="text-texto-secundario"> (desactivada)</span>
                )}
              </span>
              <span className="tabular-nums">{ubicacion.cantidad}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="flex justify-between gap-3 border-t pt-2 texto-etiqueta">
        <span>Total</span>
        <span className="tabular-nums">{stock.total}</span>
      </p>
    </section>

    <section
      aria-labelledby="stock-ultima-entrada"
      className="flex flex-col gap-2"
    >
      <h3 id="stock-ultima-entrada" className="texto-cuerpo-fuerte">
        Última entrada
      </h3>
      {stock.ultimaEntrada ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 texto-pequeno">
          <dt className="text-texto-secundario">Fecha</dt>
          <dd>{formatearDia(stock.ultimaEntrada.fechaRecepcion)}</dd>
          <dt className="text-texto-secundario">Proveedor</dt>
          <dd>{stock.ultimaEntrada.proveedor.razonSocial}</dd>
          <dt className="text-texto-secundario">Costo neto</dt>
          <dd className="tabular-nums">
            {formatearPesosNetos(stock.ultimaEntrada.costoUnitarioNeto)}
          </dd>
        </dl>
      ) : (
        <p className="texto-pequeno text-texto-secundario">
          Este formato aún no se ha recibido: no tiene proveedor ni costo.
        </p>
      )}
    </section>
  </div>
);

const EsqueletoDetalle = () => (
  <div aria-hidden className="flex flex-col gap-3">
    <Skeleton className="h-5 w-24" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-2/3" />
  </div>
);
