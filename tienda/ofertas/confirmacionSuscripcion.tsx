'use client';

import { useMutation } from '@tanstack/react-query';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MensajeApi } from '@/compartido/api/respuestas';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { ResultadoCuenta } from '@/tienda/cuenta/resultadoCuenta';
import { RUTAS } from '@/tienda/diseno/enlaces';

/** Mismo texto que el 400 del backend (suscripciones.service.ts › enlaceInvalido). */
const ENLACE_INVALIDO = 'El enlace de confirmación no es válido o ya venció.';

const iconoAlerta = (
  <CircleAlertIcon aria-hidden className="size-6 stroke-[1.75]" />
);

/**
 * /suscripcion/confirmar?token= (E12-H1): envía el token del enlace del correo una sola vez y
 * muestra si la suscripción quedó confirmada o si el enlace venció.
 */
export function ConfirmacionSuscripcion() {
  const parametro = useSearchParams().get('token');
  // Se lee una vez: <ConfirmarToken> lo quita de la URL y el reintento lo sigue necesitando
  const [token] = useState(parametro);
  if (!token) return <EnlaceVencido mensaje={ENLACE_INVALIDO} />;
  return <ConfirmarToken token={token} />;
}

const ConfirmarToken = ({ token }: { token: string }) => {
  const enviado = useRef(false);
  const confirmacion = useMutation<MensajeApi, ErrorDeApi>({
    mutationFn: async () => {
      try {
        // TODO(SCRUM-68): el Swagger no declara el cuerpo { mensaje } del 200
        return exigir<MensajeApi>(
          await api.POST('/api/marketing/suscripciones/confirmar', {
            body: { token },
          }),
        );
      } catch (error) {
        throw error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      }
    },
  });
  const { mutate } = confirmacion;

  // En modo estricto el efecto corre dos veces: el ref evita un segundo envío (y gastar el
  // límite de 5 por minuto). Confirmar dos veces respondería lo mismo, pero no hace falta.
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    mutate();
    // Que el token no quede en la barra ni en el historial (equipos compartidos)
    window.history.replaceState(null, '', '/suscripcion/confirmar');
  }, [mutate]);

  if (confirmacion.isSuccess) {
    return (
      <ResultadoCuenta
        icono={<CircleCheckIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="Suscripción confirmada"
        mensaje={confirmacion.data.mensaje}
      >
        <Button asChild size="grande" className="w-full">
          <Link href={RUTAS.catalogo}>Ver el catálogo</Link>
        </Button>
      </ResultadoCuenta>
    );
  }

  if (confirmacion.isError) {
    // 400: enlace inválido, vencido o anterior a una baja. Lo demás (429, 5xx, sin conexión)
    // se reintenta.
    if (confirmacion.error.estado === 400) {
      return <EnlaceVencido mensaje={confirmacion.error.message} />;
    }
    return (
      <ResultadoCuenta
        icono={iconoAlerta}
        titulo="No pudimos confirmar tu suscripción"
        mensaje={confirmacion.error.message}
      >
        <Button
          size="grande"
          className="w-full"
          disabled={confirmacion.isPending}
          onClick={() => mutate()}
        >
          Intentar de nuevo
        </Button>
      </ResultadoCuenta>
    );
  }

  return <ConfirmacionEsqueleto />;
};

const EnlaceVencido = ({ mensaje }: { mensaje: string }) => (
  <ResultadoCuenta
    icono={iconoAlerta}
    titulo="El enlace venció"
    mensaje={mensaje}
  >
    <Button asChild variant="contorno" size="grande" className="w-full">
      <Link href={RUTAS.inicio}>Volver a la tienda</Link>
    </Button>
  </ResultadoCuenta>
);

/** Ícono, título, mensaje y botón mientras se confirma. */
export const ConfirmacionEsqueleto = () => (
  <div className="flex flex-col items-start gap-4">
    <span className="sr-only" role="status">
      Confirmando tu suscripción…
    </span>
    <Skeleton aria-hidden className="size-14 rounded-full" />
    <Skeleton aria-hidden className="h-[34px] w-56" />
    {/* El mensaje ocupa dos líneas a 360 px */}
    <Skeleton aria-hidden className="h-5 w-full" />
    <Skeleton aria-hidden className="h-5 w-3/4" />
    <Skeleton aria-hidden className="h-14 w-full rounded-full" />
  </div>
);
