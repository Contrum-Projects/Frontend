'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  useForm,
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import type {
  FormatoPanel,
  PreciosArticulo,
} from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Textarea } from '@/compartido/ui/textarea';
import {
  AccionesPanelLateral,
  PanelLateral,
} from '@/panel/catalogo/panelLateral';
import {
  CampoFormulario,
  type PropsControl,
} from '@/tienda/cuenta/campoFormulario';
import {
  useFijarPrecios,
  usePrecios,
  useRecargarPrecios,
} from './consultasPrecios';
import {
  campoDelErrorPrecios,
  cuerpoPrecios,
  esquemaPrecios,
  preciosAFormulario,
  vistaPreviaConIva,
  type CampoPrecios,
  type FormularioPrecios,
  type SalidaPrecios,
} from './esquemaPrecios';
import { HistorialPrecios } from './historialPrecios';

/**
 * Panel lateral con los precios netos del formato y su historial (E3-H5). Figma no lo dibuja:
 * sigue el panel del formato. Solo se abre con el permiso `precios.gestionar`.
 */
export function PanelPrecios({
  productoId,
  formato,
  alCerrar,
}: {
  productoId: number;
  formato: FormatoPanel | null;
  alCerrar: () => void;
}) {
  return (
    <PanelLateral
      titulo={formato ? `Precios de ${formato.nombreFormato}` : 'Precios'}
      abierto={formato !== null}
      alCambiarAbierto={(abierto) => {
        if (!abierto) alCerrar();
      }}
    >
      {formato && (
        <ContenidoPrecios
          key={formato.id}
          productoId={productoId}
          articuloId={formato.id}
          nombreFormato={formato.nombreFormato}
          alCerrar={alCerrar}
        />
      )}
    </PanelLateral>
  );
}

const ContenidoPrecios = ({
  productoId,
  articuloId,
  nombreFormato,
  alCerrar,
}: {
  productoId: number;
  articuloId: number;
  nombreFormato: string;
  alCerrar: () => void;
}) => {
  const precios = usePrecios(productoId, articuloId);

  if (precios.isPending) return <EsqueletoPrecios />;
  if (precios.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{precios.error.message}</AlertDescription>
      </Alert>
    );
  }
  return (
    <>
      <FormularioPrecios
        productoId={productoId}
        articuloId={articuloId}
        nombreFormato={nombreFormato}
        precios={precios.data}
        alCerrar={alCerrar}
      />
      <HistorialPrecios historial={precios.data.historial} />
    </>
  );
};

function FormularioPrecios({
  productoId,
  articuloId,
  nombreFormato,
  precios,
  alCerrar,
}: {
  productoId: number;
  articuloId: number;
  nombreFormato: string;
  precios: PreciosArticulo;
  alCerrar: () => void;
}) {
  const fijar = useFijarPrecios(productoId, articuloId);
  const recargar = useRecargarPrecios(productoId, articuloId);
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPrecios, unknown, SalidaPrecios>({
    resolver: zodResolver(esquemaPrecios),
    defaultValues: preciosAFormulario(precios),
  });

  /** Cada mensaje del backend junto a su campo; el resto, arriba. */
  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelErrorPrecios(mensaje);
      if (campo) {
        setError(
          campo,
          { type: 'server', message: mensaje },
          { shouldFocus: true },
        );
      } else {
        generales.push(mensaje);
      }
    }
    if (generales.length > 0) setAviso(generales.join(' '));
    // El producto pasó a exclusivo mientras tanto: se pide de nuevo para quitar el minorista
    if (fallo.mensajes.some((mensaje) => mensaje.includes('exclusivo'))) {
      void recargar();
    }
  };

  const enviar = async (datos: SalidaPrecios) => {
    setAviso(null);
    const cuerpo = cuerpoPrecios(datos, precios);
    if (!cuerpo) {
      setAviso('Los precios son iguales a los vigentes. Cambia al menos uno.');
      return;
    }
    try {
      // Parte de los precios guardados, con el motivo vacío para el próximo cambio
      reset(preciosAFormulario(await fijar.mutateAsync(cuerpo)));
      toast.success(`Guardamos los precios de ${nombreFormato}.`);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label={`Precios de ${nombreFormato}`}
      className="flex flex-col gap-4"
    >
      <p className="texto-leyenda text-texto-secundario">
        Ingresa los precios netos, sin IVA. Un precio vacío no cambia.{' '}
        {/* Solo visual: el lector de pantalla oye «obligatorio» (aria-required) */}
        <span aria-hidden>
          Los campos con <span className="text-destructive">*</span> son
          obligatorios.
        </span>
      </p>
      {precios.exclusivo && (
        <Alert variant="info">
          <AlertDescription className="text-marca-profundo">
            Este producto es exclusivo para profesionales: solo lleva precio
            mayorista.
          </AlertDescription>
        </Alert>
      )}
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      {!precios.exclusivo && (
        <CampoPrecio
          id="precio-minorista"
          nombre="precioMinoristaNeto"
          etiqueta="Precio minorista neto"
          error={errors.precioMinoristaNeto?.message}
          control={control}
          porcentajeIva={precios.porcentajeIva}
          registro={register('precioMinoristaNeto')}
        />
      )}
      <CampoPrecio
        id="precio-mayorista"
        nombre="precioMayoristaNeto"
        etiqueta="Precio mayorista neto"
        error={errors.precioMayoristaNeto?.message}
        control={control}
        porcentajeIva={precios.porcentajeIva}
        registro={register('precioMayoristaNeto')}
      />
      <CampoFormulario
        id="precio-motivo"
        etiqueta="Motivo del cambio"
        obligatorio
        error={errors.motivo?.message}
      >
        {(propsControl) => (
          <Textarea
            {...propsControl}
            placeholder="Ej.: Alza del proveedor"
            {...register('motivo')}
          />
        )}
      </CampoFormulario>
      <AccionesPanelLateral
        texto="Guardar"
        enviando={isSubmitting}
        alCancelar={alCerrar}
      />
    </form>
  );
}

/** Un precio neto con su valor con IVA al lado, mientras se escribe (E3-H5 criterio 1). */
const CampoPrecio = ({
  id,
  nombre,
  etiqueta,
  error,
  control,
  porcentajeIva,
  registro,
}: {
  id: string;
  nombre: Extract<CampoPrecios, `precio${string}`>;
  etiqueta: string;
  error?: string;
  control: Control<FormularioPrecios, unknown, SalidaPrecios>;
  porcentajeIva: number | undefined;
  registro: UseFormRegisterReturn<CampoPrecios>;
}) => {
  const neto = useWatch({ control, name: nombre });
  const conIva = vistaPreviaConIva(neto, porcentajeIva);
  const describir = (propsControl: PropsControl) =>
    [propsControl['aria-describedby'], conIva !== null && `${id}-iva`]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <CampoFormulario id={id} etiqueta={etiqueta} error={error}>
      {(propsControl) => (
        <div className="flex items-center gap-3">
          <Input
            {...propsControl}
            aria-describedby={describir(propsControl)}
            inputMode="decimal"
            autoComplete="off"
            className="min-w-0 flex-1"
            {...registro}
          />
          {/* Sin la tasa del backend no hay referencia que mostrar. Sin aria-live: se lee con
              el campo (aria-describedby), no en cada tecla */}
          {porcentajeIva !== undefined && (
            <span
              id={`${id}-iva`}
              className="w-32 shrink-0 texto-pequeno text-texto-secundario tabular-nums"
            >
              {conIva !== null && `con IVA ${formatearPesos(conIva)}`}
            </span>
          )}
        </div>
      )}
    </CampoFormulario>
  );
};

const EsqueletoPrecios = () => (
  <div aria-hidden className="flex flex-col gap-4">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);
