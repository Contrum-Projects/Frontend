'use client';

import { useEffect, useRef, useState } from 'react';
import { ErrorDeApi } from '@/compartido/api/errores';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { useSolicitarVerificacion } from './consultasVerificacion';
import { TarjetaRut } from './tarjetaRut';

/** Texto del backend para el 409 sin RUT (`solicitud-verificacion.service.ts` › SIN_RUT). */
export const MENSAJE_SIN_RUT =
  'Registra tu RUT en tus datos antes de solicitar la verificación.';

/**
 * Paso 1 de la verificación (E10-H1, flujo del 2 nov 2026): se consulta en el SII el inicio de
 * actividades del RUT de la cuenta, sin documentos. Con el giro de peluquería la cuenta queda
 * verificada al instante; si no, la pantalla pide los documentos (E10-H2). El RUT es el de la
 * cuenta: se edita en Mis datos.
 */
export function SolicitudSii({
  rut,
  enfocar = false,
}: {
  /** El RUT de la cuenta (12345678-K), o `null` si no lo registró. */
  rut: string | null;
  /** Al abrirlo con «Enviar nueva solicitud», el foco va a su inicio (no queda en `body`). */
  enfocar?: boolean;
}) {
  const solicitar = useSolicitarVerificacion();
  const [faltaRut, setFaltaRut] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const enlaceRut = useRef<HTMLAnchorElement>(null);
  const inicio = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (enfocar) inicio.current?.focus();
  }, [enfocar]);

  const verificar = () => {
    setAviso(null);
    if (!rut) {
      setFaltaRut(true);
      enlaceRut.current?.focus();
      return;
    }
    solicitar.mutate(undefined, {
      onError: (error) => {
        if (error instanceof ErrorDeApi && error.message === MENSAJE_SIN_RUT) {
          setFaltaRut(true);
          enlaceRut.current?.focus();
          return;
        }
        setAviso(error.message);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p
          ref={inicio}
          tabIndex={-1}
          className="texto-cuerpo text-texto-secundario outline-none"
        >
          Con tu cuenta verificada compras a precio profesional. Revisamos en el
          SII el inicio de actividades de tu RUT: si tienes el giro de
          peluquería y otros tratamientos de belleza, quedas verificado al
          instante.
        </p>
        <p className="texto-pequeno text-texto-secundario">
          Si no lo tienes, te pediremos un título o certificado que acredite que
          trabajas en peluquería.
        </p>
      </div>
      <TarjetaRut
        rut={rut}
        editable
        error={faltaRut ? MENSAJE_SIN_RUT : undefined}
        refEnlace={enlaceRut}
      />
      {aviso && (
        <p role="alert" className="texto-pequeno text-destructive">
          {aviso}
        </p>
      )}
      <Button
        type="button"
        size="grande"
        disabled={solicitar.isPending}
        onClick={verificar}
        className="w-full sm:w-auto sm:self-start"
      >
        {solicitar.isPending && <Spinner aria-hidden />}
        {solicitar.isPending ? 'Consultando el SII…' : 'Verificar mi cuenta'}
      </Button>
    </div>
  );
}
