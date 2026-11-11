'use client';

import { useState } from 'react';
import { type ErrorDeApi, repartirErrores } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/compartido/ui/dialog';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoImagen } from './campoImagen';
import {
  type DestinoElegido,
  type SlidePanel,
  useCambiarDestino,
  useCrearSlide,
} from './consultasPortada';
import { SelectorDestino } from './selectorDestino';

type Campo = 'escritorio' | 'celular' | 'destino';

/** Ayudas de cada imagen: el tamaño que mejor se ve y qué pasa si falta la de celular. */
export const AYUDA_ESCRITORIO =
  'Horizontal, ideal 2400 × 1000 px. JPEG, PNG o WebP de hasta 4 MB.';
export const AYUDA_CELULAR =
  'Vertical, ideal 1080 × 1350 px. Si no la subes, el celular muestra la de escritorio recortada al centro.';

const errores = (error: ErrorDeApi | null) =>
  error
    ? repartirErrores<Campo>(error, {
        escritorio: 'escritorio',
        celular: 'celular',
        destino: 'destino',
        tipoDestino: 'destino',
      })
    : { porCampo: [], generales: [] };

const mensajeDe = (
  porCampo: [Campo, string][],
  campo: Campo,
): string | undefined => porCampo.find(([c]) => c === campo)?.[1];

/** Agregar un slide: imagen de escritorio, la de celular si se quiere y el destino. */
export function DialogoNuevoSlide({
  abierto,
  alCambiarAbierto,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {/* Se monta de nuevo en cada apertura: parte vacío */}
        {abierto && (
          <FormularioNuevoSlide alTerminar={() => alCambiarAbierto(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const FormularioNuevoSlide = ({ alTerminar }: { alTerminar: () => void }) => {
  const crear = useCrearSlide();
  const [escritorio, setEscritorio] = useState<File | null>(null);
  const [celular, setCelular] = useState<File | null>(null);
  const [destino, setDestino] = useState<DestinoElegido | null>(null);
  const [intentado, setIntentado] = useState(false);
  const { porCampo, generales } = errores(crear.error);

  const guardar = () => {
    setIntentado(true);
    if (!escritorio || !destino) return;
    crear.mutate(
      { escritorio, celular: celular ?? undefined, destino },
      { onSuccess: alTerminar },
    );
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(evento) => {
        evento.preventDefault();
        guardar();
      }}
    >
      <DialogHeader>
        <DialogTitle>Agregar imagen a la portada</DialogTitle>
        <DialogDescription>
          Se agrega al final. El texto que quieras mostrar va dentro de la
          imagen.
        </DialogDescription>
      </DialogHeader>
      {generales.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>{generales.join(' ')}</AlertDescription>
        </Alert>
      )}
      <CampoImagen
        etiqueta="Imagen para escritorio"
        ayuda={AYUDA_ESCRITORIO}
        proporcion="escritorio"
        archivo={escritorio}
        alCambiar={setEscritorio}
        error={
          mensajeDe(porCampo, 'escritorio') ??
          (intentado && !escritorio
            ? 'Sube la imagen para escritorio.'
            : undefined)
        }
      />
      <CampoImagen
        etiqueta="Imagen para celular"
        ayuda={AYUDA_CELULAR}
        proporcion="celular"
        archivo={celular}
        alCambiar={setCelular}
        error={mensajeDe(porCampo, 'celular')}
        opcional
      />
      <SelectorDestino
        valor={destino}
        alCambiar={setDestino}
        error={
          mensajeDe(porCampo, 'destino') ??
          (intentado && !destino ? 'Elige a dónde lleva la imagen.' : undefined)
        }
      />
      <DialogFooter>
        <Button
          type="button"
          variant="contorno"
          onClick={alTerminar}
          disabled={crear.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={crear.isPending}>
          {crear.isPending && <Spinner aria-hidden />}
          {crear.isPending ? 'Subiendo…' : 'Agregar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

/** Cambiar a dónde lleva un slide que ya existe. */
export function DialogoDestino({
  slide,
  alCerrar,
}: {
  /** El slide cuyo destino se cambia, o `null` con el diálogo cerrado. */
  slide: SlidePanel | null;
  alCerrar: () => void;
}) {
  return (
    <Dialog
      open={slide !== null}
      onOpenChange={(abierto) => {
        if (!abierto) alCerrar();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {slide && <FormularioDestino slide={slide} alTerminar={alCerrar} />}
      </DialogContent>
    </Dialog>
  );
}

const FormularioDestino = ({
  slide,
  alTerminar,
}: {
  slide: SlidePanel;
  alTerminar: () => void;
}) => {
  const cambiar = useCambiarDestino();
  const [destino, setDestino] = useState<DestinoElegido | null>({
    tipoDestino: slide.destino.tipo,
    destino: slide.destino.destino,
  });
  const [intentado, setIntentado] = useState(false);
  const { porCampo, generales } = errores(cambiar.error);

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(evento) => {
        evento.preventDefault();
        setIntentado(true);
        if (!destino) return;
        cambiar.mutate({ id: slide.id, ...destino }, { onSuccess: alTerminar });
      }}
    >
      <DialogHeader>
        <DialogTitle>Cambiar destino</DialogTitle>
        <DialogDescription>
          {slide.destino.nombre
            ? `Hoy lleva a ${slide.destino.nombre}.`
            : 'Su destino ya no existe.'}
        </DialogDescription>
      </DialogHeader>
      {generales.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>{generales.join(' ')}</AlertDescription>
        </Alert>
      )}
      <SelectorDestino
        valor={destino}
        alCambiar={setDestino}
        error={
          mensajeDe(porCampo, 'destino') ??
          (intentado && !destino ? 'Elige a dónde lleva la imagen.' : undefined)
        }
      />
      <DialogFooter>
        <Button
          type="button"
          variant="contorno"
          onClick={alTerminar}
          disabled={cambiar.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={cambiar.isPending}>
          {cambiar.isPending && <Spinner aria-hidden />}
          Guardar
        </Button>
      </DialogFooter>
    </form>
  );
};
