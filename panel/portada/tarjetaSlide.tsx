'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  EllipsisVertical,
  GripVertical,
  ImageUp,
  Link2,
  Smartphone,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, type ChangeEvent } from 'react';
import { cn } from '@/compartido/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/compartido/ui/alert-dialog';
import { Badge } from '@/compartido/ui/badge';
import { Button } from '@/compartido/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';
import { problemaDelArchivo } from '@/panel/productos/fotosFormato';
import { NOMBRES_TIPO_DESTINO } from '@/tienda/portada/destinoPortada';
import type { SlidePanel, VersionImagen } from './consultasPortada';

interface TarjetaSlideProps {
  slide: SlidePanel;
  numero: number;
  ocupada: boolean;
  alReemplazar: (version: VersionImagen, archivo: File) => void;
  alQuitarCelular: () => void;
  alCambiarDestino: () => void;
  alEliminar: () => void;
  /** Un archivo que no pasa la revisión previa (tipo o peso). */
  alProblema: (mensaje: string) => void;
}

/**
 * Un slide de la portada (SCRUM-157): sus dos imágenes, a dónde lleva y si la tienda lo
 * muestra. Se arrastra desde el asa; el menú cambia una imagen, el destino o lo elimina.
 */
export function TarjetaSlide({
  slide,
  numero,
  ocupada,
  alReemplazar,
  alQuitarCelular,
  alCambiarDestino,
  alEliminar,
  alProblema,
}: TarjetaSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id, disabled: ocupada });
  const archivoEscritorio = useRef<HTMLInputElement>(null);
  const archivoCelular = useRef<HTMLInputElement>(null);
  const [confirmando, setConfirmando] = useState(false);
  const nombre = slide.destino.nombre ?? 'un destino que ya no existe';

  const alElegir =
    (version: VersionImagen) => (evento: ChangeEvent<HTMLInputElement>) => {
      const archivo = evento.target.files?.[0];
      evento.target.value = '';
      if (!archivo) return;
      const problema = problemaDelArchivo(archivo);
      if (problema) {
        alProblema(problema);
        return;
      }
      alReemplazar(version, archivo);
    };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-fondo-superficie p-3 md:gap-4 md:p-4',
        isDragging && 'relative z-10 shadow-tarjeta-elevada',
        !slide.disponible && 'border-estado-aviso-texto/40',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Mover la imagen ${numero}, que lleva a ${nombre}`}
        disabled={ocupada}
        className="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-texto-secundario outline-none hover:bg-fondo-hueso focus-visible:ring-2 focus-visible:ring-marca-profundo active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden strokeWidth={1.75} className="size-5" />
      </button>

      <div className="flex shrink-0 items-end gap-2">
        <div className="relative aspect-[12/5] w-28 overflow-hidden rounded-md bg-marca-acento-suave md:w-48">
          <Image
            src={slide.imagenEscritorio}
            alt=""
            fill
            sizes="(min-width: 768px) 192px, 112px"
            className="object-cover"
          />
        </div>
        <div className="relative hidden aspect-[4/5] w-12 overflow-hidden rounded-md bg-marca-acento-suave sm:block md:w-14">
          {slide.imagenCelular ? (
            <Image
              src={slide.imagenCelular}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <Smartphone
              aria-hidden
              strokeWidth={1.75}
              className="absolute inset-0 m-auto size-4 text-texto-secundario"
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="texto-leyenda text-texto-secundario">
          {NOMBRES_TIPO_DESTINO[slide.destino.tipo]}
        </p>
        <p className="truncate texto-cuerpo-fuerte text-texto-principal">
          {slide.destino.nombre ?? 'Destino eliminado'}
        </p>
        <p className="texto-leyenda text-texto-secundario">
          {slide.imagenCelular
            ? 'Con imagen para celular'
            : 'Celular: usa la de escritorio'}
        </p>
        {!slide.disponible && (
          <Badge className="mt-1 w-fit bg-estado-aviso-fondo text-estado-aviso-texto">
            Destino no disponible: no se muestra en la tienda
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icono"
            disabled={ocupada}
            aria-label={`Acciones de la imagen ${numero}`}
          >
            <EllipsisVertical aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => archivoEscritorio.current?.click()}>
            <ImageUp aria-hidden />
            Cambiar imagen de escritorio
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => archivoCelular.current?.click()}>
            <Smartphone aria-hidden />
            {slide.imagenCelular
              ? 'Cambiar imagen de celular'
              : 'Agregar imagen de celular'}
          </DropdownMenuItem>
          {slide.imagenCelular && (
            <DropdownMenuItem onSelect={alQuitarCelular}>
              <Smartphone aria-hidden />
              Quitar imagen de celular
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={alCambiarDestino}>
            <Link2 aria-hidden />
            Cambiar destino
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmando(true)}
          >
            <Trash2 aria-hidden />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Los menús abren el selector de archivos del sistema */}
      <input
        ref={archivoEscritorio}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Nueva imagen de escritorio de la imagen ${numero}`}
        onChange={alElegir('escritorio')}
      />
      <input
        ref={archivoCelular}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Nueva imagen de celular de la imagen ${numero}`}
        onChange={alElegir('celular')}
      />

      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deja de mostrarse en la portada de la tienda. Esto no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={alEliminar}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
