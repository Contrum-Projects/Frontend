'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import type { FormatoPanel } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { Switch } from '@/compartido/ui/switch';
import {
  AccionesPanelLateral,
  PanelLateral,
} from '@/panel/catalogo/panelLateral';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { SelectorFecha } from '@/tienda/cuenta/selectorFecha';
import { useGuardarFormato } from './consultasProductos';
import {
  FORMATO_VACIO,
  UNIDADES,
  camposDelErrorFormato,
  cuerpoFormato,
  esquemaFormato,
  formatoAFormulario,
  type CampoFormato,
  type FormularioFormato,
  type SalidaFormato,
} from './esquemaFormato';

/** Lo que se edita: un formato existente, uno nuevo, o nada (panel cerrado). */
export type FormatoEnEdicion = { formato: FormatoPanel } | { nuevo: true };

/**
 * Panel lateral para agregar o editar un formato (E3-H2 criterios 1 a 3). Figma no lo dibuja:
 * sigue el de «Nueva marca» y «Nueva cuenta de personal».
 */
export function PanelFormato({
  productoId,
  edicion,
  esPrimero,
  alCerrar,
}: {
  productoId: number;
  edicion: FormatoEnEdicion | null;
  /** El producto aún no tiene formatos: el que se agrega queda como predeterminado. */
  esPrimero: boolean;
  alCerrar: () => void;
}) {
  const formato = edicion && 'formato' in edicion ? edicion.formato : null;
  return (
    <PanelLateral
      titulo={formato ? `Editar ${formato.nombreFormato}` : 'Nuevo formato'}
      abierto={edicion !== null}
      alCambiarAbierto={(abierto) => {
        if (!abierto) alCerrar();
      }}
    >
      {/* Se monta al abrir: cada apertura parte de los datos guardados */}
      {edicion && (
        <FormularioFormatoPanel
          key={formato?.id ?? 'nuevo'}
          productoId={productoId}
          formato={formato}
          esPrimero={esPrimero}
          alTerminar={alCerrar}
        />
      )}
    </PanelLateral>
  );
}

function FormularioFormatoPanel({
  productoId,
  formato,
  esPrimero,
  alTerminar,
}: {
  productoId: number;
  formato: FormatoPanel | null;
  esPrimero: boolean;
  alTerminar: () => void;
}) {
  const guardar = useGuardarFormato(productoId);
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioFormato, unknown, SalidaFormato>({
    resolver: zodResolver(esquemaFormato),
    defaultValues: formato
      ? formatoAFormulario(formato)
      : { ...FORMATO_VACIO, esPredeterminado: esPrimero },
  });

  // El predeterminado no se desmarca (el backend lo rechaza): se marca otro formato
  const predeterminadoFijo = esPrimero || formato?.esPredeterminado === true;

  /** Cada mensaje del backend junto a su campo (E3-H2 criterio 2); el resto, arriba. */
  const mostrarError = (fallo: ErrorDeApi) => {
    if (![400, 409].includes(fallo.estado)) {
      setAviso(fallo.message);
      return;
    }
    const porCampo = new Map<CampoFormato, string[]>();
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campos = camposDelErrorFormato(mensaje);
      if (campos.length === 0) generales.push(mensaje);
      for (const campo of campos) {
        porCampo.set(campo, [...(porCampo.get(campo) ?? []), mensaje]);
      }
    }
    for (const [campo, mensajes] of porCampo) {
      setError(
        campo,
        { type: 'server', message: mensajes.join(' ') },
        { shouldFocus: true },
      );
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaFormato) => {
    setAviso(null);
    try {
      const guardado = await guardar.mutateAsync({
        formatoId: formato?.id,
        cuerpo: cuerpoFormato(datos, formato?.esPredeterminado),
      });
      toast.success(
        formato
          ? `Guardamos los cambios de ${guardado.nombreFormato}.`
          : `Agregamos el formato ${guardado.nombreFormato}.`,
      );
      alTerminar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  const anio = new Date().getFullYear();

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label={formato ? 'Editar formato' : 'Nuevo formato'}
      className="flex flex-1 flex-col gap-4"
    >
      {/* Solo visual: el lector de pantalla oye «obligatorio» en cada campo (aria-required) */}
      <p aria-hidden className="texto-leyenda text-texto-secundario">
        Los campos con <span className="text-destructive">*</span> son
        obligatorios.
      </p>
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <CampoFormulario
          id="formato-sku"
          etiqueta="SKU"
          obligatorio
          error={errors.sku?.message}
        >
          {(propsControl) => (
            <Input {...propsControl} autoComplete="off" {...register('sku')} />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="formato-codigo"
          etiqueta="Código de barras"
          error={errors.codigoBarras?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              inputMode="numeric"
              autoComplete="off"
              {...register('codigoBarras')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="formato-nombre"
          etiqueta="Nombre del formato"
          obligatorio
          error={errors.nombreFormato?.message}
          className="col-span-2"
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              autoComplete="off"
              placeholder="Ej.: 300 ml"
              {...register('nombreFormato')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="formato-contenido"
          etiqueta="Contenido"
          error={errors.contenido?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              inputMode="decimal"
              autoComplete="off"
              {...register('contenido')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="formato-unidad"
          etiqueta="Unidad"
          error={errors.unidadMedida?.message}
        >
          {(propsControl) => (
            <Controller
              control={control}
              name="unidadMedida"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    {...propsControl}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="w-full"
                  >
                    <SelectValue placeholder="Elige" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {UNIDADES.map((unidad) => (
                      <SelectItem key={unidad.valor} value={unidad.valor}>
                        {unidad.texto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="formato-peso"
          etiqueta="Peso (g)"
          obligatorio
          error={errors.pesoGramos?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              inputMode="numeric"
              autoComplete="off"
              {...register('pesoGramos')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="formato-stock-minimo"
          etiqueta="Stock mínimo"
          obligatorio
          error={errors.stockMinimo?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              inputMode="numeric"
              autoComplete="off"
              {...register('stockMinimo')}
            />
          )}
        </CampoFormulario>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 texto-etiqueta text-texto-principal">
          Medidas del envase (cm)
        </legend>
        <div className="grid grid-cols-3 gap-x-3">
          <CampoFormulario
            id="formato-alto"
            etiqueta="Alto"
            obligatorio
            error={errors.altoCm?.message}
          >
            {(propsControl) => (
              <Input
                {...propsControl}
                inputMode="decimal"
                autoComplete="off"
                {...register('altoCm')}
              />
            )}
          </CampoFormulario>
          <CampoFormulario
            id="formato-ancho"
            etiqueta="Ancho"
            obligatorio
            error={errors.anchoCm?.message}
          >
            {(propsControl) => (
              <Input
                {...propsControl}
                inputMode="decimal"
                autoComplete="off"
                {...register('anchoCm')}
              />
            )}
          </CampoFormulario>
          <CampoFormulario
            id="formato-largo"
            etiqueta="Largo"
            obligatorio
            error={errors.largoCm?.message}
          >
            {(propsControl) => (
              <Input
                {...propsControl}
                inputMode="decimal"
                autoComplete="off"
                {...register('largoCm')}
              />
            )}
          </CampoFormulario>
        </div>
      </fieldset>
      <CampoFormulario
        id="formato-vencimiento"
        etiqueta="Vencimiento (opcional)"
        error={errors.fechaVencimiento?.message}
      >
        {(propsControl) => (
          <Controller
            control={control}
            name="fechaVencimiento"
            render={({ field }) => (
              <SelectorFecha
                ref={field.ref}
                valor={field.value}
                alCambiar={field.onChange}
                desde={new Date(anio - 5, 0)}
                hasta={new Date(anio + 15, 11, 31)}
                mesInicial={new Date()}
                control={propsControl}
              />
            )}
          />
        )}
      </CampoFormulario>
      <Controller
        control={control}
        name="esPredeterminado"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch
              id="formato-predeterminado"
              ref={field.ref}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              disabled={predeterminadoFijo}
              aria-invalid={errors.esPredeterminado ? true : undefined}
              aria-describedby={
                errors.esPredeterminado
                  ? 'formato-predeterminado-ayuda formato-predeterminado-error'
                  : 'formato-predeterminado-ayuda'
              }
            />
            <div className="flex min-w-0 flex-col">
              <label
                htmlFor="formato-predeterminado"
                className="texto-etiqueta text-texto-principal"
              >
                Formato predeterminado
              </label>
              <span
                id="formato-predeterminado-ayuda"
                className="texto-leyenda text-texto-secundario"
              >
                {esPrimero
                  ? 'El primer formato del producto siempre es el predeterminado.'
                  : formato?.esPredeterminado
                    ? 'Para cambiarlo, marca otro formato como predeterminado.'
                    : 'Es el que se muestra primero en la tienda.'}
              </span>
              {errors.esPredeterminado?.message && (
                <span
                  id="formato-predeterminado-error"
                  className="texto-pequeno text-destructive"
                >
                  {errors.esPredeterminado.message}
                </span>
              )}
            </div>
          </div>
        )}
      />
      <AccionesPanelLateral
        // Cortos: los dos botones del pie caben lado a lado a 360 px
        texto={formato ? 'Guardar' : 'Agregar'}
        enviando={isSubmitting}
        alCancelar={alTerminar}
      />
    </form>
  );
}
