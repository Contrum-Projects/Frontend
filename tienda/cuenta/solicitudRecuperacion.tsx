'use client';

import { useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MensajeApi } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { FormularioSolicitud } from './formularioSolicitud';
import { RevisaTuCorreo } from './revisaTuCorreo';

interface Enviado {
  email: string;
  /** El backend responde lo mismo tenga o no cuenta el correo: se muestra tal cual. */
  mensaje: string;
}

/** POST /api/cuentas/recuperar-contrasena, con los fallos de red como `ErrorDeApi`. */
const pedirEnlace = async (email: string) => {
  try {
    return exigir<MensajeApi>(
      await api.POST('/api/cuentas/recuperar-contrasena', { body: { email } }),
    );
  } catch (error) {
    throw error instanceof ErrorDeApi ? error : errorDeApi(undefined);
  }
};

/**
 * «Recuperar contraseña» (E1-H4): pide el correo y muestra «Revisa tu correo» con el mensaje
 * del backend. El formulario queda montado (oculto) para volver con lo escrito.
 */
export function SolicitudRecuperacion() {
  const [enviado, setEnviado] = useState<Enviado | null>(null);
  const solicitud = useMutation<MensajeApi, ErrorDeApi, string>({
    mutationFn: pedirEnlace,
  });
  const volverAlCorreo = useRef(false);

  // «Cambiarlo» desaparece con el aviso: el foco pasa al correo, que ya se ve
  useEffect(() => {
    if (enviado || !volverAlCorreo.current) return;
    volverAlCorreo.current = false;
    document.getElementById('recuperacion-email')?.focus();
  }, [enviado]);

  const solicitar = async (email: string) => {
    const { mensaje } = await solicitud.mutateAsync(email);
    setEnviado({ email, mensaje });
  };

  return (
    <>
      {!enviado && (
        <Link
          href={RUTAS.ingresar}
          className="inline-flex min-h-10 w-fit items-center gap-2 texto-etiqueta text-marca-profundo hover:underline"
        >
          <ArrowLeftIcon aria-hidden className="size-4 stroke-[1.75]" />
          Ingresar
        </Link>
      )}
      <section
        aria-labelledby={enviado ? undefined : 'titulo-recuperacion'}
        className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8"
      >
        {enviado && (
          <RevisaTuCorreo
            email={enviado.email}
            mensaje={enviado.mensaje}
            alCambiar={() => {
              solicitud.reset();
              volverAlCorreo.current = true;
              setEnviado(null);
            }}
          >
            <Reenviar email={enviado.email} />
          </RevisaTuCorreo>
        )}
        <div hidden={enviado !== null} className="flex flex-col gap-4">
          <h1 id="titulo-recuperacion" className="titulo-h2">
            Recuperar contraseña
          </h1>
          <p className="texto-pequeno text-texto-secundario">
            Escribe el correo de tu cuenta y te enviaremos un enlace para crear
            una nueva contraseña.
          </p>
          <FormularioSolicitud solicitar={solicitar} />
        </div>
      </section>
    </>
  );
}

/** «Reenviar correo»: vuelve a pedir el enlace (el anterior deja de servir). */
const Reenviar = ({ email }: { email: string }) => {
  const reenvio = useMutation<MensajeApi, ErrorDeApi, string>({
    mutationFn: pedirEnlace,
  });

  return (
    <>
      <Button
        variant="contorno"
        size="grande"
        className="w-full"
        disabled={reenvio.isPending}
        onClick={() => reenvio.mutate(email)}
      >
        {reenvio.isPending && <Spinner aria-hidden />}
        Reenviar correo
      </Button>
      {/* Siempre en el árbol, para que se anuncie lo que aparece; la key repite el aviso */}
      <div role="status" className="w-full">
        {reenvio.isSuccess && (
          <p
            key={reenvio.submittedAt}
            className="texto-pequeno text-texto-secundario"
          >
            Te enviamos el correo de nuevo.
          </p>
        )}
      </div>
      {reenvio.isError && (
        <Alert variant={reenvio.error.estado === 429 ? 'aviso' : 'destructive'}>
          <AlertDescription className="texto-pequeno">
            {reenvio.error.message}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
