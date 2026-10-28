import type { CambioPrecio } from '@/compartido/api/respuestas';
import { formatearFechaHora } from '@/compartido/formato/fecha';
import { formatearPesosNetos } from '@/compartido/formato/moneda';
import { Badge } from '@/compartido/ui/badge';

const TIPOS: Record<CambioPrecio['tipoPrecio'], string> = {
  minorista: 'Minorista',
  mayorista: 'Mayorista',
};

/**
 * Historial de cambios de precio del formato (E3-H5 criterio 3), del más reciente al más
 * antiguo como lo entrega el backend. Figma no lo dibuja.
 */
export const HistorialPrecios = ({
  historial,
}: {
  historial: CambioPrecio[];
}) => (
  <section aria-labelledby="historial-precios" className="flex flex-col gap-3">
    <h3 id="historial-precios" className="texto-etiqueta text-texto-principal">
      Historial de cambios
    </h3>
    {historial.length === 0 ? (
      <p className="texto-pequeno text-texto-secundario">
        Aún no hay cambios de precio.
      </p>
    ) : (
      <ol className="flex flex-col gap-3">
        {historial.map((cambio) => (
          <li
            key={cambio.id}
            className="flex flex-col gap-1 rounded-md bg-fondo-hueso p-3"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="texto-etiqueta text-texto-principal">
                {TIPOS[cambio.tipoPrecio]} ·{' '}
                <span className="tabular-nums">
                  {formatearPesosNetos(cambio.precioNeto)}
                </span>{' '}
                neto
              </span>
              {cambio.fechaFinVigencia === null && (
                <Badge className="bg-marca-acento-suave texto-leyenda text-marca-profundo">
                  Vigente
                </Badge>
              )}
            </div>
            <span className="texto-leyenda text-texto-secundario">
              Desde el {formatearFechaHora(cambio.fechaInicioVigencia)} ·{' '}
              {cambio.fijadoPor.nombre} {cambio.fijadoPor.apellido}
            </span>
            {cambio.motivo && (
              <p className="texto-pequeno break-words text-texto-principal">
                {cambio.motivo}
              </p>
            )}
          </li>
        ))}
      </ol>
    )}
  </section>
);
