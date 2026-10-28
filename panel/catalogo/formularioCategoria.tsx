'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import { Textarea } from '@/compartido/ui/textarea';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CLAVES_CATALOGO } from './consultasCatalogo';
import {
  CATEGORIA_VACIA,
  campoDelErrorCategoria,
  categoriaAFormulario,
  cuerpoEdicionCategoria,
  cuerpoNuevaCategoria,
  esquemaCategoria,
  opcionesDeCategoria,
  type FormularioCategoria,
  type SalidaCategoria,
} from './esquemaCatalogo';
import { AccionesPanelLateral, PanelLateral } from './panelLateral';
import { SelectorCategoriaPadre } from './selectorCategoriaPadre';

/** `null`: cerrado; sin `categoria`: nueva; con ella: edición. */
export type EdicionCategoria = { categoria?: CategoriaTienda } | null;

/**
 * Panel lateral para crear, editar o mover una categoría (E3-H4 criterios 2 y 3). Con una
 * categoría padre es una subcategoría. Figma no lo dibuja: sigue el de «Nueva cuenta de
 * personal».
 */
export function PanelCategoria({
  edicion,
  arbol,
  alCerrar,
}: {
  edicion: EdicionCategoria;
  arbol: CategoriaTienda[];
  alCerrar: () => void;
}) {
  const categoria = edicion?.categoria;
  return (
    <PanelLateral
      titulo={categoria ? 'Editar categoría' : 'Nueva categoría'}
      abierto={edicion !== null}
      alCambiarAbierto={(abierto) => !abierto && alCerrar()}
    >
      {/* Se monta al abrir: cada apertura parte de la categoría elegida */}
      {edicion && (
        <FormularioCategoriaPanel
          key={categoria?.id ?? 'nueva'}
          categoria={categoria}
          arbol={arbol}
          alTerminar={alCerrar}
        />
      )}
    </PanelLateral>
  );
}

function FormularioCategoriaPanel({
  categoria,
  arbol,
  alTerminar,
}: {
  categoria?: CategoriaTienda;
  arbol: CategoriaTienda[];
  alTerminar: () => void;
}) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioCategoria, unknown, SalidaCategoria>({
    resolver: zodResolver(esquemaCategoria),
    defaultValues: categoria
      ? categoriaAFormulario(categoria)
      : CATEGORIA_VACIA,
  });
  // Una categoría no puede ser su propio padre; si el padre elegido es una de sus
  // subcategorías, lo rechaza el backend (ciclo)
  const opciones = opcionesDeCategoria(arbol).filter(
    (opcion) => opcion.id !== categoria?.id,
  );

  const mostrarError = (fallo: ErrorDeApi) => {
    if (![400, 404, 409].includes(fallo.estado)) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelErrorCategoria(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaCategoria) => {
    setAviso(null);
    try {
      // POST y PATCH devuelven la fila guardada, sin subcategorías
      const guardada = exigir<Pick<CategoriaTienda, 'id' | 'nombre'>>(
        categoria
          ? await api.PATCH('/api/catalogo/categorias/{id}', {
              params: { path: { id: categoria.id } },
              body: cuerpoEdicionCategoria(datos),
            })
          : await api.POST('/api/catalogo/categorias', {
              body: cuerpoNuevaCategoria(datos),
            }),
      );
      await clienteConsultas.invalidateQueries({
        queryKey: CLAVES_CATALOGO.categorias,
      });
      toast.success(
        categoria
          ? `Guardamos los cambios de ${guardada.nombre}.`
          : `Creamos la categoría ${guardada.nombre}.`,
      );
      alTerminar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label={categoria ? 'Editar categoría' : 'Nueva categoría'}
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <CampoFormulario
        id="categoria-nombre"
        etiqueta="Nombre"
        error={errors.nombre?.message}
      >
        {(propsControl) => (
          <Input {...propsControl} autoComplete="off" {...register('nombre')} />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="categoria-descripcion"
        etiqueta="Descripción (opcional)"
        error={errors.descripcion?.message}
      >
        {(propsControl) => (
          <Textarea {...propsControl} {...register('descripcion')} />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="categoria-padre"
        etiqueta="Categoría padre"
        error={errors.padreId?.message}
      >
        {(propsControl) => (
          <Controller
            control={control}
            name="padreId"
            render={({ field }) => (
              <SelectorCategoriaPadre
                control={propsControl}
                ref={field.ref}
                opciones={opciones}
                valor={field.value}
                alCambiar={field.onChange}
                alSalir={field.onBlur}
              />
            )}
          />
        )}
      </CampoFormulario>
      <AccionesPanelLateral
        texto={categoria ? 'Guardar cambios' : 'Crear categoría'}
        enviando={isSubmitting}
        alCancelar={alTerminar}
      />
    </form>
  );
}
