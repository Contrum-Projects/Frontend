'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import type { CampanaGestion } from '@/compartido/api/respuestas';
import { formatearNumero } from '@/compartido/formato/numero';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/compartido/ui/tabs';
import { ConfirmarEnvio, type EnvioPorConfirmar } from './confirmarEnvio';
import {
  useEnviarCampana,
  useGuardarCampana,
  useObtenerVistaPrevia,
  useSegmentosCampana,
  useVistaPrevia,
} from './consultasCampanas';
import {
  CAMPANA_VACIA,
  campoDelError,
  esquemaCampana,
  type FormularioCampana as Formulario,
} from './esquemaCampana';
import { rutaCampana } from './listaCampanas';
import { RUTA_CAMPANAS } from './pantallaCampanas';
import { TarjetaMensaje, TarjetaSegmento } from './tarjetasCampana';
import { VistaPreviaCorreo } from './vistaPreviaCorreo';

type Pestana = 'editar' | 'vista';

/** Las dos vistas siguen montadas; en escritorio se ven juntas, en celular una por pestaña. */
const PANEL = 'data-[state=inactive]:max-lg:hidden';

/**
 * «Nueva campaña» (Figma P7a 2046:1646 y 2047:1323, E12-H3): asunto, mensaje y segmento, con la
 * vista previa al lado en escritorio y en pestañas en celular. «Revisar y enviar» guarda el
 * borrador y pide confirmar (P7b). `campana` es el borrador que se sigue editando.
 */
export function FormularioCampana({
  campana,
}: {
  campana: CampanaGestion | null;
}) {
  const id = useId();
  const router = useRouter();
  const [codigo, setCodigo] = useState(campana?.codigo ?? null);
  const [pestana, setPestana] = useState<Pestana>('editar');
  const [aviso, setAviso] = useState<string | null>(null);
  const [envio, setEnvio] = useState<EnvioPorConfirmar | null>(null);
  const [avisoEnvio, setAvisoEnvio] = useState<string | null>(null);
  const guardar = useGuardarCampana();
  const enviar = useEnviarCampana();
  const obtenerVistaPrevia = useObtenerVistaPrevia();
  const segmentos = useSegmentosCampana();
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquemaCampana),
    defaultValues: campana
      ? {
          asunto: campana.asunto,
          cuerpo: campana.cuerpo,
          segmento: campana.segmento,
        }
      : CAMPANA_VACIA,
  });
  const datos = useWatch({ control }) as Formulario;
  const vista = useVistaPrevia(datos, datos.segmento.tipo !== '');
  const errorVista = vista.isError ? vista.error.message : undefined;

  // Una campaña nueva parte con el primer segmento que ofrece el backend
  const primerTipo = segmentos.data?.tipos[0]?.valor;
  useEffect(() => {
    if (primerTipo && getValues('segmento.tipo') === '') {
      setValue('segmento', { tipo: primerTipo, criterios: [] });
    }
  }, [primerTipo, getValues, setValue]);

  const mostrarError = (fallo: ErrorDeApi) => {
    setPestana('editar');
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje);
      if (campo)
        setError(
          campo,
          { type: 'server', message: mensaje },
          { shouldFocus: true },
        );
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  /** Crea o reemplaza el borrador; la URL pasa a ser la del borrador sin recargar la página. */
  const guardarBorrador = async (valores: Formulario) => {
    const guardada = await guardar.mutateAsync({ codigo, datos: valores });
    if (!codigo)
      window.history.replaceState(null, '', rutaCampana(guardada.codigo));
    setCodigo(guardada.codigo);
    return guardada;
  };

  const conErrores = (accion: (valores: Formulario) => Promise<void>) =>
    handleSubmit(
      async (valores) => {
        setAviso(null);
        try {
          await accion(valores);
        } catch (error) {
          // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
          mostrarError(
            error instanceof ErrorDeApi ? error : errorDeApi(undefined),
          );
        }
      },
      () => setPestana('editar'),
    );

  const alGuardar = conErrores(async (valores) => {
    await guardarBorrador(valores);
    toast.success('Borrador guardado.');
  });

  const alRevisar = conErrores(async (valores) => {
    await guardarBorrador(valores);
    const previa = await obtenerVistaPrevia(valores);
    setAvisoEnvio(null);
    setEnvio({
      asunto: previa.asunto,
      segmento: previa.segmento,
      destinatarios: previa.destinatarios,
    });
  });

  const confirmar = async () => {
    if (!codigo) return;
    setAvisoEnvio(null);
    try {
      const enviada = await enviar.mutateAsync(codigo);
      toast.success(
        `Campaña enviada a ${formatearNumero(enviada.destinatarios)} destinatarios.`,
      );
      router.push(RUTA_CAMPANAS);
    } catch (error) {
      const fallo = error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      if (fallo.estado === 409) {
        // Ya salió (otra persona la envió): no hay nada más que hacer aquí
        toast.error(fallo.message);
        router.push(RUTA_CAMPANAS);
        return;
      }
      setAvisoEnvio(fallo.message);
    }
  };

  const guardarBorradorBoton = (ancho: boolean) => (
    <Button
      type="button"
      variant="contorno"
      size={ancho ? 'grande' : 'mediano'}
      onClick={alGuardar}
      disabled={isSubmitting}
    >
      Guardar borrador
    </Button>
  );

  const revisarBoton = (ancho: boolean) => (
    <Button
      type="button"
      size={ancho ? 'grande' : 'mediano'}
      onClick={alRevisar}
      disabled={isSubmitting}
    >
      {isSubmitting && <Spinner aria-hidden />}
      Revisar y enviar
    </Button>
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={RUTA_CAMPANAS}
          className="inline-flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          Campañas
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="titulo-h2 text-texto-principal">
            {campana ? 'Editar campaña' : 'Nueva campaña'}
          </h1>
          <div className="flex gap-3 max-lg:hidden">
            {guardarBorradorBoton(false)}
            {revisarBoton(false)}
          </div>
        </div>
      </div>
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <Tabs
        value={pestana}
        onValueChange={(valor) => setPestana(valor as Pestana)}
        className="gap-4"
      >
        <TabsList className="h-auto w-full rounded-full border bg-fondo-superficie p-1 lg:hidden">
          <TabsTrigger value="editar" className={PESTANA}>
            Editar
          </TabsTrigger>
          <TabsTrigger value="vista" className={PESTANA}>
            Vista previa
          </TabsTrigger>
        </TabsList>
        <div className="grid gap-6 lg:grid-cols-5">
          <TabsContent
            value="editar"
            forceMount
            className={`${PANEL} lg:col-span-3`}
          >
            <form
              onSubmit={alGuardar}
              noValidate
              aria-label="Campaña"
              className="flex flex-col gap-4 lg:gap-6"
            >
              <TarjetaMensaje id={id} register={register} errors={errors} />
              <TarjetaSegmento
                id={id}
                control={control}
                vista={vista.data}
                errorVista={errorVista}
              />
            </form>
          </TabsContent>
          <TabsContent
            value="vista"
            forceMount
            className={`${PANEL} lg:col-span-2`}
          >
            <VistaPreviaCorreo vista={vista.data} error={errorVista} />
          </TabsContent>
        </div>
      </Tabs>
      {/* En celular, la acción principal primero, también para el foco */}
      <div className="flex flex-col gap-3 lg:hidden">
        {revisarBoton(true)}
        {guardarBorradorBoton(true)}
      </div>
      <ConfirmarEnvio
        envio={envio}
        enviando={enviar.isPending}
        aviso={avisoEnvio}
        alConfirmar={confirmar}
        alCerrar={() => setEnvio(null)}
      />
    </div>
  );
}

const PESTANA =
  'h-10 flex-1 rounded-full texto-etiqueta text-texto-principal data-[state=active]:bg-marca-profundo data-[state=active]:text-texto-sobre-oscuro data-[state=active]:shadow-none';
