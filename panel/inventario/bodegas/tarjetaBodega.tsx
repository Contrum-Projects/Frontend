'use client';

import { Pencil, Plus } from 'lucide-react';
import type { BodegaPanel, UbicacionPanel } from '@/compartido/api/respuestas';
import { formatearNumero } from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';
import { Button } from '@/compartido/ui/button';
import { Switch } from '@/compartido/ui/switch';
import { avisarError, useGuardarBodega } from './consultasBodegas';
import { TIPOS_BODEGA } from './formularioBodega';
import { ListaUbicaciones } from './listaUbicaciones';

const textoTipo = (tipo: string) =>
  TIPOS_BODEGA.find((t) => t.valor === tipo)?.texto ?? tipo;

/**
 * Una bodega con sus ubicaciones (SCRUM-151). Desactivar pide al backend, que lo rechaza si queda
 * stock: entonces el interruptor vuelve a su lugar y se muestra su mensaje.
 */
export const TarjetaBodega = ({
  bodega,
  alEditar,
  alAgregarUbicacion,
  alEditarUbicacion,
}: {
  bodega: BodegaPanel;
  alEditar: () => void;
  alAgregarUbicacion: () => void;
  alEditarUbicacion: (ubicacion: UbicacionPanel) => void;
}) => {
  const guardarBodega = useGuardarBodega();
  const titulo = `bodega-${bodega.id}`;

  return (
    <section
      aria-labelledby={titulo}
      className={cn(
        'flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6',
        !bodega.activa && 'opacity-80',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id={titulo}
              className="texto-cuerpo-fuerte text-texto-principal"
            >
              {bodega.nombre}
            </h2>
            <Badge className="bg-fondo-hueso-oscuro px-2.5 py-1 texto-leyenda text-texto-principal">
              {textoTipo(bodega.tipo)}
            </Badge>
            {!bodega.activa && (
              <Badge className="bg-estado-aviso-fondo px-2.5 py-1 texto-leyenda text-estado-aviso-texto">
                Desactivada
              </Badge>
            )}
          </div>
          <p className="texto-pequeno text-texto-secundario">
            {bodega.direccion}, {bodega.comuna.nombre} · {bodega.region.nombre}
          </p>
          <p className="texto-leyenda text-texto-secundario">
            {formatearNumero(bodega.stock)} unidades ·{' '}
            {bodega.abasteceVentaOnline
              ? 'Abastece la venta online'
              : 'No abastece la venta online'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 texto-pequeno text-texto-principal">
            <Switch
              checked={bodega.activa}
              disabled={guardarBodega.isPending}
              aria-label={`Bodega ${bodega.nombre} activa`}
              onCheckedChange={(activa) =>
                guardarBodega.mutate(
                  { id: bodega.id, datos: { activa } },
                  { onError: avisarError },
                )
              }
            />
            Activa
          </label>
          <Button variant="contorno" onClick={alEditar}>
            <Pencil aria-hidden />
            Editar<span className="sr-only"> {bodega.nombre}</span>
          </Button>
        </div>
      </div>

      <ListaUbicaciones bodega={bodega} alEditar={alEditarUbicacion} />
      <Button variant="link" className="w-fit" onClick={alAgregarUbicacion}>
        <Plus aria-hidden />
        Agregar ubicación
      </Button>
    </section>
  );
};
