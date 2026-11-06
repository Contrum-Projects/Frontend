'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ErrorDeApi,
  errorDeApi,
  repartirErrores,
} from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { aFecha, SelectorFecha } from '@/tienda/cuenta/selectorFecha';
import { CampoArchivoFactura } from './campoArchivoFactura';
import { useRegistrarFactura } from './consultasFacturas';
import {
  CAMPOS_FACTURA,
  datosFactura,
  esquemaFactura,
  facturaInicial,
  type FormularioFactura as Formulario,
} from './esquemaFactura';

/** Hoy en la tienda (AAAA-MM-DD): fecha por defecto y tope del calendario. El backend lo revisa. */
const hoyEnChile = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(
    new Date(),
  );

/**
 * E9-H3, criterios 2 y 3 · Folio, fecha de emisión y PDF de la factura (Figma 2050:2078; celular
 * 2051:1443). Los mensajes del backend (folio repetido, archivo que no es PDF…) quedan junto a su
 * campo, sin perder lo escrito ni el archivo elegido.
 */
export function FormularioFactura({
  codigoPedido,
  alRegistrar,
}: {
  codigoPedido: string;
  alRegistrar: () => void;
}) {
  const id = useId();
  const [hoy] = useState(hoyEnChile);
  const [aviso, setAviso] = useState<string | null>(null);
  const registrar = useRegistrarFactura(codigoPedido);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquemaFactura),
    defaultValues: facturaInicial(hoy),
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    // 400, 409 y 413 traen mensajes para la persona; el resto, el genérico de su estado
    if (![400, 409, 413].includes(fallo.estado)) {
      setAviso(fallo.message);
      return;
    }
    const { porCampo, generales } = repartirErrores(fallo, CAMPOS_FACTURA);
    for (const [campo, mensaje] of porCampo) {
      setError(
        campo,
        { type: 'server', message: mensaje },
        { shouldFocus: true },
      );
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (formulario: Formulario) => {
    setAviso(null);
    try {
      const factura = await registrar.mutateAsync(datosFactura(formulario));
      toast.success(
        `Registraste la factura n.º ${factura.folio} del pedido ${factura.codigoPedido}.`,
      );
      alRegistrar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Registrar factura"
      className="flex flex-col gap-4 lg:gap-3"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <CampoFormulario
          id={`${id}-folio`}
          etiqueta="Folio"
          error={errors.folio?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              {...register('folio')}
              inputMode="numeric"
              autoComplete="off"
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id={`${id}-fecha`}
          etiqueta="Fecha de emisión"
          error={errors.fechaEmision?.message}
        >
          {(propsControl) => (
            <Controller
              control={control}
              name="fechaEmision"
              render={({ field }) => (
                <SelectorFecha
                  ref={field.ref}
                  valor={field.value}
                  alCambiar={field.onChange}
                  desde={new Date(aFecha(hoy)!.getFullYear() - 1, 0)}
                  hasta={aFecha(hoy)!}
                  control={propsControl}
                />
              )}
            />
          )}
        </CampoFormulario>
      </div>
      <CampoFormulario
        id={`${id}-archivo`}
        etiqueta="Archivo de la factura"
        error={errors.archivo?.message}
      >
        {(propsControl) => (
          <Controller
            control={control}
            name="archivo"
            render={({ field }) => (
              <CampoArchivoFactura
                ref={field.ref}
                archivo={field.value}
                alCambiar={field.onChange}
                alSalir={field.onBlur}
                control={propsControl}
              />
            )}
          />
        )}
      </CampoFormulario>
      <p className="texto-leyenda text-texto-secundario max-lg:hidden">
        Al registrarla, el cliente podrá descargarla desde su pedido.
      </p>
      <Button
        type="submit"
        size="grande"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Spinner aria-hidden />}
        Registrar factura
      </Button>
    </form>
  );
}
