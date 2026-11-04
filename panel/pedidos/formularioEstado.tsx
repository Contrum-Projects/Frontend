'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import type { CambioPermitido } from '@/compartido/api/respuestas';
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
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { etiquetaEstado } from '@/tienda/pedidos/estadoPedido';
import { useCambiarEstado } from './consultasPedidos';
import {
  campoDelError,
  cambioInicial,
  crearEsquemaCambioEstado,
  cuerpoCambioEstado,
  type FormularioCambioEstado as Formulario,
} from './esquemaCambioEstado';

/** «En preparación», o «Volver a Pagado» si el cambio corrige un paso. */
const textoCambio = ({ estado, sentido }: CambioPermitido) =>
  sentido === 'retroceso'
    ? `Volver a ${etiquetaEstado(estado)}`
    : etiquetaEstado(estado);

/**
 * E8-H2, criterio 2 · «Cambiar estado» (Figma 2028:971; celular 2024:333). Solo ofrece los cambios
 * que el backend permite desde el estado actual (criterio 3: tras «listo para retiro» llega
 * «retirado»). Volver atrás pide comentario y despachar pide el código de Chilexpress (E7-H3).
 * Los mensajes del backend quedan junto a su campo, sin perder lo escrito.
 */
export function FormularioEstado({
  codigoPedido,
  cambios,
}: {
  codigoPedido: string;
  /** No vacío: sin cambios el formulario no se muestra. */
  cambios: CambioPermitido[];
}) {
  const idTitulo = useId();
  const [aviso, setAviso] = useState<string | null>(null);
  const cambiar = useCambiarEstado(codigoPedido);
  const esquema = useMemo(() => crearEsquemaCambioEstado(cambios), [cambios]);
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: cambioInicial(cambios),
  });
  const estado = useWatch({ control, name: 'estado' });
  const cambio = cambios.find((opcion) => opcion.estado === estado);
  const comentarioObligatorio = cambio?.sentido === 'retroceso';

  const mostrarError = (fallo: ErrorDeApi) => {
    // 400 y 409 traen mensajes para la persona; el resto, el genérico de su estado
    if (fallo.estado !== 400 && fallo.estado !== 409) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje);
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
  };

  const enviar = async (datos: Formulario) => {
    setAviso(null);
    try {
      const resultado = await cambiar.mutateAsync(
        cuerpoCambioEstado(datos, cambio),
      );
      toast.success(
        `El pedido ${resultado.codigoPublico} quedó «${etiquetaEstado(resultado.estado)}».`,
      );
      // El detalle vuelve con el estado nuevo y el padre arma otro formulario (key = estado)
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 id={idTitulo} className="texto-cuerpo-fuerte text-texto-principal">
        Cambiar estado
      </h3>
      <form
        onSubmit={handleSubmit(enviar)}
        noValidate
        aria-labelledby={idTitulo}
        className="flex flex-col gap-3"
      >
        {aviso && (
          <Alert variant="destructive">
            <AlertDescription>{aviso}</AlertDescription>
          </Alert>
        )}
        {/* Figma no le pone etiqueta: la da el título «Cambiar estado» */}
        <div className="flex flex-col gap-1.5">
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(valor) => {
                  field.onChange(valor);
                  // Otro cambio pide otros datos: los errores anteriores ya no aplican
                  clearErrors();
                  setAviso(null);
                }}
              >
                <SelectTrigger
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-labelledby={idTitulo}
                  aria-invalid={errors.estado ? true : undefined}
                  aria-describedby={
                    errors.estado ? `${idTitulo}-estado-error` : undefined
                  }
                  className="bg-fondo-hueso"
                >
                  <SelectValue placeholder="Elige el estado nuevo" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="max-w-(--radix-select-trigger-width)"
                >
                  {cambios.map((opcion) => (
                    <SelectItem key={opcion.estado} value={opcion.estado}>
                      {textoCambio(opcion)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.estado && (
            <p
              id={`${idTitulo}-estado-error`}
              className="texto-pequeno text-destructive"
            >
              {errors.estado.message}
            </p>
          )}
        </div>
        {cambio?.pideCodigoSeguimiento && (
          <CampoFormulario
            id={`${idTitulo}-codigo`}
            etiqueta="Código de seguimiento de Chilexpress"
            error={errors.codigoSeguimiento?.message}
            obligatorio
          >
            {(propsControl) => (
              <Input
                {...propsControl}
                {...register('codigoSeguimiento')}
                inputMode="numeric"
                autoComplete="off"
              />
            )}
          </CampoFormulario>
        )}
        <CampoFormulario
          id={`${idTitulo}-comentario`}
          etiqueta={
            comentarioObligatorio ? 'Comentario' : 'Comentario (opcional)'
          }
          error={errors.comentario?.message}
          obligatorio={comentarioObligatorio}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              {...register('comentario')}
              placeholder="Ej.: falta confirmar tono"
              autoComplete="off"
            />
          )}
        </CampoFormulario>
        <Button
          type="submit"
          size="grande"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner aria-hidden />}
          {cambio?.avisaAlCliente ? 'Guardar y avisar al cliente' : 'Guardar'}
        </Button>
      </form>
    </div>
  );
}
