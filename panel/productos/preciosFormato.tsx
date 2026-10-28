import type { UseQueryResult } from '@tanstack/react-query';
import type { PreciosArticulo, TipoPrecio } from '@/compartido/api/respuestas';
import {
  formatearPesos,
  formatearPesosNetos,
} from '@/compartido/formato/moneda';
import { Skeleton } from '@/compartido/ui/skeleton';

export type ConsultaPrecios = UseQueryResult<PreciosArticulo, Error>;

type Precio =
  | { estado: 'cargando' | 'error' | 'exclusivo' | 'sin-precio' }
  | { estado: 'listo'; neto: number; conIva: number | null };

/** El precio de un tipo tal como llegó del backend; el panel no calcula nada. */
const leerPrecio = (consulta: ConsultaPrecios, tipo: TipoPrecio): Precio => {
  if (consulta.isPending) return { estado: 'cargando' };
  if (consulta.isError) return { estado: 'error' };
  const precios = consulta.data;
  if (tipo === 'minorista' && precios.exclusivo) return { estado: 'exclusivo' };
  const neto =
    tipo === 'minorista'
      ? precios.precioMinoristaNeto
      : precios.precioMayoristaNeto;
  if (neto === null) return { estado: 'sin-precio' };
  const conIva =
    tipo === 'minorista'
      ? precios.precioMinoristaConIva
      : precios.precioMayoristaConIva;
  return { estado: 'listo', neto, conIva: conIva ?? null };
};

const TEXTOS = {
  error: 'No se pudo cargar',
  exclusivo: 'Exclusivo',
  'sin-precio': 'Sin precio',
} as const;

/** Escritorio (Figma P3 2029:777): neto arriba y «con IVA» abajo. */
export const CeldaPrecio = ({
  consulta,
  tipo,
}: {
  consulta: ConsultaPrecios;
  tipo: TipoPrecio;
}) => {
  const precio = leerPrecio(consulta, tipo);
  if (precio.estado === 'cargando') {
    return <Skeleton aria-hidden className="h-9 w-24" />;
  }
  if (precio.estado !== 'listo') {
    return (
      <span className="texto-leyenda text-texto-secundario">
        {TEXTOS[precio.estado]}
      </span>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="texto-pequeno text-texto-principal tabular-nums">
        {formatearPesosNetos(precio.neto)}
      </span>
      {precio.conIva !== null && (
        <span className="texto-leyenda text-texto-secundario tabular-nums">
          con IVA {formatearPesos(precio.conIva)}
        </span>
      )}
    </div>
  );
};

/** Celular (Figma P3 2024:565): «$10.916 (con IVA $12.990)». */
export const textoPrecio = (
  consulta: ConsultaPrecios,
  tipo: TipoPrecio,
): string => {
  const precio = leerPrecio(consulta, tipo);
  if (precio.estado === 'cargando') return 'Cargando';
  if (precio.estado !== 'listo') return TEXTOS[precio.estado];
  const neto = formatearPesosNetos(precio.neto);
  return precio.conIva === null
    ? neto
    : `${neto} (con IVA ${formatearPesos(precio.conIva)})`;
};
