'use client';

import { Check, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { DialogoDireccion } from '@/tienda/cuenta/dialogoDireccion';
import {
  detalleDireccion,
  ListaDirecciones,
  tituloDireccion,
} from './listaDirecciones';
import type { Entrega } from './useEntrega';

/** Botón con forma de enlace (Figma: texto etiqueta en profundo). */
const CLASE_ENLACE = 'h-auto min-h-10 px-0 texto-etiqueta';

/**
 * E7-H1, criterio 2 · A qué dirección de la cuenta va el despacho (Figma › 05 Checkout
 * 2010:1101): la elegida, con «Cambiar» para elegir otra de la lista y «Agregar otra
 * dirección» con el mismo diálogo de Mis datos. En la lista, las flechas solo marcan: la
 * dirección se usa (y se cotiza) al pulsar «Usar esta dirección», y el foco vuelve a «Cambiar».
 */
export const DireccionDespacho = ({ entrega }: { entrega: Entrega }) => {
  const [eligiendo, setEligiendo] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const { direcciones, direccion } = entrega;
  const botonCambiar = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);
  useEffect(() => {
    if (eligiendo || !devolverFoco.current) return;
    devolverFoco.current = false;
    botonCambiar.current?.focus();
  }, [eligiendo]);

  if (direcciones.isPending) {
    // Con la forma de la tarjeta y el enlace de abajo, para que no salte al cargar
    return (
      <div aria-hidden className="flex flex-col gap-2 md:pl-16">
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  if (direcciones.isError) {
    return (
      <Alert variant="destructive" className="md:ml-16 md:w-auto">
        <AlertDescription>{direcciones.error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:pl-16">
      {!direccion && (
        <p className="texto-pequeno text-texto-secundario">
          Agrega la dirección donde quieres recibir tu pedido.
        </p>
      )}
      {direccion && !eligiendo && (
        <div className="flex items-start gap-3 rounded-md border bg-fondo-superficie px-4 py-3">
          <Check
            className="mt-0.5 size-5 shrink-0 text-marca-profundo"
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="texto-cuerpo-fuerte break-words text-texto-principal">
              {tituloDireccion(direccion)}
            </p>
            <p className="texto-pequeno text-texto-secundario">
              {detalleDireccion(direccion)}
            </p>
          </div>
          {direcciones.data.length > 1 && (
            <Button
              ref={botonCambiar}
              variant="link"
              className={CLASE_ENLACE}
              aria-label="Cambiar dirección"
              onClick={() => setEligiendo(true)}
            >
              Cambiar
            </Button>
          )}
        </div>
      )}
      {direccion && eligiendo && (
        <ListaDirecciones
          direcciones={direcciones.data}
          elegida={direccion.id}
          alElegir={(id) => {
            entrega.elegirDireccion(id);
            devolverFoco.current = true;
            setEligiendo(false);
          }}
        />
      )}
      <Button
        variant="link"
        className={cn(CLASE_ENLACE, 'self-start')}
        onClick={() => setAgregando(true)}
      >
        <Plus aria-hidden />
        {direccion ? 'Agregar otra dirección' : 'Agregar dirección'}
      </Button>
      <DialogoDireccion
        abierto={agregando}
        alCambiarAbierto={setAgregando}
        // E7-H2 · La dirección nueva queda elegida y se cotiza
        alGuardar={(nueva) => entrega.elegirDireccion(nueva.id)}
      />
    </div>
  );
};
