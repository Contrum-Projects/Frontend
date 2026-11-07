'use client';

import type { ReactNode } from 'react';
import { Chip } from '@/compartido/ui/chip';
import { Skeleton } from '@/compartido/ui/skeleton';
import { GENEROS } from '@/tienda/cuenta/esquemaRegistro';
import { CampoNumero } from './campoNumero';
import { useUbicacionesSegmento } from './consultasTerritorio';
import { Elegidas } from './elegidas';
import type { FiltroCuenta, FormularioCampana } from './esquemaCampana';
import { MensajeError } from './mensajeError';

type Segmento = FormularioCampana['segmento'];

export type ErroresFiltros = Partial<Record<FiltroCuenta, string>>;

export interface PropsFiltros {
  id: string;
  valor: Segmento;
  alCambiar: (segmento: Segmento) => void;
  errores: ErroresFiltros;
}

const MESES = Array.from({ length: 12 }, (_, indice) => {
  const nombre = new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(
    new Date(2026, indice, 1),
  );
  return {
    id: indice + 1,
    nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
  };
});

/** Un grupo de «Más filtros» con su título (Compras, Ubicación, Perfil, Cuenta). */
export const Grupo = ({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) => (
  <section aria-label={titulo} className="flex flex-col gap-3">
    <h3 className="texto-etiqueta text-texto-principal">{titulo}</h3>
    {children}
  </section>
);

/** Regiones y comunas de las direcciones guardadas, por su código CUT. */
export const FiltroUbicacion = ({
  id,
  valor,
  alCambiar,
  errores,
}: PropsFiltros) => {
  const ubicaciones = useUbicacionesSegmento();
  if (ubicaciones.error) {
    return (
      <MensajeError id={`${id}-ubicacion-error`} mensaje={ubicaciones.error} />
    );
  }
  if (ubicaciones.cargando) {
    return (
      <div aria-hidden className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    );
  }
  return (
    <>
      <p className="texto-pequeno text-texto-secundario">
        Con una dirección guardada en:
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Elegidas
          titulo="Región"
          opciones={ubicaciones.regiones}
          elegidas={valor.regiones}
          alCambiar={(regiones) => alCambiar({ ...valor, regiones })}
          error={errores.regiones}
          id={`${id}-regiones`}
        />
        <Elegidas
          titulo="Comuna"
          opciones={ubicaciones.comunas}
          elegidas={valor.comunas}
          alCambiar={(comunas) => alCambiar({ ...valor, comunas })}
          error={errores.comunas}
          id={`${id}-comunas`}
        />
      </div>
      <MensajeError id={`${id}-regiones-error`} mensaje={errores.regiones} />
      <MensajeError id={`${id}-comunas-error`} mensaje={errores.comunas} />
    </>
  );
};

/** Mes de cumpleaños, edad y género (la lista del registro, decisión del 26-10-2026). */
export const FiltroPerfil = ({
  id,
  valor,
  alCambiar,
  errores,
}: PropsFiltros) => (
  <Grupo titulo="Perfil">
    <div className="flex flex-wrap items-center gap-2">
      <Elegidas
        titulo="Mes de cumpleaños"
        opciones={MESES}
        elegidas={valor.mesesCumpleanos}
        alCambiar={(mesesCumpleanos) =>
          alCambiar({ ...valor, mesesCumpleanos })
        }
        error={errores.mesesCumpleanos}
        id={`${id}-meses`}
      />
    </div>
    <MensajeError id={`${id}-meses-error`} mensaje={errores.mesesCumpleanos} />
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      <CampoNumero
        id={`${id}-edadMinima`}
        etiqueta="Edad: desde"
        sufijo="años"
        valor={valor.edadMinima}
        alCambiar={(edadMinima) => alCambiar({ ...valor, edadMinima })}
        error={errores.edadMinima}
      />
      <CampoNumero
        id={`${id}-edadMaxima`}
        etiqueta="hasta"
        sufijo="años"
        valor={valor.edadMaxima}
        alCambiar={(edadMaxima) => alCambiar({ ...valor, edadMaxima })}
        error={errores.edadMaxima}
      />
    </div>
    <div
      role="group"
      aria-label="Género"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="texto-pequeno text-texto-principal">Género:</span>
      {GENEROS.map((genero) => (
        <Chip
          key={genero}
          type="checkbox"
          checked={valor.generos.includes(genero)}
          onChange={(evento) =>
            alCambiar({
              ...valor,
              generos: evento.target.checked
                ? [...valor.generos, genero]
                : valor.generos.filter((g) => g !== genero),
            })
          }
        >
          {genero}
        </Chip>
      ))}
    </div>
    <MensajeError id={`${id}-generos-error`} mensaje={errores.generos} />
  </Grupo>
);
