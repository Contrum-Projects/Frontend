'use client';

import { MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/compartido/ui/button';
import { ResultadoCuenta } from '@/tienda/cuenta/resultadoCuenta';
import { CORREO_CONTACTO } from '@/tienda/diseno/contacto';
import { RUTAS } from '@/tienda/diseno/enlaces';

/**
 * /ofertas/baja: a esta pantalla llegan los enlaces de baja de correos antiguos. La baja ya no se
 * hace desde el enlace: la persona escribe al correo de contacto y el administrador la registra en
 * el panel (decisión del equipo del 11 nov, SCRUM-19). No llama al backend.
 */
export function BajaOfertas() {
  // El token de los enlaces antiguos lleva el correo: que no quede en la barra ni en el historial
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, '', '/ofertas/baja');
    }
  }, []);

  return (
    <ResultadoCuenta
      icono={<MailIcon aria-hidden className="size-6 stroke-[1.75]" />}
      titulo="Darte de baja de las ofertas"
      mensaje={
        <>
          Para dejar de recibir ofertas por correo, escríbenos a{' '}
          <a
            href={`mailto:${CORREO_CONTACTO}`}
            className="texto-etiqueta text-marca-profundo underline-offset-2 hover:underline"
          >
            {CORREO_CONTACTO}
          </a>{' '}
          desde la dirección que quieres dar de baja.
        </>
      }
    >
      <Button asChild variant="contorno" size="grande" className="w-full">
        <Link href={RUTAS.inicio}>Volver a la tienda</Link>
      </Button>
    </ResultadoCuenta>
  );
}
