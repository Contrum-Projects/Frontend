'use client';

import { Camera } from 'lucide-react';
import Image from 'next/image';
import { useId, useState, type ChangeEvent } from 'react';
import type { FormatoPanel, ImagenPanel } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { PanelLateral } from '@/panel/catalogo/panelLateral';
import {
  useFormatos,
  useOrdenarFotos,
  useQuitarFoto,
  useSubirFoto,
} from './consultasProductos';
import { GaleriaFotos } from './galeriaFotos';

/** Fotos que se ven en la fila o la tarjeta del formato; el resto, al gestionar. */
const MINIATURAS_VISIBLES = 3;

/**
 * Límites que documenta el backend para subir una foto (Swagger de POST
 * /api/catalogo/articulos/{id}/imagenes). Se revisan antes de enviar para no mandar un archivo
 * que será rechazado; el backend los vuelve a revisar (el tipo, por el contenido).
 */
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024;

/** El mismo mensaje que responde el backend, o `null` si el archivo se puede enviar. */
const problemaDelArchivo = (archivo: File) => {
  if (!TIPOS_FOTO.includes(archivo.type)) {
    return 'La imagen debe ser JPEG, PNG o WebP.';
  }
  if (archivo.size > TAMANO_MAXIMO_FOTO) {
    return 'La imagen no puede superar los 5 MB.';
  }
  return null;
};

const textoCantidad = (cantidad: number) =>
  cantidad === 1 ? '1 foto' : `${cantidad} fotos`;

/** Las primeras fotos del formato, con la principal marcada (Figma P3 2029:777 y 2031:4345). */
const Miniaturas = ({ formato }: { formato: FormatoPanel }) => (
  <span aria-hidden className="flex shrink-0 gap-2">
    {formato.imagenes.slice(0, MINIATURAS_VISIBLES).map((imagen) => (
      <span
        key={imagen.id}
        className={cn(
          'relative size-9 overflow-hidden rounded-sm bg-marca-acento-suave',
          imagen.esPrincipal && 'ring-2 ring-marca-profundo',
        )}
      >
        <Image
          src={imagen.url}
          alt=""
          fill
          sizes="36px"
          className="object-cover"
        />
      </span>
    ))}
  </span>
);

interface ResumenFotosProps {
  formato: FormatoPanel;
  alGestionar: () => void;
}

/** Columna «Fotos» de la tabla de escritorio: las miniaturas abren el panel de fotos. */
export const ResumenFotosTabla = ({
  formato,
  alGestionar,
}: ResumenFotosProps) => {
  const cantidad = formato.imagenes.length;
  if (cantidad === 0) {
    return (
      <Button
        variant="link"
        className="px-0 texto-pequeno"
        aria-label={`Agregar fotos a ${formato.nombreFormato}`}
        onClick={alGestionar}
      >
        Agregar
      </Button>
    );
  }
  return (
    <button
      type="button"
      className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
      aria-label={`${textoCantidad(cantidad)} de ${formato.nombreFormato}. Gestionar fotos`}
      onClick={alGestionar}
    >
      <Miniaturas formato={formato} />
    </button>
  );
};

/** Tarjeta de celular: miniaturas y «3 fotos · Gestionar» (Figma P3 2031:4345). */
export const ResumenFotosTarjeta = ({
  formato,
  alGestionar,
}: ResumenFotosProps) => {
  const cantidad = formato.imagenes.length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Miniaturas formato={formato} />
      <Button
        variant="link"
        className="min-h-10 px-0 texto-etiqueta"
        onClick={alGestionar}
      >
        {cantidad === 0
          ? 'Sin fotos · Agregar'
          : `${textoCantidad(cantidad)} · Gestionar`}
        {/* El espacio va fuera del span: dentro se pierde en el nombre accesible */}{' '}
        <span className="sr-only">fotos de {formato.nombreFormato}</span>
      </Button>
    </div>
  );
};

/** Panel lateral con las fotos de un formato (E3-H3). */
export function PanelFotos({
  productoId,
  formatoId,
  alCerrar,
}: {
  productoId: number;
  /** El formato cuyas fotos se gestionan, o `null` con el panel cerrado. */
  formatoId: number | null;
  alCerrar: () => void;
}) {
  const formato = useFormatos(productoId).data?.find(
    (candidato) => candidato.id === formatoId,
  );
  return (
    <PanelLateral
      titulo={formato ? `Fotos de ${formato.nombreFormato}` : 'Fotos'}
      abierto={formatoId !== null}
      alCambiarAbierto={(abierto) => {
        if (!abierto) alCerrar();
      }}
    >
      {formato && (
        <FotosDelFormato
          key={formato.id}
          productoId={productoId}
          formato={formato}
        />
      )}
    </PanelLateral>
  );
}

const FotosDelFormato = ({
  productoId,
  formato,
}: {
  productoId: number;
  formato: FormatoPanel;
}) => {
  const subir = useSubirFoto(productoId, formato.id);
  const ordenar = useOrdenarFotos(productoId, formato.id);
  const quitar = useQuitarFoto(productoId, formato.id);
  return (
    <GestorFotos
      imagenes={formato.imagenes}
      nombre={formato.nombreFormato}
      articulo="formato"
      subir={subir}
      ordenar={ordenar}
      quitar={quitar}
    />
  );
};

/** Lo que el gestor necesita de las consultas de fotos de un formato o de un pack. */
interface AccionesFotos {
  subir: {
    isPending: boolean;
    mutate: (
      archivo: File,
      opciones: { onError: (fallo: Error) => void },
    ) => void;
  };
  ordenar: {
    isPending: boolean;
    ordenar: (
      imagenes: ImagenPanel[],
      principalId: number,
      alFallar: (fallo: Error) => void,
    ) => void;
  };
  quitar: {
    isPending: boolean;
    mutate: (
      imagenId: number,
      opciones: { onError: (fallo: Error) => void },
    ) => void;
  };
}

/**
 * Galería con «Agregar foto» y sus avisos (E3-H3), para las fotos de un formato o de un pack
 * (E3-H6). `articulo` nombra de quién son las fotos en los avisos.
 */
export function GestorFotos({
  imagenes,
  nombre,
  articulo,
  subir,
  ordenar,
  quitar,
}: AccionesFotos & {
  imagenes: ImagenPanel[];
  nombre: string;
  articulo: 'formato' | 'pack';
}) {
  const [aviso, setAviso] = useState<string | null>(null);
  const alFallar = (fallo: Error) => setAviso(fallo.message);
  const ocupada = subir.isPending || ordenar.isPending || quitar.isPending;
  const idAgregar = useId();

  const alElegirArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    // Se limpia para poder volver a elegir el mismo archivo si falló
    evento.target.value = '';
    if (!archivo) return;
    setAviso(problemaDelArchivo(archivo));
    if (problemaDelArchivo(archivo)) return;
    subir.mutate(archivo, { onError: alFallar });
  };

  return (
    <div className="flex flex-col gap-4">
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <GaleriaFotos
        imagenes={imagenes}
        nombreFormato={nombre}
        ocupada={ocupada}
        alOrdenar={(nuevas, principalId) => {
          setAviso(null);
          ordenar.ordenar(nuevas, principalId, alFallar);
        }}
        alQuitar={(imagen) => {
          setAviso(null);
          quitar.mutate(imagen.id, { onError: alFallar });
        }}
        idAgregar={idAgregar}
      >
        <li className="flex flex-col gap-2">
          <label
            className={cn(
              'flex aspect-4/3 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-texto-secundario texto-etiqueta text-marca-profundo focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-marca-profundo hover:bg-marca-acento-suave',
              subir.isPending && 'cursor-wait',
              ocupada && !subir.isPending && 'pointer-events-none opacity-50',
            )}
          >
            {subir.isPending ? (
              <Spinner aria-hidden />
            ) : (
              <Camera aria-hidden className="size-5" />
            )}
            <span aria-live="polite">
              {subir.isPending ? 'Subiendo…' : 'Agregar foto'}
            </span>
            <input
              id={idAgregar}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={ocupada}
              onChange={alElegirArchivo}
            />
          </label>
        </li>
      </GaleriaFotos>
      <p className="texto-leyenda text-texto-secundario">
        {imagenes.length === 0
          ? `Este ${articulo} aún no tiene fotos. La primera que subas queda como principal.`
          : 'Arrastra para cambiar el orden. La principal se muestra en el catálogo.'}
      </p>
      {imagenes.length === 1 && (
        <p className="texto-leyenda text-texto-secundario">
          El {articulo} necesita al menos una foto: sube otra antes de quitar
          esta.
        </p>
      )}
    </div>
  );
}
