'use client';

import { CircleAlertIcon, MailXIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/compartido/ui/button';
import { ResultadoCuenta } from '@/tienda/cuenta/resultadoCuenta';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { ConfirmacionEsqueleto } from './confirmacionSuscripcion';
import { useBajaOfertas } from './consultasOfertas';

/** Sin token no se llama al backend. TODO(SCRUM-69): mismo texto que su 400 cuando exista. */
const ENLACE_INVALIDO = 'El enlace de baja no es válido.';

const iconoAlerta = (
  <CircleAlertIcon aria-hidden className="size-6 stroke-[1.75]" />
);

/**
 * /ofertas/baja?token= (E12-H2, criterio 3): envía el token del enlace de un correo de ofertas
 * una sola vez y confirma que esa dirección no recibirá más publicidad. No pide sesión.
 */
export function BajaOfertas() {
  const parametro = useSearchParams().get('token');
  // Se lee una vez: <DarDeBaja> lo quita de la URL y el reintento lo sigue necesitando
  const [token] = useState(parametro);
  if (!token) return <EnlaceInvalido mensaje={ENLACE_INVALIDO} />;
  return <DarDeBaja token={token} />;
}

const DarDeBaja = ({ token }: { token: string }) => {
  const enviado = useRef(false);
  const baja = useBajaOfertas();
  const { mutate } = baja;

  // En modo estricto el efecto corre dos veces: el ref evita un segundo envío
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    mutate(token);
    // Que el token no quede en la barra ni en esta entrada del historial de la pestaña
    window.history.replaceState(null, '', '/ofertas/baja');
  }, [mutate, token]);

  if (baja.isSuccess) {
    return (
      <ResultadoCuenta
        icono={<MailXIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="Te diste de baja"
        mensaje={baja.data.mensaje}
      >
        <Button asChild variant="contorno" size="grande" className="w-full">
          <Link href={RUTAS.inicio}>Volver a la tienda</Link>
        </Button>
      </ResultadoCuenta>
    );
  }

  if (baja.isError) {
    // 400: enlace que no es válido. Lo demás (429, 5xx, sin conexión) se reintenta.
    if (baja.error.estado === 400) {
      return <EnlaceInvalido mensaje={baja.error.message} />;
    }
    return (
      <ResultadoCuenta
        icono={iconoAlerta}
        titulo="No pudimos darte de baja"
        mensaje={baja.error.message}
      >
        <Button
          size="grande"
          className="w-full"
          disabled={baja.isPending}
          onClick={() => mutate(token)}
        >
          Intentar de nuevo
        </Button>
      </ResultadoCuenta>
    );
  }

  return <ConfirmacionEsqueleto texto="Procesando tu baja…" />;
};

const EnlaceInvalido = ({ mensaje }: { mensaje: string }) => (
  <ResultadoCuenta
    icono={iconoAlerta}
    titulo="El enlace no es válido"
    mensaje={mensaje}
  >
    <Button asChild variant="contorno" size="grande" className="w-full">
      <Link href={RUTAS.inicio}>Volver a la tienda</Link>
    </Button>
  </ResultadoCuenta>
);
