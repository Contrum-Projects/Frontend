'use client';

import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/compartido/ui/button';
import { FormularioRestablecer } from '@/tienda/cuenta/formularioRestablecer';
import { RestablecerEsqueleto } from '@/tienda/cuenta/restablecerContrasena';
import { ResultadoCuenta } from '@/tienda/cuenta/resultadoCuenta';
import { RUTAS } from '@/tienda/diseno/enlaces';

/** Sin token no se llama al backend: se muestra su mismo mensaje (personal.service.ts). */
const ENLACE_INVALIDO = 'El enlace de invitación no es válido o ya venció.';

const INGRESAR_AL_PANEL =
  `${RUTAS.ingresar}?volver=${encodeURIComponent(RUTAS.panel)}` as Route;

type Estado =
  | { tipo: 'formulario' }
  | { tipo: 'listo'; mensaje: string }
  | { tipo: 'enlaceRechazado'; mensaje?: string };

/**
 * /personal/activar?token= (E13-H1; sin pantalla en Figma): la persona invitada define su
 * contraseña, igual que al recuperarla. El backend no valida el enlace hasta recibirla.
 */
const ActivarCuenta = () => {
  const parametro = useSearchParams().get('token');
  // Se lee una vez: el efecto lo quita de la URL y el formulario lo sigue necesitando
  const [token] = useState(parametro);
  const [estado, setEstado] = useState<Estado>(
    token ? { tipo: 'formulario' } : { tipo: 'enlaceRechazado' },
  );

  // Que el token no quede en la barra ni en el historial (equipos compartidos)
  useEffect(() => {
    if (token) window.history.replaceState(null, '', '/personal/activar');
  }, [token]);

  if (estado.tipo === 'listo') {
    return (
      <ResultadoCuenta
        icono={<CircleCheckIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="Contraseña creada"
        mensaje={estado.mensaje}
      >
        <Button asChild size="grande" className="w-full">
          <Link href={INGRESAR_AL_PANEL}>Ingresar</Link>
        </Button>
      </ResultadoCuenta>
    );
  }

  if (estado.tipo === 'enlaceRechazado' || !token) {
    return (
      <ResultadoCuenta
        icono={<CircleAlertIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="El enlace no sirve"
        mensaje={
          <>
            {(estado.tipo === 'enlaceRechazado' && estado.mensaje) ||
              ENLACE_INVALIDO}{' '}
            Pide a la administración de la tienda que te envíe una invitación
            nueva.
          </>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 id="titulo-restablecer" className="titulo-h2">
        Crea tu contraseña
      </h1>
      <p className="texto-pequeno text-texto-secundario">
        Con ella ingresarás al panel de Cabello Perfecto. Debe tener al menos 8
        caracteres, con una letra y un número.
      </p>
      <FormularioRestablecer
        token={token}
        enlace="invitacion"
        alRestablecer={(mensaje) => setEstado({ tipo: 'listo', mensaje })}
        alRechazarEnlace={(mensaje) =>
          setEstado({ tipo: 'enlaceRechazado', mensaje })
        }
      />
    </div>
  );
};

/** Misma tarjeta que /restablecer-contrasena. */
export function PantallaActivarCuenta() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8">
        {/* Lee ?token= en el navegador: va dentro de <Suspense> */}
        <Suspense fallback={<RestablecerEsqueleto />}>
          <ActivarCuenta />
        </Suspense>
      </div>
    </main>
  );
}
