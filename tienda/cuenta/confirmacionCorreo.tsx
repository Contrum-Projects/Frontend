'use client';

import { useMutation } from '@tanstack/react-query';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MensajeApi } from '@/compartido/api/respuestas';
import { useSesion } from '@/compartido/sesion/sesion';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { RevisaTuCorreo } from './revisaTuCorreo';

/**
 * /confirmar-correo?token= (E1-H1): envía el token del enlace una sola vez y muestra si la
 * cuenta quedó confirmada o si el enlace venció. Sin token, «Revisa tu correo».
 */
export function ConfirmacionCorreo() {
  const parametro = useSearchParams().get('token');
  // Se lee una vez: <ConfirmarToken> lo quita de la URL y el reintento lo sigue necesitando
  const [token] = useState(parametro);
  if (!token) return <RevisaTuCorreo />;
  return <ConfirmarToken token={token} />;
}

const ConfirmarToken = ({ token }: { token: string }) => {
  const { estado } = useSesion();
  const enviado = useRef(false);
  const confirmacion = useMutation({
    mutationFn: async () => {
      try {
        return exigir<MensajeApi>(
          await api.POST('/api/cuentas/confirmar-correo', { body: { token } }),
        );
      } catch (error) {
        // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
        throw error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      }
    },
  });
  const { mutate } = confirmacion;

  // El enlace es de un solo uso: en modo estricto el efecto corre dos veces y el segundo
  // envío respondería «ya venció». El ref sobrevive al remontaje.
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    mutate();
    // Que el token no quede en la barra ni en el historial (equipos compartidos)
    window.history.replaceState(null, '', '/confirmar-correo');
  }, [mutate]);

  if (confirmacion.isSuccess) {
    const conSesion = estado === 'activa';
    return (
      <Resultado
        icono={<CircleCheckIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="Correo confirmado"
        mensaje={confirmacion.data.mensaje}
      >
        <Button asChild size="grande" className="w-full">
          <Link href={conSesion ? RUTAS.catalogo : RUTAS.ingresar}>
            {conSesion ? 'Ver el catálogo' : 'Ingresar'}
          </Link>
        </Button>
      </Resultado>
    );
  }

  if (confirmacion.isError) {
    const fallo = confirmacion.error as ErrorDeApi;
    // 400: enlace inválido, usado o vencido. Lo demás (429, 5xx, sin conexión) se reintenta.
    if (fallo.estado === 400) {
      return (
        <Resultado
          icono={
            <CircleAlertIcon aria-hidden className="size-6 stroke-[1.75]" />
          }
          titulo="El enlace venció"
          mensaje={fallo.message}
        >
          <Button asChild variant="contorno" size="grande" className="w-full">
            <Link href={RUTAS.inicio}>Volver a la tienda</Link>
          </Button>
        </Resultado>
      );
    }
    return (
      <Resultado
        icono={<CircleAlertIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="No pudimos confirmar tu correo"
        mensaje={fallo.message}
      >
        <Button
          size="grande"
          className="w-full"
          onClick={() => confirmacion.mutate()}
        >
          Intentar de nuevo
        </Button>
      </Resultado>
    );
  }

  return <ConfirmacionEsqueleto />;
};

const Resultado = ({
  icono,
  titulo,
  mensaje,
  children,
}: {
  icono: ReactNode;
  titulo: string;
  mensaje: string;
  children: ReactNode;
}) => {
  const encabezado = useRef<HTMLHeadingElement>(null);

  // El resultado reemplaza al esqueleto: el foco va al título para que se anuncie
  useEffect(() => {
    encabezado.current?.focus();
  }, [titulo]);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex size-14 items-center justify-center rounded-full bg-marca-acento-suave text-marca-profundo">
        {icono}
      </div>
      <h1 ref={encabezado} tabIndex={-1} className="titulo-h2 outline-none">
        {titulo}
      </h1>
      <p className="texto-pequeno text-texto-secundario">{mensaje}</p>
      {children}
    </div>
  );
};

/** Ícono, título, mensaje y botón mientras se confirma. */
export const ConfirmacionEsqueleto = () => (
  <div className="flex flex-col items-start gap-4">
    <span className="sr-only" role="status">
      Confirmando tu correo…
    </span>
    <Skeleton aria-hidden className="size-14 rounded-full" />
    <Skeleton aria-hidden className="h-[34px] w-56" />
    <Skeleton aria-hidden className="h-5 w-full" />
    <Skeleton aria-hidden className="h-14 w-full rounded-full" />
  </div>
);
