'use client';

import { Pencil } from 'lucide-react';
import type { BodegaPanel, UbicacionPanel } from '@/compartido/api/respuestas';
import { formatearNumero } from '@/compartido/formato/numero';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Switch } from '@/compartido/ui/switch';
import { avisarError, useGuardarUbicacion } from './consultasBodegas';

/** «Zona Norte · Pasillo 2 · Estante B»; vacío si no tiene. */
const textoPartes = (u: UbicacionPanel) =>
  [
    u.zona && `Zona ${u.zona}`,
    u.pasillo && `Pasillo ${u.pasillo}`,
    u.estante && `Estante ${u.estante}`,
    u.nivel && `Nivel ${u.nivel}`,
  ]
    .filter(Boolean)
    .join(' · ');

/** Las ubicaciones de la bodega con su stock; cada una se edita o se desactiva (sin stock). */
export const ListaUbicaciones = ({
  bodega,
  alEditar: alEditarUbicacion,
}: {
  bodega: BodegaPanel;
  alEditar: (ubicacion: UbicacionPanel) => void;
}) => {
  const guardarUbicacion = useGuardarUbicacion();
  return (
    <>
      {bodega.ubicaciones.length === 0 ? (
        <p className="texto-pequeno text-texto-secundario">
          Aún no tiene ubicaciones: agrega una para recibir stock aquí.
        </p>
      ) : (
        <ul
          aria-label={`Ubicaciones de ${bodega.nombre}`}
          className="flex flex-col divide-y"
        >
          {bodega.ubicaciones.map((ubicacion) => (
            <li
              key={ubicacion.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    'texto-etiqueta text-texto-principal',
                    !ubicacion.activa && 'text-texto-secundario line-through',
                  )}
                >
                  {ubicacion.codigo}
                </span>
                <span className="texto-leyenda text-texto-secundario">
                  {[
                    textoPartes(ubicacion),
                    `${formatearNumero(ubicacion.stock)} unidades`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={ubicacion.activa}
                  disabled={guardarUbicacion.isPending}
                  aria-label={`Ubicación ${ubicacion.codigo} activa`}
                  onCheckedChange={(activa) =>
                    guardarUbicacion.mutate(
                      {
                        bodegaId: bodega.id,
                        ubicacionId: ubicacion.id,
                        datos: { activa },
                      },
                      { onError: avisarError },
                    )
                  }
                />
                <Button
                  variant="ghost"
                  size="icono"
                  aria-label={`Editar la ubicación ${ubicacion.codigo}`}
                  onClick={() => alEditarUbicacion(ubicacion)}
                >
                  <Pencil aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
