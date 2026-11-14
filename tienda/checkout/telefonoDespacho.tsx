'use client';

import { useEffect, useRef } from 'react';
import { ErrorDeApi, repartirErrores } from '@/compartido/api/errores';
import { Input } from '@/compartido/ui/input';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import type { Entrega } from './useEntrega';

const ID_CAMPO = 'checkout-telefono';

/**
 * SCRUM-167 · El mensaje del backend para el teléfono de contacto (campo `telefonoContacto` en
 * `errores`), o `null` si el error es de otra cosa. Así se muestra junto al campo y no arriba.
 */
export const errorDelTelefono = (error: Error | null): string | null => {
  if (!(error instanceof ErrorDeApi)) return null;
  const { porCampo } = repartirErrores(error, {
    telefonoContacto: 'telefonoContacto',
  });
  return porCampo[0]?.[1] ?? null;
};

/**
 * SCRUM-167, criterio 4 · El teléfono de quien recibe el despacho, que Chilexpress exige para
 * crear la OT. Parte con el teléfono de la cuenta y no lo cambia: solo viaja con el pedido. Si el
 * backend lo rechaza, el mensaje queda debajo del campo, el foco vuelve a él y se conserva lo
 * escrito.
 */
export const TelefonoDespacho = ({
  entrega,
  error,
}: {
  entrega: Entrega;
  error: string | null;
}) => {
  const campo = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (error) campo.current?.focus();
  }, [error]);

  return (
    <div className="flex flex-col gap-1 sm:max-w-sm md:pl-16">
      <CampoFormulario
        id={ID_CAMPO}
        etiqueta="Teléfono de contacto"
        error={error ?? undefined}
        obligatorio
      >
        {(props) => (
          <Input
            {...props}
            ref={campo}
            type="tel"
            autoComplete="tel"
            placeholder="+56 9"
            maxLength={20}
            aria-describedby={
              [props['aria-describedby'], `${ID_CAMPO}-ayuda`]
                .filter(Boolean)
                .join(' ') || undefined
            }
            value={entrega.telefono}
            onChange={(evento) => entrega.cambiarTelefono(evento.target.value)}
          />
        )}
      </CampoFormulario>
      <p
        id={`${ID_CAMPO}-ayuda`}
        className="texto-leyenda text-texto-secundario"
      >
        Chilexpress lo usa para coordinar la entrega.
      </p>
    </div>
  );
};
