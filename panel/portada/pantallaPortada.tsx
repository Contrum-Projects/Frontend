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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  MAXIMO_SLIDES,
  type SlidePanel,
  useEliminarSlide,
  useOrdenarSlides,
  useQuitarCelular,
  useReemplazarImagen,
  useSlides,
} from './consultasPortada';
import { DialogoDestino, DialogoNuevoSlide } from './dialogosPortada';
import { TarjetaSlide } from './tarjetaSlide';

/**
 * «Portada» del panel (SCRUM-157; sin diseño en Figma, sigue la gestión de fotos): las imágenes
 * que se muestran arriba del inicio de la tienda. Solo se cambian las imágenes, el orden y a
 * dónde lleva cada una.
 */
export function PantallaPortada() {
  const consulta = useSlides();
  const [nuevo, setNuevo] = useState(false);
  const cantidad = consulta.data?.length ?? 0;
  const lleno = cantidad >= MAXIMO_SLIDES;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Portada</h1>
        <Button
          onClick={() => setNuevo(true)}
          disabled={!consulta.isSuccess || lleno}
        >
          <Plus aria-hidden />
          Agregar<span className="max-sm:sr-only"> imagen</span>
        </Button>
      </div>
      <p className="max-w-prose texto-pequeno text-texto-secundario">
        Las imágenes que pasan arriba del inicio de la tienda, en este orden.
        {lleno &&
          ` La portada tiene ${MAXIMO_SLIDES} imágenes, el máximo: elimina una para agregar otra.`}
      </p>
      {consulta.isPending ? (
        <div aria-hidden className="flex flex-col gap-3">
          {[0, 1, 2].map((fila) => (
            <Skeleton key={fila} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : consulta.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      ) : consulta.data.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 texto-pequeno text-texto-secundario">
          La portada no tiene imágenes. Mientras tanto, el inicio muestra el
          pack vigente.
        </p>
      ) : (
        <ListaSlides slides={consulta.data} />
      )}
      <DialogoNuevoSlide abierto={nuevo} alCambiarAbierto={setNuevo} />
    </div>
  );
}

const posicion = (slides: SlidePanel[], id: number | string) =>
  `posición ${slides.findIndex((slide) => slide.id === id) + 1} de ${slides.length}`;

/**
 * Los slides en su orden. Se arrastran con el mouse, el dedo (manteniendo presionado) o el
 * teclado (espacio y flechas), como las fotos de los productos.
 */
const ListaSlides = ({ slides }: { slides: SlidePanel[] }) => {
  const ordenar = useOrdenarSlides();
  const reemplazar = useReemplazarImagen();
  const quitarCelular = useQuitarCelular();
  const eliminar = useEliminarSlide();
  const [aviso, setAviso] = useState<string | null>(null);
  const [destinoDe, setDestinoDe] = useState<SlidePanel | null>(null);
  const ocupada =
    ordenar.isPending ||
    reemplazar.isPending ||
    quitarCelular.isPending ||
    eliminar.isPending;
  const alFallar = (fallo: Error) => setAviso(fallo.message);
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const desde = slides.findIndex((slide) => slide.id === active.id);
    const hasta = slides.findIndex((slide) => slide.id === over.id);
    setAviso(null);
    ordenar.ordenar(arrayMove(slides, desde, hasta), alFallar);
  };

  const anuncios: Announcements = {
    onDragStart: ({ active }) =>
      `Tomaste la imagen en la ${posicion(slides, active.id)}.`,
    onDragOver: ({ over }) =>
      over ? `Sobre la ${posicion(slides, over.id)}.` : '',
    onDragEnd: ({ over }) =>
      over
        ? `Dejaste la imagen en la ${posicion(slides, over.id)}.`
        : 'La imagen volvió a su lugar.',
    onDragCancel: () => 'Cancelaste el cambio de orden.',
  };

  const conAviso =
    <V,>(mutacion: {
      mutate: (v: V, o: { onError: (f: Error) => void }) => void;
    }) =>
    (variables: V) => {
      setAviso(null);
      mutacion.mutate(variables, { onError: alFallar });
    };

  return (
    <>
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragEnd={alSoltar}
        accessibility={{
          announcements: anuncios,
          screenReaderInstructions: {
            draggable:
              'Para mover la imagen, presiona espacio, usa las flechas y vuelve a presionar espacio para dejarla. Escape cancela.',
          },
        }}
      >
        <SortableContext
          items={slides.map((slide) => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol
            aria-label="Imágenes de la portada"
            className="flex flex-col gap-3"
          >
            {slides.map((slide, indice) => (
              <TarjetaSlide
                key={slide.id}
                slide={slide}
                numero={indice + 1}
                ocupada={ocupada}
                alReemplazar={(version, archivo) =>
                  conAviso(reemplazar)({ id: slide.id, version, archivo })
                }
                alQuitarCelular={() => conAviso(quitarCelular)(slide.id)}
                alCambiarDestino={() => setDestinoDe(slide)}
                alEliminar={() => conAviso(eliminar)(slide.id)}
                alProblema={setAviso}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p className="texto-leyenda text-texto-secundario">
        Arrastra desde el asa para cambiar el orden. Los cambios se ven en la
        tienda al recargar el inicio.
      </p>
      <DialogoDestino slide={destinoDe} alCerrar={() => setDestinoDe(null)} />
    </>
  );
};
