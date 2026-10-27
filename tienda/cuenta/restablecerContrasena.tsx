'use client';

import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { FormularioRestablecer } from './formularioRestablecer';
import { ResultadoCuenta } from './resultadoCuenta';

/** Sin token no se llama al backend: se muestra su mismo mensaje (recuperacion-contrasena.service.ts). */
const ENLACE_INVALIDO =
  'El enlace de recuperación no es válido, ya se usó o venció. Solicita uno nuevo.';

type Estado =
  | { tipo: 'formulario' }
  | { tipo: 'listo'; mensaje: string }
  | { tipo: 'enlaceRechazado'; mensaje?: string };

/**
 * /restablecer-contrasena?token= (E1-H4). El backend no valida el enlace hasta recibir la
 * contraseña nueva: si está vencido o usado, se sabe al enviar el formulario. Sin token, se
 * trata como un enlace inválido.
 */
export function RestablecerContrasena() {
  const parametro = useSearchParams().get('token');
  // Se lee una vez: el efecto lo quita de la URL y el formulario lo sigue necesitando
  const [token] = useState(parametro);
  const [estado, setEstado] = useState<Estado>(
    token ? { tipo: 'formulario' } : { tipo: 'enlaceRechazado' },
  );

  // Que el token no quede en la barra ni en el historial (equipos compartidos)
  useEffect(() => {
    if (token) window.history.replaceState(null, '', '/restablecer-contrasena');
  }, [token]);

  if (estado.tipo === 'listo') {
    return (
      <ResultadoCuenta
        icono={<CircleCheckIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="Contraseña actualizada"
        mensaje={estado.mensaje}
      >
        <Button asChild size="grande" className="w-full">
          <Link href={RUTAS.ingresar}>Ingresar</Link>
        </Button>
      </ResultadoCuenta>
    );
  }

  if (estado.tipo === 'enlaceRechazado' || !token) {
    return (
      <ResultadoCuenta
        icono={<CircleAlertIcon aria-hidden className="size-6 stroke-[1.75]" />}
        titulo="El enlace venció"
        mensaje={
          (estado.tipo === 'enlaceRechazado' && estado.mensaje) ||
          ENLACE_INVALIDO
        }
      >
        <Button asChild size="grande" className="w-full">
          <Link href={RUTAS.recuperarContrasena}>Pedir un enlace nuevo</Link>
        </Button>
      </ResultadoCuenta>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 id="titulo-restablecer" className="titulo-h2">
        Nueva contraseña
      </h1>
      <p className="texto-pequeno text-texto-secundario">
        Escribe tu nueva contraseña. Debe tener al menos 8 caracteres, con una
        letra y un número.
      </p>
      <FormularioRestablecer
        token={token}
        alRestablecer={(mensaje) => setEstado({ tipo: 'listo', mensaje })}
        alRechazarEnlace={(mensaje) =>
          setEstado({ tipo: 'enlaceRechazado', mensaje })
        }
      />
    </div>
  );
}

/** Título, texto, dos campos y botón mientras se lee el enlace. */
export const RestablecerEsqueleto = () => (
  <div aria-hidden className="flex flex-col gap-4">
    <Skeleton className="h-[34px] w-56" />
    <Skeleton className="h-10 w-full max-md:h-16" />
    {[0, 1].map((campo) => (
      <div key={campo} className="flex flex-col gap-1.5">
        <Skeleton className="h-[18px] w-32" />
        <Skeleton className="h-[51px] w-full" />
      </div>
    ))}
    <Skeleton className="h-14 w-full rounded-full" />
  </div>
);
