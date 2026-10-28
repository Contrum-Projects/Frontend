'use client';

import Link from 'next/link';
import { Logo } from '@/compartido/marca/logo';
import { cn } from '@/compartido/lib/utils';
import { useSesion } from '@/compartido/sesion/sesion';
import { AvatarPanel, nombreCompleto } from './usuarioPanel';

/** Barra superior del panel en celular (Figma › Panel/Barra superior 2022:172). */
export function BarraSuperior({ className }: { className?: string }) {
  const { usuario } = useSesion();
  if (!usuario) return null;

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between bg-marca-profundo px-4',
        className,
      )}
    >
      <Link
        href="/panel"
        className="rounded-md text-marca-logo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-logo"
      >
        <Logo titulo="Cabello Perfecto · Panel" className="h-auto w-[74px]" />
      </Link>
      <AvatarPanel persona={usuario} />
      <span className="sr-only">{nombreCompleto(usuario)}</span>
    </header>
  );
}
