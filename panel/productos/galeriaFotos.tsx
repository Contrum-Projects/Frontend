'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EllipsisVertical, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, type ReactNode } from 'react';
import type { ImagenPanel } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';

interface GaleriaFotosProps {
  imagenes: ImagenPanel[];
  nombreFormato: string;
  /** Mientras se guarda un cambio no se puede arrastrar ni elegir otra acción. */
  ocupada: boolean;
  alOrdenar: (imagenes: ImagenPanel[], principalId: number) => void;
  alQuitar: (imagen: ImagenPanel) => void;
  /** Id del campo «Agregar foto»: recibe el foco cuando se quita una foto. */
  idAgregar: string;
  /** La casilla «Agregar foto», al final de la grilla. */
  children: ReactNode;
}

/** Posición de la foto para leer en voz alta: «foto 2 de 3». */
const posicion = (imagenes: ImagenPanel[], id: number | string) =>
  `foto ${imagenes.findIndex((imagen) => imagen.id === id) + 1} de ${imagenes.length}`;

/**
 * Fotos del formato (Figma P3 2031:975, E3-H3 criterio 2). Se arrastran con el mouse, el dedo
 * (manteniendo presionado, así la página sigue desplazándose) o el teclado (espacio y flechas).
 */
export function GaleriaFotos({
  imagenes,
  nombreFormato,
  ocupada,
  alOrdenar,
  alQuitar,
  idAgregar,
  children,
}: GaleriaFotosProps) {
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const principal = imagenes.find((imagen) => imagen.esPrincipal);

  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const desde = imagenes.findIndex((imagen) => imagen.id === active.id);
    const hasta = imagenes.findIndex((imagen) => imagen.id === over.id);
    alOrdenar(
      arrayMove(imagenes, desde, hasta),
      principal?.id ?? imagenes[0].id,
    );
  };

  const anuncios: Announcements = {
    onDragStart: ({ active }) => `Tomaste la ${posicion(imagenes, active.id)}.`,
    onDragOver: ({ over }) =>
      over ? `Sobre la posición de la ${posicion(imagenes, over.id)}.` : '',
    onDragEnd: ({ over }) =>
      over
        ? `Dejaste la foto en la posición ${posicion(imagenes, over.id).replace('foto ', '')}.`
        : 'La foto volvió a su lugar.',
    onDragCancel: () => 'Cancelaste el cambio de orden.',
  };

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={closestCenter}
      onDragEnd={alSoltar}
      accessibility={{
        announcements: anuncios,
        screenReaderInstructions: {
          draggable:
            'Para mover la foto, presiona espacio, usa las flechas y vuelve a presionar espacio para dejarla. Escape cancela.',
        },
      }}
    >
      <SortableContext
        items={imagenes.map((imagen) => imagen.id)}
        strategy={rectSortingStrategy}
      >
        <ul className="grid grid-cols-2 gap-3">
          {imagenes.map((imagen, indice) => (
            <FotoOrdenable
              key={imagen.id}
              imagen={imagen}
              numero={indice + 1}
              nombreFormato={nombreFormato}
              esUnica={imagenes.length === 1}
              ocupada={ocupada}
              idAgregar={idAgregar}
              alMarcarPrincipal={() => alOrdenar(imagenes, imagen.id)}
              alQuitar={() => alQuitar(imagen)}
            />
          ))}
          {children}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

interface FotoOrdenableProps {
  imagen: ImagenPanel;
  numero: number;
  nombreFormato: string;
  esUnica: boolean;
  ocupada: boolean;
  idAgregar: string;
  alMarcarPrincipal: () => void;
  alQuitar: () => void;
}

/** Una foto: se arrastra desde la imagen; el menú marca la principal o la quita. */
const FotoOrdenable = ({
  imagen,
  numero,
  nombreFormato,
  esUnica,
  ocupada,
  idAgregar,
  alMarcarPrincipal,
  alQuitar,
}: FotoOrdenableProps) => {
  // Al quitarla, esta foto desaparece: el foco va a «Agregar foto» y no se pierde en la página
  const quitada = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imagen.id, disabled: ocupada });
  const nombre = `Foto ${numero} de ${nombreFormato}`;

  return (
    <li
      ref={setNodeRef}
      // dnd-kit mueve la foto con transform en línea: no hay clase de Tailwind para eso
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex min-w-0 flex-col gap-2', isDragging && 'z-10')}
    >
      <div className="relative">
        <div
          {...attributes}
          {...listeners}
          aria-roledescription="foto que se puede mover"
          aria-label={`${nombre}${imagen.esPrincipal ? ', principal' : ''}`}
          className={cn(
            'relative aspect-4/3 cursor-grab touch-manipulation overflow-hidden rounded-md bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo',
            imagen.esPrincipal && 'ring-2 ring-marca-profundo',
            isDragging && 'cursor-grabbing shadow-lg',
          )}
        >
          <Image
            src={imagen.url}
            alt=""
            fill
            sizes="(min-width: 640px) 200px, 45vw"
            className="pointer-events-none object-cover"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icono-chico"
              className="absolute top-1 right-1 bg-fondo-superficie/90 max-lg:size-10"
              aria-label={`Opciones de la foto ${numero}`}
            >
              <EllipsisVertical aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(evento) => {
              if (!quitada.current) return;
              evento.preventDefault();
              document.getElementById(idAgregar)?.focus();
            }}
          >
            {/* Mientras se guarda otro cambio, las acciones esperan */}
            <DropdownMenuItem
              disabled={imagen.esPrincipal || ocupada}
              onSelect={alMarcarPrincipal}
            >
              <Star aria-hidden />
              Marcar como principal
            </DropdownMenuItem>
            {/* La única foto no se quita (criterio 3): el motivo va en el mismo ítem */}
            <DropdownMenuItem
              variant="destructive"
              disabled={esUnica || ocupada}
              onSelect={() => {
                quitada.current = true;
                alQuitar();
              }}
            >
              <Trash2 aria-hidden />
              <span className="flex flex-col">
                Quitar foto
                {esUnica && (
                  <span className="texto-leyenda text-texto-secundario">
                    Necesita al menos una foto
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="texto-leyenda text-texto-principal">
        {imagen.esPrincipal ? 'Principal' : numero}
      </span>
    </li>
  );
};
