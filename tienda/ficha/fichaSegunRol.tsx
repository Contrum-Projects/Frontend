'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { PackDetalle, ProductoDetalle } from '@/compartido/api/respuestas';
import { useSesion } from '@/compartido/sesion/sesion';
import {
  useEsProfesional,
  usePackProfesional,
  useProductoProfesional,
} from '@/tienda/profesional/consultasProfesional';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { leerId } from './idFicha';
import { InfoPack } from './infoPack';
import { InfoProducto } from './infoProducto';
import { EsqueletoFicha } from './partesFicha';

/**
 * La ficha según quién la mira (SCRUM-109). El servidor la arma como visitante; con una cuenta
 * profesional se vuelve a pedir con su token para mostrar el mayorista. Mientras no se sabe
 * quién es, se ve la del servidor (decisión del 30-10-2026).
 */
export function FichaProductoSegunRol({
  producto,
}: {
  producto: ProductoDetalle;
}) {
  const esProfesional = useEsProfesional();
  const consulta = useProductoProfesional(producto.id);
  const publica = <InfoProducto producto={producto} />;
  if (!esProfesional) return publica;
  return (
    <VistaProfesional consulta={consulta} sinDatos={publica}>
      {(datos) => <InfoProducto producto={datos} />}
    </VistaProfesional>
  );
}

export function FichaPackSegunRol({ pack }: { pack: PackDetalle }) {
  const esProfesional = useEsProfesional();
  const consulta = usePackProfesional(pack.id);
  const publica = <InfoPack pack={pack} />;
  if (!esProfesional) return publica;
  return (
    <VistaProfesional consulta={consulta} sinDatos={publica}>
      {(datos) => <InfoPack pack={datos} />}
    </VistaProfesional>
  );
}

/**
 * Para el not-found de la ficha: un exclusivo responde 404 al servidor (que pide como visitante),
 * así que con una cuenta profesional se pide desde el navegador. Si tampoco existe para ella, o
 * no es profesional, se ve `noEncontrado`.
 */
export function ProductoExclusivo({
  noEncontrado,
}: {
  noEncontrado: ReactNode;
}) {
  const id = useIdDeLaRuta();
  const consulta = useProductoProfesional(id ?? 0, id !== null);
  return (
    <Exclusivo id={id} consulta={consulta} noEncontrado={noEncontrado}>
      {(datos) => <InfoProducto producto={datos} />}
    </Exclusivo>
  );
}

export function PackExclusivo({ noEncontrado }: { noEncontrado: ReactNode }) {
  const id = useIdDeLaRuta();
  const consulta = usePackProfesional(id ?? 0, id !== null);
  return (
    <Exclusivo id={id} consulta={consulta} noEncontrado={noEncontrado}>
      {(datos) => <InfoPack pack={datos} />}
    </Exclusivo>
  );
}

/** El not-found no recibe props: el id sale de la URL (`/productos/12`). */
const useIdDeLaRuta = () => leerId(usePathname().split('/').at(-1) ?? '');

function Exclusivo<T>({
  id,
  consulta,
  noEncontrado,
  children,
}: {
  id: number | null;
  consulta: UseQueryResult<T | null>;
  noEncontrado: ReactNode;
  children: (datos: T) => ReactNode;
}) {
  const { estado } = useSesion();
  const esProfesional = useEsProfesional();
  if (estado === 'desconocida' && id !== null) return <EsqueletoFicha />;
  if (!esProfesional || id === null) return noEncontrado;
  return (
    <VistaProfesional consulta={consulta} sinDatos={noEncontrado}>
      {children}
    </VistaProfesional>
  );
}

function VistaProfesional<T>({
  consulta,
  sinDatos,
  children,
}: {
  consulta: UseQueryResult<T | null>;
  /** Si el backend responde 404 también al profesional. */
  sinDatos: ReactNode;
  children: (datos: T) => ReactNode;
}) {
  if (consulta.isPending) return <EsqueletoFicha />;
  if (consulta.isError) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 py-12 md:px-16">
        <ErrorProfesional
          mensaje={consulta.error.message}
          onReintentar={() => void consulta.refetch()}
        />
      </main>
    );
  }
  if (consulta.data === null) return sinDatos;
  return children(consulta.data);
}
