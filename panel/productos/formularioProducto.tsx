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
import type { ProductoPanel } from '@/compartido/api/respuestas';
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
import { Switch } from '@/compartido/ui/switch';
import { Textarea } from '@/compartido/ui/textarea';
import { useCategorias, useMarcas } from '@/panel/catalogo/consultasCatalogo';
import { opcionesDeCategoria } from '@/panel/catalogo/esquemaCatalogo';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CLAVE_PRODUCTOS, claveProducto } from './consultasProductos';
import {
  PRODUCTO_VACIO,
  campoDelErrorProducto,
  cuerpoProducto,
  esquemaProducto,
  productoAFormulario,
  type FormularioProducto,
  type SalidaProducto,
} from './esquemaProducto';
import { OrigenDescripcionProducto } from './etiquetasProducto';
import { urlProducto } from './listaProductos';

/** Tarjeta de Figma (P3 2029:742): superficie, borde y título. */
export const Tarjeta = ({
  titulo,
  extra,
  children,
}: {
  titulo: string;
  extra?: ReactNode;
  children: ReactNode;
}) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={idTitulo} className="texto-cuerpo-fuerte text-texto-principal">
          {titulo}
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );
};

/**
 * Datos y descripción del producto (Figma P3 2029:742 y 2029:763, E3-H1 criterios 2 y 4). Los
 * formatos, las fotos y la sugerencia de IA llegan con SCRUM-101, 102 y 132.
 */
export function FormularioProductoPanel({
  producto,
  titulo,
}: {
  /** Sin producto: nuevo. */
  producto?: ProductoPanel;
  /** El título de la página con lo que lo acompaña (estado del producto). */
  titulo: ReactNode;
}) {
  const router = useRouter();
  const clienteConsultas = useQueryClient();
  const marcas = useMarcas();
  const categorias = useCategorias();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioProducto, unknown, SalidaProducto>({
    resolver: zodResolver(esquemaProducto),
    defaultValues: producto ? productoAFormulario(producto) : PRODUCTO_VACIO,
  });

  // Solo hay marcas activas en la lista: la de un producto con su marca desactivada se agrega
  // para no mostrar el campo vacío (al guardar, el backend avisa que está desactivada)
  const opcionesMarca = [...(marcas.data ?? [])];
  if (
    producto?.marca &&
    !opcionesMarca.some((marca) => marca.id === producto.marca?.id)
  ) {
    opcionesMarca.push({ ...producto.marca, activa: false });
  }
  const opcionesCategoria = opcionesDeCategoria(categorias.data ?? []);

  const mostrarError = (fallo: ErrorDeApi) => {
    if (![400, 404].includes(fallo.estado)) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelErrorProducto(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaProducto) => {
    setAviso(null);
    try {
      const guardado = exigir<ProductoPanel>(
        producto
          ? await api.PATCH('/api/catalogo/productos/{id}', {
              params: { path: { id: producto.id } },
              body: cuerpoProducto(datos),
            })
          : await api.POST('/api/catalogo/productos', {
              body: cuerpoProducto(datos),
            }),
      );
      clienteConsultas.setQueryData(claveProducto(guardado.id), guardado);
      await clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_PRODUCTOS, 'lista'],
      });
      if (producto) {
        reset(productoAFormulario(guardado));
        toast.success(`Guardamos los cambios de ${guardado.nombre}.`);
        return;
      }
      toast.success(`Creamos el producto ${guardado.nombre}.`);
      router.replace(urlProducto(guardado.id));
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label={producto ? 'Editar producto' : 'Producto nuevo'}
      className="flex flex-col gap-4 lg:gap-6"
    >
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        {titulo}
        <div className="flex gap-3 max-lg:hidden">
          <AccionesProducto enviando={isSubmitting} />
        </div>
      </div>
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <Tarjeta titulo="Datos del producto">
        <CampoFormulario
          id="producto-nombre"
          etiqueta="Nombre"
          obligatorio
          error={errors.nombre?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              autoComplete="off"
              {...register('nombre')}
            />
          )}
        </CampoFormulario>
        <div className="grid grid-cols-2 gap-x-3">
          <CampoFormulario
            id="producto-marca"
            etiqueta="Marca"
            obligatorio
            error={errors.marcaId?.message}
          >
            {(propsControl) => (
              <Controller
                control={control}
                name="marcaId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      {...propsControl}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue placeholder="Elige una marca" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {opcionesMarca.map((marca) => (
                        <SelectItem key={marca.id} value={String(marca.id)}>
                          {marca.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </CampoFormulario>
          <CampoFormulario
            id="producto-categoria"
            etiqueta="Categoría"
            obligatorio
            error={errors.categoriaId?.message}
          >
            {(propsControl) => (
              <Controller
                control={control}
                name="categoriaId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      {...propsControl}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue placeholder="Elige una categoría" />
                    </SelectTrigger>
                    {/* No pasa del ancho de la página: las rutas largas hacen salto de línea */}
                    <SelectContent
                      position="popper"
                      className="max-w-(--radix-select-content-available-width)"
                    >
                      {opcionesCategoria.map((opcion) => (
                        <SelectItem key={opcion.id} value={String(opcion.id)}>
                          {opcion.ruta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </CampoFormulario>
        </div>
        <Controller
          control={control}
          name="exclusivo"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch
                id="producto-exclusivo"
                ref={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={errors.exclusivo ? true : undefined}
                aria-describedby={
                  errors.exclusivo
                    ? 'producto-exclusivo-ayuda producto-exclusivo-error'
                    : 'producto-exclusivo-ayuda'
                }
              />
              <div className="flex min-w-0 flex-col">
                <label
                  htmlFor="producto-exclusivo"
                  className="texto-etiqueta text-texto-principal"
                >
                  Exclusivo para profesionales
                </label>
                <span
                  id="producto-exclusivo-ayuda"
                  className="texto-leyenda text-texto-secundario"
                >
                  Solo lo ven y compran peluqueros verificados
                </span>
                {errors.exclusivo?.message && (
                  <span
                    id="producto-exclusivo-error"
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
      <Tarjeta
        titulo="Descripción"
        extra={
          producto && (
            <OrigenDescripcionProducto origen={producto.origenDescripcion} />
          )
        }
      >
        <CampoFormulario
          id="producto-descripcion"
          etiqueta="Descripción del producto"
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
      <div className="flex flex-col-reverse gap-3 lg:hidden">
        <AccionesProducto enviando={isSubmitting} />
      </div>
    </form>
  );
}

/** «Cancelar» vuelve al listado sin guardar; «Guardar producto» envía (Figma 2029:730). */
const AccionesProducto = ({ enviando }: { enviando: boolean }) => (
  <>
    <Button asChild variant="contorno">
      <Link href="/panel/productos">Cancelar</Link>
    </Button>
    <Button type="submit" disabled={enviando}>
      {enviando && <Spinner aria-hidden />}
      Guardar producto
    </Button>
  </>
);
