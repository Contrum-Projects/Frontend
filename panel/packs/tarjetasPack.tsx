'use client';

import { BadgeDollarSign } from 'lucide-react';
import { useId, useState } from 'react';
import type { PackPanel, TipoPrecio } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { PERMISOS, tienePermiso } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Button } from '@/compartido/ui/button';
import { usePrecios } from '@/panel/productos/consultasPrecios';
import { GestorFotos } from '@/panel/productos/fotosFormato';
import { PanelPrecios } from '@/panel/productos/formularioPrecios';
import { Tarjeta } from '@/panel/productos/formularioProducto';
import {
  CeldaPrecio,
  type ConsultaPrecios,
} from '@/panel/productos/preciosFormato';
import { nombreDelFormato } from './buscadorFormatos';
import {
  clavePreciosPack,
  useOrdenarFotosPack,
  useQuitarFotoPack,
  useSubirFotoPack,
} from './consultasPacks';

const GUARDAR_PRIMERO = 'Guarda el pack para agregar fotos y precios.';

/** Comodidad: el backend responde 403 a quien no tiene el permiso `precios.gestionar`. */
export const useGestionaPrecios = () =>
  tienePermiso(useSesion().usuario?.rol, PERMISOS.PRECIOS_GESTIONAR);

/** «Fotos del pack» (Figma P3c 2065:2475): las del artículo del pack, no las de sus formatos. */
export function FotosPack({ pack }: { pack?: PackPanel }) {
  return (
    <Tarjeta titulo="Fotos del pack">
      {pack ? (
        <FotosDelPack pack={pack} />
      ) : (
        <p className="texto-pequeno text-texto-secundario">{GUARDAR_PRIMERO}</p>
      )}
    </Tarjeta>
  );
}

const FotosDelPack = ({ pack }: { pack: PackPanel }) => {
  const subir = useSubirFotoPack(pack.id);
  const ordenar = useOrdenarFotosPack(pack.id);
  const quitar = useQuitarFotoPack(pack.id);
  return (
    <GestorFotos
      imagenes={pack.imagenes}
      nombre={pack.nombre}
      articulo="pack"
      subir={subir}
      ordenar={ordenar}
      quitar={quitar}
    />
  );
};

/**
 * «Precios del pack» (Figma P3c 2065:2641, E3-H6 criterio 3): los netos vigentes con su valor con
 * IVA, que entrega el backend, y lo que costarían los componentes por separado. Se fijan en el
 * panel de precios de E3-H5. Solo con el permiso `precios.gestionar`.
 */
export function PreciosPack({ pack }: { pack?: PackPanel }) {
  if (!useGestionaPrecios()) return null;
  return (
    <Tarjeta titulo="Precios del pack">
      {pack ? (
        <PreciosDelPack pack={pack} />
      ) : (
        <p className="texto-pequeno text-texto-secundario">{GUARDAR_PRIMERO}</p>
      )}
    </Tarjeta>
  );
}

const PreciosDelPack = ({ pack }: { pack: PackPanel }) => {
  const clave = clavePreciosPack(pack.id);
  const precios = usePrecios(clave, pack.id);
  const [fijando, setFijando] = useState(false);
  const porSeparado = pack.precioMinoristaPorSeparadoConIva;
  return (
    <>
      <dl className="grid grid-cols-2 gap-3">
        <Precio etiqueta="Minorista neto" consulta={precios} tipo="minorista" />
        <Precio etiqueta="Mayorista neto" consulta={precios} tipo="mayorista" />
      </dl>
      {typeof porSeparado === 'number' && (
        <p className="texto-pequeno text-texto-secundario">
          Por separado, con IVA: {formatearPesos(porSeparado)}.
        </p>
      )}
      {pack.canalVenta === 'profesional' && (
        <p className="texto-pequeno text-texto-secundario">
          Un pack exclusivo para profesionales solo lleva el precio mayorista.
        </p>
      )}
      <Button
        type="button"
        variant="contorno"
        className="self-start max-lg:min-h-10"
        onClick={() => setFijando(true)}
      >
        <BadgeDollarSign aria-hidden />
        Fijar precios
      </Button>
      <PanelPrecios
        clave={clave}
        articulo={
          fijando ? { id: pack.id, nombre: pack.nombre, tipo: 'pack' } : null
        }
        alCerrar={() => setFijando(false)}
      />
    </>
  );
};

const Precio = ({
  etiqueta,
  consulta,
  tipo,
}: {
  etiqueta: string;
  consulta: ConsultaPrecios;
  tipo: TipoPrecio;
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <dt className="texto-etiqueta text-texto-principal">{etiqueta}</dt>
    <dd>
      <CeldaPrecio consulta={consulta} tipo={tipo} />
    </dd>
  </div>
);

const unidades = (cantidad: number) =>
  cantidad === 1 ? '1 unidad' : `${cantidad} unidades`;

/**
 * «Disponibilidad en la tienda» (Figma P3c 2065:2499, E3-H6 criterio 3): la del componente más
 * escaso. La calcula el backend; el panel solo la muestra.
 */
export function DisponibilidadPack({ pack }: { pack?: PackPanel }) {
  const idTitulo = useId();
  const limitante = pack?.componentes.find(
    (componente) =>
      componente.formatoId === pack.componenteLimitante?.formatoId,
  );
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-3 rounded-lg bg-marca-acento-suave p-4"
    >
      <h2 id={idTitulo} className="texto-cuerpo-fuerte text-texto-principal">
        Disponibilidad en la tienda
      </h2>
      {pack?.disponibilidad !== undefined && (
        <p className="texto-precio text-texto-principal tabular-nums">
          {pack.disponibilidad === 1
            ? '1 pack'
            : `${pack.disponibilidad} packs`}
        </p>
      )}
      <p className="texto-pequeno text-texto-secundario">
        {limitante && pack?.componenteLimitante
          ? `Limitada por ${nombreDelFormato(limitante)}, que tiene ${unidades(pack.componenteLimitante.stockTotal)}. `
          : ''}
        {pack
          ? 'Se recalcula con el stock de cada componente; el pack no tiene stock propio.'
          : 'Se calcula al guardar, con el stock de cada componente; el pack no tiene stock propio.'}
      </p>
    </section>
  );
}
