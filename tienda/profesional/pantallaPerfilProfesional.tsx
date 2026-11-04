'use client';

import { ArrowLeft, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useEsProfesional } from './consultasProfesional';
import { useMiPerfilProfesional } from './consultasPerfil';
import { FormularioPerfil } from './formularioPerfil';
import { ResumenPerfil } from './resumenPerfil';

/**
 * 08c Perfil profesional (Figma 2038:2666 y 2038:5397, E10-H5). Figma lo dibuja dentro de
 * Verificación; aquí es su propia página (decisión de SCRUM-136). Sin perfil, el formulario; con
 * perfil, el resumen y «Editar perfil».
 */
export function PantallaPerfilProfesional() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href={RUTAS.misDatos}
          className="flex min-h-10 items-center gap-1.5 self-start texto-etiqueta text-marca-profundo hover:underline md:hidden"
        >
          <ArrowLeft className="size-4.5 stroke-[1.75]" aria-hidden />
          Mi cuenta
        </Link>
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          Perfil profesional
        </h1>
      </div>
      <div className="flex max-w-[720px] flex-col gap-6">
        <Contenido />
      </div>
    </>
  );
}

function Contenido() {
  const esProfesional = useEsProfesional();
  const perfil = useMiPerfilProfesional();
  const [editando, setEditando] = useState(false);
  const [recienGuardado, setRecienGuardado] = useState(false);

  // E10-H5, criterio 3: solo con la verificación aprobada (el backend responde 403 a los demás)
  if (!esProfesional) return <SinVerificacion />;
  if (perfil.isPending) return <EsqueletoPerfil />;
  if (perfil.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="texto-cuerpo text-texto-principal">
          {perfil.error.message}
        </p>
        <Button variant="contorno" onClick={() => void perfil.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (perfil.data === null || editando) {
    return (
      <FormularioPerfil
        perfil={perfil.data}
        alGuardar={() => {
          setEditando(false);
          setRecienGuardado(true);
        }}
        alCancelar={perfil.data ? () => setEditando(false) : undefined}
      />
    );
  }
  return (
    <ResumenPerfil
      perfil={perfil.data}
      recienGuardado={recienGuardado}
      alEditar={() => {
        setRecienGuardado(false);
        setEditando(true);
      }}
    />
  );
}

const SinVerificacion = () => (
  <section
    aria-labelledby="titulo-sin-verificacion"
    className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center md:p-6"
  >
    <BadgeCheck
      aria-hidden
      strokeWidth={1.75}
      className="hidden size-7 shrink-0 text-marca-profundo sm:block"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <h2
        id="titulo-sin-verificacion"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        Primero verifica tu cuenta
      </h2>
      <p className="texto-pequeno text-texto-secundario">
        El perfil profesional es para cuentas verificadas.
      </p>
    </div>
    <Button asChild size="grande" className="w-full shrink-0 sm:w-auto">
      <Link href={RUTAS.verificacion}>Verificar mi cuenta</Link>
    </Button>
  </section>
);

/**
 * Con el alto del formulario sin perfil, para que no salte al cargar (RNF-17). En celular las
 * especialidades ocupan más filas de chips.
 */
const EsqueletoPerfil = () => (
  <div
    aria-hidden
    className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:p-6"
  >
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="hidden h-[38px] w-36 rounded-full md:block" />
    </div>
    <Skeleton className="h-4 w-64" />
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((campo) => (
        <div key={campo} className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[51px] w-full rounded-md" />
        </div>
      ))}
    </div>
    <Skeleton className="h-64 w-full sm:h-36" />
    <Skeleton className="h-[560px] w-full sm:h-80" />
    <div className="flex flex-col gap-1.5 sm:w-1/2">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-[51px] w-full rounded-md" />
    </div>
    <Skeleton className="h-14 w-full rounded-full md:hidden" />
  </div>
);
