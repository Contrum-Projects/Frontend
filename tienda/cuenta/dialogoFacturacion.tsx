'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
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
import { CamposFacturacion } from './camposFacturacion';
import { CLAVES_CUENTA } from './consultasCuenta';
import {
  campoDelErrorFacturacion,
  cuerpoEdicionFacturacion,
  cuerpoNuevaFacturacion,
  esquemaFacturacion,
  FACTURACION_VACIA,
  facturacionAFormulario,
  type FormularioFacturacion,
  type SalidaFacturacion,
} from './esquemaFacturacion';

interface DialogoFacturacionProps {
  /** El registro que se edita; sin él, se agregan datos nuevos. */
  registro?: DatosFacturacionCuenta;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  /** Los datos guardados, cuando la lista ya está al día (el checkout los deja elegidos). */
  alGuardar?: (registro: DatosFacturacionCuenta) => void;
}

/**
 * Agregar o editar datos de facturación sin salir del checkout (E9-H1). Figma no dibuja el
 * diálogo: usa los campos y las reglas de 10b Datos de facturación (E9-H2), como el diálogo de
 * direcciones.
 */
export function DialogoFacturacion({
  registro,
  abierto,
  alCambiarAbierto,
  alGuardar,
}: DialogoFacturacionProps) {
  const titulo = registro
    ? 'Editar datos de facturación'
    : 'Agregar datos de facturación';
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="titulo-h3 text-texto-principal">
            {titulo}
          </DialogTitle>
        </DialogHeader>
        {/* Se monta al abrir: cada apertura parte de los datos guardados */}
        {abierto && (
          <Formulario
            titulo={titulo}
            registro={registro}
            alTerminar={() => alCambiarAbierto(false)}
            alGuardar={alGuardar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({
  titulo,
  registro,
  alTerminar,
  alGuardar,
}: {
  titulo: string;
  registro?: DatosFacturacionCuenta;
  alTerminar: () => void;
  alGuardar?: (registro: DatosFacturacionCuenta) => void;
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
  } = useForm<FormularioFacturacion, unknown, SalidaFacturacion>({
    resolver: zodResolver(esquemaFacturacion),
    defaultValues: registro
      ? facturacionAFormulario(registro)
      : FACTURACION_VACIA,
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelErrorFacturacion(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaFacturacion) => {
    setAviso(null);
    try {
      const guardado = exigir<DatosFacturacionCuenta>(
        registro
          ? await api.PATCH('/api/cuentas/yo/facturacion/{id}', {
              params: { path: { id: registro.id } },
              body: cuerpoEdicionFacturacion(datos),
            })
          : await api.POST('/api/cuentas/yo/facturacion', {
              body: cuerpoNuevaFacturacion(datos),
            }),
      );
      await clienteConsultas.invalidateQueries({
        queryKey: CLAVES_CUENTA.facturacion,
      });
      alGuardar?.(guardado);
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
      aria-label={titulo}
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
      <CamposFacturacion
        register={register}
        control={control}
        setValue={setValue}
        errors={errors}
      />
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Guardar
        </Button>
      </DialogFooter>
    </form>
  );
}
