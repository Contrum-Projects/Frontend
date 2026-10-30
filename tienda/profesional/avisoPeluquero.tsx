'use client';

import { ArrowRight, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { MINIMO_PROFESIONAL } from './precio';

/**
 * «¿Eres peluquero?» bajo la compra (Figma › 03 Ficha 2007:767): lleva a solicitar la
 * verificación (SCRUM-109 criterio 3). Para visitantes y clientes. Mientras no se sabe quién
 * mira también se muestra, como el resto de la ficha del servidor, así no empuja la descripción
 * al llegar (para el peluquero, la ficha entera pasa a su esqueleto).
 */
export const AvisoPeluquero = () => {
  const { estado, usuario } = useSesion();
  const puedeVerificarse =
    estado !== 'activa' || usuario?.rol === ROLES.CLIENTE;
  if (!puedeVerificarse) return null;

  return (
    <aside
      aria-labelledby="titulo-aviso-peluquero"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-marca-acento-suave px-4 py-4 md:flex-nowrap md:px-6"
    >
      <BadgeCheck
        aria-hidden
        strokeWidth={1.75}
        className="size-7 shrink-0 text-marca-profundo"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2
          id="titulo-aviso-peluquero"
          className="texto-cuerpo-fuerte text-marca-profundo"
        >
          ¿Eres peluquero?
        </h2>
        <p className="texto-pequeno text-texto-principal">
          Verifica tu cuenta y compra este producto a precio profesional, desde{' '}
          {MINIMO_PROFESIONAL} unidades.
        </p>
      </div>
      <Link
        href={RUTAS.verificacion}
        className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md texto-etiqueta text-marca-profundo hover:underline"
      >
        Verificar
        <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
      </Link>
    </aside>
  );
};
