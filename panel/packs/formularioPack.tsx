'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { PackPanel } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { Switch } from '@/compartido/ui/switch';
import { Textarea } from '@/compartido/ui/textarea';
import { Tarjeta } from '@/panel/productos/formularioProducto';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { SelectorFecha } from '@/tienda/cuenta/selectorFecha';
import { ComponentesPack } from './componentesPack';
import {
  CLAVE_PACKS,
  clavePack,
  clavePreciosPack,
  urlPack,
} from './consultasPacks';
import {
  PACK_VACIO,
  campoDelErrorPack,
  cuerpoPack,
  esquemaPack,
  packAFormulario,
  type FormularioPack,
  type SalidaPack,
} from './esquemaPack';

/**
 * Pack nuevo o editado (Figma P3c 2065:2381 y 2065:9091, E3-H6). El formulario lleva los datos,
 * la descripción y los componentes. Los precios y las fotos se guardan cada uno por su lado y
 * van fuera del `<form>`: un formulario dentro de otro (el panel de precios) enviaría los dos.
 */
export function FormularioPackPanel({
  pack,
  titulo,
  precios,
  lateral,
}: {
  /** Sin pack: nuevo. */
  pack?: PackPanel;
  titulo: ReactNode;
  /** «Precios del pack», bajo el formulario. */
  precios: ReactNode;
  /** «Fotos del pack» y «Disponibilidad en la tienda», a la derecha en escritorio. */
  lateral: ReactNode;
}) {
  const router = useRouter();
  const clienteConsultas = useQueryClient();
  const idFormulario = useId();
  /** La vigencia se elige desde el año pasado hasta cinco años más. */
  const anio = new Date().getFullYear();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPack, unknown, SalidaPack>({
    resolver: zodResolver(esquemaPack),
    defaultValues: pack ? packAFormulario(pack) : PACK_VACIO,
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    if (![400, 409].includes(fallo.estado)) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelErrorPack(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaPack) => {
    setAviso(null);
    try {
      const guardado = exigir<PackPanel>(
        pack
          ? await api.PATCH('/api/catalogo/packs/{id}', {
              params: { path: { id: pack.id } },
              body: cuerpoPack(datos),
            })
          : await api.POST('/api/catalogo/packs', { body: cuerpoPack(datos) }),
      );
      clienteConsultas.setQueryData(clavePack(guardado.id), guardado);
      await Promise.all([
        clienteConsultas.invalidateQueries({
          queryKey: [...CLAVE_PACKS, 'lista'],
        }),
        // Si pasó a exclusivo, ya no lleva precio minorista (E3-H5 criterio 2)
        clienteConsultas.invalidateQueries({
          queryKey: clavePreciosPack(guardado.id),
        }),
      ]);
      if (pack) {
        reset(packAFormulario(guardado));
        toast.success(`Guardamos los cambios de ${guardado.nombre}.`);
        return;
      }
      toast.success(`Creamos el pack ${guardado.nombre}.`);
      router.replace(urlPack(guardado.id));
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        {titulo}
        <div className="flex gap-3 max-lg:hidden">
          <AccionesPack formulario={idFormulario} enviando={isSubmitting} />
        </div>
      </div>
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <div className="grid items-start gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_372px]">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <form
            id={idFormulario}
            onSubmit={handleSubmit(enviar)}
            noValidate
            aria-label={pack ? 'Editar pack' : 'Pack nuevo'}
            className="flex flex-col gap-4 lg:gap-6"
          >
            <Tarjeta titulo="Datos del pack">
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 xl:grid-cols-4">
                <CampoFormulario
                  id="pack-nombre"
                  etiqueta="Nombre"
                  obligatorio
                  error={errors.nombre?.message}
                  className="col-span-2 xl:col-span-4"
                >
                  {(propsControl) => (
                    <Input
                      {...propsControl}
                      autoComplete="off"
                      {...register('nombre')}
                    />
                  )}
                </CampoFormulario>
                <CampoFormulario
                  id="pack-sku"
                  etiqueta="SKU"
                  obligatorio
                  error={errors.sku?.message}
                  className="col-span-2"
                >
                  {(propsControl) => (
                    <Input
                      {...propsControl}
                      autoComplete="off"
                      {...register('sku')}
                    />
                  )}
                </CampoFormulario>
                <CampoFormulario
                  id="pack-inicio"
                  etiqueta="Vigente desde"
                  error={errors.fechaInicioVigencia?.message}
                  className="max-sm:col-span-2"
                >
                  {(propsControl) => (
                    <Controller
                      control={control}
                      name="fechaInicioVigencia"
                      render={({ field }) => (
                        <SelectorFecha
                          ref={field.ref}
                          valor={field.value}
                          alCambiar={field.onChange}
                          desde={new Date(anio - 1, 0)}
                          hasta={new Date(anio + 5, 11, 31)}
                          mesInicial={new Date()}
                          control={propsControl}
                        />
                      )}
                    />
                  )}
                </CampoFormulario>
                <CampoFormulario
                  id="pack-fin"
                  etiqueta="Vigente hasta"
                  error={errors.fechaFinVigencia?.message}
                  className="max-sm:col-span-2"
                >
                  {(propsControl) => (
                    <Controller
                      control={control}
                      name="fechaFinVigencia"
                      render={({ field }) => (
                        <SelectorFecha
                          ref={field.ref}
                          valor={field.value}
                          alCambiar={field.onChange}
                          desde={new Date(anio - 1, 0)}
                          hasta={new Date(anio + 5, 11, 31)}
                          mesInicial={new Date()}
                          control={propsControl}
                        />
                      )}
                    />
                  )}
                </CampoFormulario>
              </div>
              <p className="texto-leyenda text-texto-secundario">
                La vigencia es opcional: sin fechas, el pack se muestra siempre.
              </p>
              <Controller
                control={control}
                name="exclusivo"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      id="pack-exclusivo"
                      ref={field.ref}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={errors.exclusivo ? true : undefined}
                      aria-describedby={
                        errors.exclusivo
                          ? 'pack-exclusivo-ayuda pack-exclusivo-error'
                          : 'pack-exclusivo-ayuda'
                      }
                    />
                    <div className="flex min-w-0 flex-col">
                      <label
                        htmlFor="pack-exclusivo"
                        className="texto-etiqueta text-texto-principal"
                      >
                        Exclusivo para profesionales
                      </label>
                      <span
                        id="pack-exclusivo-ayuda"
                        className="texto-leyenda text-texto-secundario"
                      >
                        Solo lo ven y compran peluqueros verificados
                      </span>
                      {errors.exclusivo?.message && (
                        <span
                          id="pack-exclusivo-error"
                          className="texto-pequeno text-destructive"
                        >
                          {errors.exclusivo.message}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              />
            </Tarjeta>
            <Tarjeta titulo="Descripción">
              <CampoFormulario
                id="pack-descripcion"
                etiqueta="Descripción del pack"
                obligatorio
                error={errors.descripcion?.message}
              >
                {(propsControl) => (
                  <Textarea
                    {...propsControl}
                    placeholder="Escribe la descripción"
                    className="min-h-28 rounded-md border-[1.5px] border-input bg-fondo-hueso px-4 py-3 texto-cuerpo shadow-none focus-visible:ring-ring/40 lg:texto-pequeno"
                    {...register('descripcion')}
                  />
                )}
              </CampoFormulario>
            </Tarjeta>
            <ComponentesPack
              control={control}
              register={register}
              errors={errors.componentes}
            />
          </form>
          {precios}
        </div>
        <aside
          aria-label="Fotos y disponibilidad"
          className="flex min-w-0 flex-col gap-4 lg:gap-6"
        >
          {lateral}
        </aside>
      </div>
      <div className="flex flex-col-reverse gap-3 lg:hidden">
        <AccionesPack formulario={idFormulario} enviando={isSubmitting} />
      </div>
    </div>
  );
}

/**
 * «Cancelar» vuelve a Packs sin guardar; «Guardar pack» envía el formulario aunque esté
 * fuera de él (atributo `form`). Figma 2065:2384.
 */
const AccionesPack = ({
  formulario,
  enviando,
}: {
  formulario: string;
  enviando: boolean;
}) => (
  <>
    <Button asChild variant="contorno" className="max-lg:min-h-10">
      <Link href="/panel/packs">Cancelar</Link>
    </Button>
    <Button
      type="submit"
      form={formulario}
      disabled={enviando}
      className="max-lg:min-h-10"
    >
      {enviando && <Spinner aria-hidden />}
      Guardar pack
    </Button>
  </>
);
