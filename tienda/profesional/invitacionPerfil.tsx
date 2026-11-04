'use client';

import { UserRoundPen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useEsProfesional } from './consultasProfesional';
import { useMiPerfilProfesional } from './consultasPerfil';

/**
 * «Completa tu perfil profesional» (E10-H4, criterio 2). Figma no la tiene: el texto viene del
 * encabezado de 08c Perfil profesional (2038:2666). Solo para la cuenta profesional que aún no
 * completa el perfil. Mientras carga reserva su alto, así el resto de la pantalla no salta
 * (RNF-17); si la consulta falla no se muestra, porque es un aviso secundario.
 */
export const InvitacionPerfil = () => {
  const esProfesional = useEsProfesional();
  const perfil = useMiPerfilProfesional();
  if (!esProfesional) return null;
  if (perfil.isPending) {
    return <Skeleton aria-hidden className="h-48 w-full rounded-lg sm:h-24" />;
  }
  if (!perfil.isSuccess || perfil.data !== null) return null;

  return (
    <section
      aria-labelledby="titulo-invitacion-perfil"
      className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-center"
    >
      <UserRoundPen
        aria-hidden
        strokeWidth={1.75}
        className="hidden size-7 shrink-0 text-marca-profundo sm:block"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2
          id="titulo-invitacion-perfil"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Completa tu perfil profesional
        </h2>
        <p className="texto-pequeno text-texto-secundario">
          Nos ayuda a mostrarte productos y ofertas para tu trabajo.
        </p>
      </div>
      <Button asChild size="grande" className="w-full shrink-0 sm:w-auto">
        <Link href={RUTAS.perfilProfesional}>Completar perfil</Link>
      </Button>
    </section>
  );
};
