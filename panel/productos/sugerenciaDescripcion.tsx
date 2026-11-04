'use client';

import { ImageUp, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { flushSync } from 'react-dom';
import type { ErrorDeApi } from '@/compartido/api/errores';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button, buttonVariants } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Spinner } from '@/compartido/ui/spinner';
import type {
  SugerenciaDescripcion,
  useSugerirDescripcion,
} from './consultasProductos';
import { TIPOS_FOTO, problemaDelArchivo } from './fotosFormato';

interface FotoReverso {
  archivo: File;
  /** URL local para la miniatura; se libera al cambiar la foto o salir. */
  url: string;
}

type AlElegir = (evento: ChangeEvent<HTMLInputElement>) => void;

/** Lo que comparten los dos selectores de archivo: tipos y el error asociado. */
interface PropsArchivo {
  alElegir: AlElegir;
  idProblema: string;
  conProblema: boolean;
}

/**
 * «Sugerir descripción» (Figma P3 2031:1022; celular 2024:505, E4-H1). El personal sube la
 * foto del reverso y la IA del backend sugiere la descripción y los ingredientes. Es solo una
 * sugerencia hasta que el personal la usa o la edita (E4-H2): entonces pasa al formulario y la
 * tarjeta se cierra, lista para pedir otra; descartarla la cierra sin tocar el formulario. Si no
 * hay resultado, el aviso queda aquí y la descripción se sigue escribiendo a mano.
 *
 * Escritorio (xl): una tarjeta menta en la columna derecha. Celular y pantallas medianas: una
 * tarjeta clara arriba del formulario, con la sugerencia en una caja menta (2024:522).
 */
export const SugerenciaDescripcionProducto = ({
  sugerir,
  alUsar,
  className,
}: {
  /** La consulta vive en el formulario: con una sugerencia a la vista, avisa al salir. */
  sugerir: ReturnType<typeof useSugerirDescripcion>;
  /** Pasa la sugerencia al formulario; con `editar`, deja el cursor en la descripción. */
  alUsar: (sugerencia: SugerenciaDescripcion, editar: boolean) => void;
  className?: string;
}) => {
  const idTitulo = useId();
  const idProblema = useId();
  const [foto, setFoto] = useState<FotoReverso | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const botonGenerar = useRef<HTMLButtonElement>(null);
  /** Para lectores de pantalla: la sugerencia pasó al formulario y la tarjeta se cerró. */
  const [usada, setUsada] = useState(false);

  useEffect(() => {
    if (!foto) return;
    return () => URL.revokeObjectURL(foto.url);
  }, [foto]);

  const elegir: AlElegir = (evento) => {
    const archivo = evento.target.files?.[0];
    // Permite volver a elegir el mismo archivo
    evento.target.value = '';
    if (!archivo) return;
    const motivo = problemaDelArchivo(archivo);
    setProblema(motivo);
    if (motivo) return;
    sugerir.reset();
    setFoto({ archivo, url: URL.createObjectURL(archivo) });
  };

  const propsArchivo: PropsArchivo = {
    alElegir: elegir,
    idProblema,
    conProblema: problema !== null,
  };
  const hayRespuesta =
    sugerir.isPending || sugerir.isError || sugerir.isSuccess;

  /** Cierra la sugerencia; el foco, si no va a la descripción, a «Generar descripción». */
  const cerrar = (enfocar: boolean, anunciar = false) => {
    flushSync(() => {
      sugerir.reset();
      setUsada(anunciar);
    });
    if (enfocar) botonGenerar.current?.focus();
  };

  return (
    <section
      aria-labelledby={idTitulo}
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4 xl:border-0 xl:bg-marca-acento-suave',
        className,
      )}
    >
      <h2
        id={idTitulo}
        className="flex items-center gap-2 texto-etiqueta text-marca-profundo"
      >
        <Sparkles
          aria-hidden
          className="size-4.5 shrink-0"
          strokeWidth={1.75}
        />
        Sugerir descripción
      </h2>
      {foto ? (
        <FotoElegida
          foto={foto}
          bloqueada={sugerir.isPending}
          {...propsArchivo}
        />
      ) : (
        <SinFoto {...propsArchivo} />
      )}
      {problema && (
        <p
          id={idProblema}
          role="alert"
          className="texto-pequeno text-destructive"
        >
          {problema}
        </p>
      )}
      {foto && (
        <Button
          ref={botonGenerar}
          type="button"
          disabled={sugerir.isPending}
          onClick={() => {
            setUsada(false);
            sugerir.mutate(foto.archivo);
          }}
        >
          Generar descripción
        </Button>
      )}
      {/* Montado siempre: los lectores de pantalla anuncian cuando se llena */}
      <p
        role="status"
        className={cn(
          'flex items-center gap-2 texto-pequeno text-texto-secundario',
          !sugerir.isPending && 'sr-only',
        )}
      >
        {sugerir.isPending && (
          <>
            <Spinner aria-hidden />
            Leyendo la foto del reverso…
          </>
        )}
        {usada && 'Pasamos la sugerencia a la descripción.'}
      </p>
      {hayRespuesta && (
        <div className="flex flex-col gap-3 rounded-md bg-marca-acento-suave p-3 xl:p-0">
          <h3 className="flex items-center gap-2 texto-etiqueta text-marca-profundo xl:sr-only">
            <Sparkles
              aria-hidden
              className="size-4.5 shrink-0"
              strokeWidth={1.75}
            />
            Sugerencia a partir de la foto
          </h3>
          {sugerir.isPending && <EsqueletoSugerencia />}
          {sugerir.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {mensajeSinResultado(sugerir.error)}
              </AlertDescription>
            </Alert>
          )}
          {sugerir.isSuccess && (
            <>
              <Resultado sugerencia={sugerir.data} />
              <AccionesSugerencia
                alUsar={() => {
                  alUsar(sugerir.data, false);
                  cerrar(true, true);
                }}
                alEditar={() => {
                  alUsar(sugerir.data, true);
                  cerrar(false, true);
                }}
                alDescartar={() => cerrar(true)}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};

const ACEPTA = TIPOS_FOTO.join(',');

/**
 * El texto del 503 de la ruta (IA caída, sin respuesta en 30 s o sin configurar). Los 5xx
 * nunca muestran el mensaje del backend, así que se repite aquí; vale también sin conexión. La
 * foto ilegible (422) y los 4xx traen el mensaje del backend.
 */
const MENSAJE_IA_NO_DISPONIBLE =
  'No pudimos generar la descripción en este momento. Puedes escribirla a mano.';

const mensajeSinResultado = (error: ErrorDeApi) =>
  error.estado === 0 || error.estado >= 500
    ? MENSAJE_IA_NO_DISPONIBLE
    : error.message;

/**
 * Selector de archivos dentro de su etiqueta. El contorno del foco solo con teclado: al cerrar
 * el diálogo de archivos el campo queda enfocado.
 */
const CLASE_ETIQUETA_ARCHIVO =
  'cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-profundo';

const CampoArchivo = ({
  alElegir,
  idProblema,
  conProblema,
  etiqueta,
  deshabilitado,
}: PropsArchivo & { etiqueta?: string; deshabilitado?: boolean }) => (
  <input
    type="file"
    accept={ACEPTA}
    aria-label={etiqueta}
    aria-invalid={conProblema ? true : undefined}
    aria-describedby={conProblema ? idProblema : undefined}
    disabled={deshabilitado}
    className="sr-only"
    onChange={alElegir}
  />
);

const SinFoto = (props: PropsArchivo) => (
  <>
    <p className="texto-pequeno text-texto-principal">
      Sube la foto del reverso y te sugerimos la descripción y los ingredientes.
    </p>
    <label
      className={cn(
        buttonVariants({ variant: 'contorno' }),
        'min-h-10 bg-fondo-superficie hover:bg-fondo-hueso',
        CLASE_ETIQUETA_ARCHIVO,
      )}
    >
      <ImageUp aria-hidden />
      Subir foto del reverso
      <CampoArchivo {...props} />
    </label>
  </>
);

/** «Foto del reverso» con su miniatura y «Cambiar» (Figma 2031:1028 y 2024:506). */
const FotoElegida = ({
  foto,
  bloqueada,
  ...props
}: PropsArchivo & { foto: FotoReverso; bloqueada: boolean }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-md bg-fondo-hueso p-2 xl:bg-fondo-superficie">
    <span className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-marca-acento-suave xl:size-10">
      {/* URL local del navegador: no pasa por el optimizador de imágenes */}
      <Image src={foto.url} alt="" fill unoptimized className="object-cover" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="texto-etiqueta text-texto-principal">
        Foto del reverso
      </span>
      <span className="truncate texto-leyenda text-texto-secundario">
        {foto.archivo.name}
      </span>
    </span>
    <label
      className={cn(
        'flex min-h-10 shrink-0 items-center rounded-full px-2 texto-etiqueta text-marca-profundo hover:underline',
        CLASE_ETIQUETA_ARCHIVO,
        bloqueada && 'pointer-events-none opacity-50',
      )}
    >
      Cambiar
      <CampoArchivo
        {...props}
        etiqueta="Cambiar la foto del reverso"
        deshabilitado={bloqueada}
      />
    </label>
  </div>
);

/** Mientras responde la IA (hasta 30 s): líneas del alto del texto, para que no salte. */
const EsqueletoSugerencia = () => (
  <div aria-hidden className="flex flex-col gap-2">
    <Skeleton className="h-5 w-full bg-fondo-superficie" />
    <Skeleton className="h-5 w-full bg-fondo-superficie" />
    <Skeleton className="h-5 w-2/3 bg-fondo-superficie" />
  </div>
);

/** La sugerencia en texto plano (nunca HTML), y los ingredientes si la foto los muestra. */
const Resultado = ({ sugerencia }: { sugerencia: SugerenciaDescripcion }) => (
  <>
    <p className="texto-pequeno wrap-anywhere whitespace-pre-line text-texto-principal">
      {sugerencia.descripcion}
    </p>
    {sugerencia.ingredientes && (
      <div className="flex flex-col gap-2">
        <p className="texto-leyenda text-texto-secundario">
          Ingredientes transcritos
        </p>
        <p className="texto-leyenda wrap-anywhere text-texto-principal">
          {sugerencia.ingredientes}
        </p>
      </div>
    )}
  </>
);

/** «Usar», «Editar» y «Descartar» (Figma 2031:1045 y 2024:531), a lo ancho en partes iguales. */
const AccionesSugerencia = ({
  alUsar,
  alEditar,
  alDescartar,
}: {
  alUsar: () => void;
  alEditar: () => void;
  alDescartar: () => void;
}) => (
  // Cada botón al menos de su texto: a 360 px «Descartar» toma lo que necesita. El foco en
  // profundo: el anillo de acento no se ve sobre la menta
  <div className="flex gap-2 *:flex-1 *:px-2 *:focus-visible:ring-0 *:focus-visible:outline-2 *:focus-visible:outline-offset-2 *:focus-visible:outline-marca-profundo">
    <Button type="button" onClick={alUsar}>
      Usar
    </Button>
    <Button type="button" variant="contorno" onClick={alEditar}>
      Editar
    </Button>
    <Button type="button" variant="contorno" onClick={alDescartar}>
      Descartar
    </Button>
  </div>
);
