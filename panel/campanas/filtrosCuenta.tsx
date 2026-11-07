'use client';

import { ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Chip } from '@/compartido/ui/chip';
import { CampoNumero } from './campoNumero';
import {
  type FiltroCuenta,
  type FiltroNumero,
  type FormularioCampana,
  filtrosActivos,
} from './esquemaCampana';
import {
  FiltroPerfil,
  FiltroUbicacion,
  Grupo,
  type PropsFiltros,
} from './gruposFiltros';

export type { ErroresFiltros } from './gruposFiltros';

type Segmento = FormularioCampana['segmento'];

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
}: PropsFiltros) => {
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
            <FiltroUbicacion
              id={id}
              valor={valor}
              alCambiar={alCambiar}
              errores={errores}
            />
          </Grupo>

          <FiltroPerfil
            id={id}
            valor={valor}
            alCambiar={alCambiar}
            errores={errores}
          />

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
