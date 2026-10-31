'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { EntradaRegistrada } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { Spinner } from '@/compartido/ui/spinner';
import { Tarjeta } from '@/panel/productos/formularioProducto';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CLAVE_ENTRADAS } from './consultasEntradas';
import {
  ENTRADA_VACIA,
  TIPOS_DOCUMENTO,
  cuerpoEntrada,
  destinoDelError,
  esquemaEntrada,
  textoDocumento,
  type FormatoRecibido,
  type FormularioEntrada,
  type SalidaEntrada,
} from './esquemaEntrada';
import { FormatosRecibidos } from './formatosRecibidos';
import { SelectorProveedor, SelectorUbicacion } from './selectoresEntrada';

const RUTA_ENTRADAS = '/panel/inventario/entradas';

/** Hoy en la tienda (AAAA-MM-DD): tope del calendario. El backend vuelve a comprobarlo. */
const hoyEnChile = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(
    new Date(),
  );

/**
 * «Nueva entrada de inventario» (Figma P5 2029:4319 y 2025:603, E11-H2 criterios 2 y 3):
 * recepción y formatos recibidos. Al registrar, entrega la entrada que respondió el backend.
 */
export function FormularioEntrada({
  alRegistrar,
}: {
  alRegistrar: (
    entrada: EntradaRegistrada,
    formatos: FormatoRecibido[],
  ) => void;
}) {
  const clienteConsultas = useQueryClient();
  const idFormulario = useId();
  const [aviso, setAviso] = useState<string | null>(null);
  const alertaAviso = useRef<HTMLDivElement>(null);
  // En celular el botón queda al final: el aviso de arriba se trae a la vista
  useEffect(() => {
    if (aviso) alertaAviso.current?.scrollIntoView({ block: 'center' });
  }, [aviso]);
  const {
    register,
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormularioEntrada, unknown, SalidaEntrada>({
    resolver: zodResolver(esquemaEntrada),
    defaultValues: ENTRADA_VACIA,
  });

  const marcarFilas = (formatoIds: number[], mensaje: string) => {
    const detalles = getValues('detalles');
    let marcadas = 0;
    detalles.forEach(({ formato }, indice) => {
      if (!formatoIds.includes(formato.formatoId)) return;
      setError(`detalles.${indice}.formato`, {
        type: 'server',
        message: mensaje,
      });
      marcadas++;
    });
    return marcadas > 0;
  };

  const repetidos = () => {
    const ids = getValues('detalles').map(({ formato }) => formato.formatoId);
    return ids.filter((id, indice) => ids.indexOf(id) !== indice);
  };

  const mostrarError = (fallo: ErrorDeApi) => {
    if (![400, 409].includes(fallo.estado)) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const destino = destinoDelError(mensaje);
      if (destino?.tipo === 'campo') {
        // El foco lleva al campo: en celular puede estar fuera de la vista
        setError(
          destino.campo,
          { type: 'server', message: mensaje },
          { shouldFocus: true },
        );
      } else if (
        (destino?.tipo === 'filas' &&
          marcarFilas(destino.formatoIds, mensaje)) ||
        (destino?.tipo === 'repetidos' && marcarFilas(repetidos(), mensaje))
      ) {
        continue;
      } else if (destino) {
        setError('detalles', { type: 'server', message: mensaje });
      } else {
        generales.push(mensaje);
      }
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaEntrada) => {
    setAviso(null);
    try {
      const entrada = exigir<EntradaRegistrada>(
        await api.POST('/api/inventario/entradas', {
          body: cuerpoEntrada(datos),
        }),
      );
      await clienteConsultas.invalidateQueries({ queryKey: CLAVE_ENTRADAS });
      toast.success(`Registramos la entrada de ${textoDocumento(entrada)}.`);
      alRegistrar(
        entrada,
        datos.detalles.map(({ formato }) => formato),
      );
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={RUTA_ENTRADAS}
          className="inline-flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo lg:hidden"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          Entradas
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="titulo-h2 text-texto-principal">
            Nueva entrada
            <span className="max-lg:hidden"> de inventario</span>
          </h1>
          <div className="flex gap-3 max-lg:hidden">
            <Acciones formulario={idFormulario} enviando={isSubmitting} />
          </div>
        </div>
      </div>
      {aviso && (
        <Alert ref={alertaAviso} variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <form
        id={idFormulario}
        onSubmit={handleSubmit(enviar)}
        noValidate
        aria-label="Nueva entrada de inventario"
        className="flex flex-col gap-4 lg:gap-6"
      >
        <p aria-hidden className="texto-leyenda text-texto-secundario">
          Los campos con <span className="text-destructive">*</span> son
          obligatorios.
        </p>
        <Tarjeta titulo="Recepción">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4">
            <CampoFormulario
              id="entrada-proveedor"
              etiqueta="Proveedor"
              obligatorio
              error={errors.proveedorId?.message}
              className="col-span-2 lg:col-span-1"
            >
              {(propsControl) => (
                <Controller
                  control={control}
                  name="proveedorId"
                  render={({ field }) => (
                    <SelectorProveedor
                      propsControl={propsControl}
                      ref={field.ref}
                      valor={field.value}
                      alCambiar={field.onChange}
                      alSalir={field.onBlur}
                    />
                  )}
                />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="entrada-fecha"
              etiqueta="Fecha de recepción"
              obligatorio
              error={errors.fechaRecepcion?.message}
              className="max-sm:col-span-2"
            >
              {(propsControl) => (
                <Input
                  {...propsControl}
                  type="date"
                  max={hoyEnChile()}
                  {...register('fechaRecepcion')}
                />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="entrada-tipo-documento"
              etiqueta="Documento"
              obligatorio
              error={errors.tipoDocumento?.message}
              className="max-sm:col-span-2"
            >
              {(propsControl) => (
                <Controller
                  control={control}
                  name="tipoDocumento"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        {...propsControl}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      >
                        <SelectValue placeholder="Elige" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {TIPOS_DOCUMENTO.map(({ valor, texto }) => (
                          <SelectItem key={valor} value={valor}>
                            {texto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="entrada-numero-documento"
              etiqueta="Número de factura o guía"
              obligatorio
              error={errors.numeroDocumento?.message}
              className="col-span-2 lg:col-span-1"
            >
              {(propsControl) => (
                <Input
                  {...propsControl}
                  autoComplete="off"
                  {...register('numeroDocumento')}
                />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="entrada-ubicacion"
              etiqueta="Ubicación"
              obligatorio
              error={errors.ubicacionId?.message}
              className="col-span-2"
            >
              {(propsControl) => (
                <Controller
                  control={control}
                  name="ubicacionId"
                  render={({ field }) => (
                    <SelectorUbicacion
                      propsControl={propsControl}
                      ref={field.ref}
                      valor={field.value}
                      alCambiar={field.onChange}
                      alSalir={field.onBlur}
                    />
                  )}
                />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="entrada-observacion"
              etiqueta="Observación (opcional)"
              error={errors.observacion?.message}
              className="col-span-2"
            >
              {(propsControl) => (
                <Input
                  {...propsControl}
                  autoComplete="off"
                  {...register('observacion')}
                />
              )}
            </CampoFormulario>
          </div>
        </Tarjeta>
        <FormatosRecibidos
          control={control}
          register={register}
          errors={errors.detalles}
        />
      </form>
      <p className="texto-leyenda text-texto-secundario">
        Al registrar, el stock de cada formato sube en la ubicación elegida y
        queda un movimiento de entrada ligado a esta recepción.
      </p>
      <div className="flex flex-col-reverse gap-3 lg:hidden">
        <Acciones formulario={idFormulario} enviando={isSubmitting} />
      </div>
    </div>
  );
}

/**
 * «Cancelar» vuelve a Entradas sin guardar; «Registrar entrada» envía el formulario aunque esté
 * fuera de él (atributo `form`). Figma 2029:4322.
 */
const Acciones = ({
  formulario,
  enviando,
}: {
  formulario: string;
  enviando: boolean;
}) => (
  <>
    <Button asChild variant="contorno" className="max-lg:min-h-10">
      <Link href={RUTA_ENTRADAS}>Cancelar</Link>
    </Button>
    <Button
      type="submit"
      form={formulario}
      disabled={enviando}
      className="max-lg:min-h-10"
    >
      {enviando && <Spinner aria-hidden />}
      Registrar entrada
    </Button>
  </>
);
