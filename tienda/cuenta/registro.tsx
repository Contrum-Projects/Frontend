'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { destinoTrasIngreso } from './destinoIngreso';
import { FormularioRegistro } from './formularioRegistro';
import { PestanasCuenta } from './pestanasCuenta';
import { RevisaTuCorreo } from './revisaTuCorreo';

/**
 * Registro (E1-H1) según la sesión: con sesión activa no hay nada que registrar y lleva a la
 * persona según su rol; mientras se sabe si hay sesión, esqueleto. Creada la cuenta, muestra
 * «Revisa tu correo» sin las pestañas (como en Figma 2034:4841); el formulario queda montado
 * (oculto) para volver con lo escrito.
 */
export function Registro() {
  const { estado, usuario } = useSesion();
  const router = useRouter();
  const [registrado, setRegistrado] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) router.replace(destinoTrasIngreso(usuario.rol, null));
  }, [usuario, router]);

  if (estado !== 'anonima') {
    return (
      <Tarjeta>
        <RegistroEsqueleto />
      </Tarjeta>
    );
  }

  return (
    <>
      {!registrado && <PestanasCuenta activa="registro" />}
      <Tarjeta tituloId={registrado ? undefined : 'titulo-registro'}>
        {registrado && (
          <RevisaTuCorreo
            email={registrado}
            alCambiar={() => setRegistrado(null)}
          />
        )}
        <div hidden={registrado !== null} className="flex flex-col gap-4">
          <h1 id="titulo-registro" className="titulo-h2 max-md:sr-only">
            Crear cuenta
          </h1>
          <FormularioRegistro alRegistrar={setRegistrado} />
        </div>
      </Tarjeta>
    </>
  );
}

const Tarjeta = ({
  tituloId,
  children,
}: {
  tituloId?: string;
  children: ReactNode;
}) => (
  <section
    aria-labelledby={tituloId}
    className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8"
  >
    {children}
  </section>
);

const CampoEsqueleto = () => (
  <div className="flex flex-col gap-1.5">
    <Skeleton className="h-[18px] w-32" />
    <Skeleton className="h-[51px] w-full" />
  </div>
);

/**
 * Mismo alto que el formulario: título, nombre y apellido, correo, contraseñas, opcionales y su
 * leyenda, casilla, botón, leyenda y enlace a Ingresar.
 */
const RegistroEsqueleto = () => (
  <div aria-hidden className="flex flex-col gap-4">
    <Skeleton className="h-[34px] w-44 max-md:hidden" />
    <div className="grid grid-cols-2 gap-3">
      <CampoEsqueleto />
      <CampoEsqueleto />
    </div>
    <CampoEsqueleto />
    <CampoEsqueleto />
    <CampoEsqueleto />
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
      <CampoEsqueleto />
      <CampoEsqueleto />
      <CampoEsqueleto />
      <CampoEsqueleto />
    </div>
    <Skeleton className="h-4 w-80 max-w-full" />
    <div className="flex min-h-10 items-center">
      <Skeleton className="h-5 w-60" />
    </div>
    <Skeleton className="h-14 w-full rounded-full" />
    <Skeleton className="h-4 w-72 max-w-full" />
    <div className="flex min-h-10 items-center">
      <Skeleton className="h-5 w-44" />
    </div>
  </div>
);
