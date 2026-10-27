'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/compartido/ui/dialog';
import { Spinner } from '@/compartido/ui/spinner';
import { CamposDireccion } from './camposDireccion';
import { CLAVES_CUENTA } from './consultasCuenta';
import { EliminarDireccion } from './eliminarDireccion';
import {
  campoDelError,
  cuerpoEdicionDireccion,
  cuerpoNuevaDireccion,
  DIRECCION_VACIA,
  direccionAFormulario,
  esquemaDireccion,
  type FormularioDireccion,
  type SalidaDireccion,
} from './esquemaDireccion';

interface DialogoDireccionProps {
  /** La dirección que se edita; sin ella, se agrega una nueva. */
  direccion?: DireccionCuenta;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}

/**
 * Agregar o editar una dirección (E1-H5). Figma no tiene este diálogo: usa los campos y
 * componentes de los demás formularios. Al guardar o eliminar se vuelve a pedir la lista,
 * porque el backend decide cuál queda como principal.
 */
export function DialogoDireccion({
  direccion,
  abierto,
  alCambiarAbierto,
}: DialogoDireccionProps) {
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="titulo-h3 text-texto-principal">
            {direccion ? 'Editar dirección' : 'Agregar dirección'}
          </DialogTitle>
        </DialogHeader>
        {/* Se monta al abrir: cada apertura parte de los datos guardados */}
        {abierto && (
          <FormularioDireccion
            direccion={direccion}
            alTerminar={() => alCambiarAbierto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormularioDireccion({
  direccion,
  alTerminar,
}: {
  direccion?: DireccionCuenta;
  alTerminar: () => void;
}) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioDireccion, unknown, SalidaDireccion>({
    resolver: zodResolver(esquemaDireccion),
    defaultValues: direccion
      ? direccionAFormulario(direccion)
      : DIRECCION_VACIA,
  });

  const terminar = async () => {
    await clienteConsultas.invalidateQueries({
      queryKey: CLAVES_CUENTA.direcciones,
    });
    alTerminar();
  };

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaDireccion) => {
    setAviso(null);
    try {
      exigir<DireccionCuenta>(
        direccion
          ? await api.PATCH('/api/cuentas/yo/direcciones/{id}', {
              params: { path: { id: direccion.id } },
              body: cuerpoEdicionDireccion(datos),
            })
          : await api.POST('/api/cuentas/yo/direcciones', {
              body: cuerpoNuevaDireccion(datos),
            }),
      );
      await terminar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label={direccion ? 'Editar dirección' : 'Agregar dirección'}
      className="flex flex-col gap-4"
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
      <CamposDireccion
        nueva={!direccion}
        register={register}
        control={control}
        setValue={setValue}
        errors={errors}
      />
      <DialogFooter className="sm:items-center">
        {direccion && (
          <EliminarDireccion direccion={direccion} alEliminar={terminar} />
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Guardar dirección
        </Button>
      </DialogFooter>
    </form>
  );
}
