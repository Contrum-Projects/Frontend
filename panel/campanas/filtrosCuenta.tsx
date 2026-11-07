'use client';

import { ChevronDown, Info } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Chip } from '@/compartido/ui/chip';
import { GENEROS } from '@/tienda/cuenta/esquemaRegistro';
import { CampoNumero } from './campoNumero';
import { useUbicacionesSegmento } from './consultasTerritorio';
import { Elegidas } from './elegidas';
import {
  type FiltroCuenta,
  type FiltroNumero,
  type FormularioCampana,
  filtrosActivos,
} from './esquemaCampana';
import { MensajeError } from './mensajeError';

type Segmento = FormularioCampana['segmento'];

export type ErroresFiltros = Partial<Record<FiltroCuenta, string>>;

interface FiltrosCuentaProps {
  id: string;
  valor: Segmento;
  alCambiar: (segmento: Segmento) => void;
  errores: ErroresFiltros;
}

const MESES = Array.from({ length: 12 }, (_, indice) => ({
  id: indice + 1,
  nombre: new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(
    new Date(2026, indice, 1),
  ),
})).map((mes) => ({
  ...mes,
  nombre: mes.nombre.charAt(0).toUpperCase() + mes.nombre.slice(1),
}));

/**
 * «Más filtros» del segmento (SCRUM-150): compras, ubicación, perfil y cuenta. Cada filtro que se
 * indica acota más; a quién llega de verdad lo calcula el backend. Parte cerrado, salvo que la
 * campaña ya tenga alguno.
 */
export const FiltrosCuenta = ({
  id,
  valor,
  alCambiar,
  errores,
}: FiltrosCuentaProps) => {
  const activos = filtrosActivos(valor);
  const [abierto, setAbierto] = useState(activos > 0);
  const cambiar = <K extends FiltroCuenta>(clave: K, dato: Segmento[K]) =>
    alCambiar({ ...valor, [clave]: dato });
  const numero = (
    clave: FiltroNumero,
    etiqueta: string,
    extra: { sufijo?: string; prefijo?: string } = {},
  ) => (
    <CampoNumero
      id={`${id}-${clave}`}
      etiqueta={etiqueta}
      valor={valor[clave]}
      alCambiar={(dato) => cambiar(clave, dato)}
      error={errores[clave]}
      {...extra}
    />
  );

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={abierto ? `${id}-mas-filtros` : undefined}
        aria-label={
          activos > 0 ? `Más filtros, activos: ${activos}` : undefined
        }
        onClick={() => setAbierto(!abierto)}
        className="inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 rounded-full px-2 texto-etiqueta text-marca-profundo hover:bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-marca-profundo"
      >
        Más filtros
        {activos > 0 && (
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-marca-profundo px-2 texto-leyenda text-texto-sobre-oscuro">
            {activos}
          </span>
        )}
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={cn(
            'size-4 transition-transform motion-reduce:transition-none',
            abierto && 'rotate-180',
          )}
        />
      </button>

      {/* Se monta al abrirse: así las regiones y comunas solo se piden si se usan */}
      {abierto && (
        <div id={`${id}-mas-filtros`} className="flex flex-col gap-6">
          <p className="flex items-start gap-2 texto-leyenda text-texto-secundario">
            <Info aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
            Solo cuentas: los suscriptores sin cuenta no tienen estos datos.
            Cada filtro acota más a quién le llega.
          </p>

          <Grupo titulo="Compras">
            {numero('compraEnUltimosDias', 'Compró en los últimos', {
              sufijo: 'días',
            })}
            {numero('sinComprarHaceDias', 'No compra hace más de', {
              sufijo: 'días',
            })}
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {numero('pedidosMinimo', 'Pedidos: desde')}
              {numero('pedidosMaximo', 'hasta')}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {numero('gastoMinimo', 'Total gastado: desde', { prefijo: '$' })}
              {numero('gastoMaximo', 'hasta', { prefijo: '$' })}
            </div>
          </Grupo>

          <Grupo titulo="Ubicación">
            <Ubicacion
              id={id}
              valor={valor}
              alCambiar={alCambiar}
              errores={errores}
            />
          </Grupo>

          <Grupo titulo="Perfil">
            <div className="flex flex-wrap items-center gap-2">
              <Elegidas
                titulo="Mes de cumpleaños"
                opciones={MESES}
                elegidas={valor.mesesCumpleanos}
                alCambiar={(meses) => cambiar('mesesCumpleanos', meses)}
                error={errores.mesesCumpleanos}
                id={`${id}-meses`}
              />
            </div>
            <MensajeError
              id={`${id}-meses-error`}
              mensaje={errores.mesesCumpleanos}
            />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {numero('edadMinima', 'Edad: desde', { sufijo: 'años' })}
              {numero('edadMaxima', 'hasta', { sufijo: 'años' })}
            </div>
            <div
              role="group"
              aria-label="Género"
              className="flex flex-wrap items-center gap-2"
            >
              <span className="texto-pequeno text-texto-principal">
                Género:
              </span>
              {GENEROS.map((genero) => (
                <Chip
                  key={genero}
                  type="checkbox"
                  checked={valor.generos.includes(genero)}
                  onChange={(evento) =>
                    cambiar(
                      'generos',
                      evento.target.checked
                        ? [...valor.generos, genero]
                        : valor.generos.filter((g) => g !== genero),
                    )
                  }
                >
                  {genero}
                </Chip>
              ))}
            </div>
            <MensajeError
              id={`${id}-generos-error`}
              mensaje={errores.generos}
            />
          </Grupo>

          <Grupo titulo="Cuenta">
            {numero('registroUltimosDias', 'Creada en los últimos', {
              sufijo: 'días',
            })}
            {numero('registroHaceMasDias', 'Creada hace más de', {
              sufijo: 'días',
            })}
            <div>
              <Chip
                type="checkbox"
                checked={valor.conCarrito}
                onChange={(evento) =>
                  cambiar('conCarrito', evento.target.checked)
                }
              >
                Con productos en el carrito
              </Chip>
            </div>
          </Grupo>
        </div>
      )}
    </div>
  );
};

const Grupo = ({
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
const Ubicacion = ({ id, valor, alCambiar, errores }: FiltrosCuentaProps) => {
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
