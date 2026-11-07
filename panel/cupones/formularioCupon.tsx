'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CuponPanel } from '@/compartido/api/respuestas';
import { ErrorDeApi, repartirErrores } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { TarjetaAlcance } from './alcanceCupon';
import { useGuardarCupon } from './consultasCupones';
import {
  CAMPOS_CUPON,
  CUPON_VACIO,
  datosDesde,
  esquemaCupon,
  type FormularioCupon as Valores,
  formularioDesde,
} from './esquemaCupon';
import { rutaCupon } from './listaCupones';
import { RUTA_CUPONES } from './pantallaCupones';
import {
  TarjetaCampana,
  TarjetaDescuento,
  TarjetaReglas,
} from './tarjetasCupon';

/**
 * Crear o editar un cupón (SCRUM-150; sin diseño en Figma, sigue el formulario de Campañas). El
 * backend valida las reglas y su mensaje queda junto a cada campo, sin perder lo escrito.
 */
export function FormularioCupon({ cupon }: { cupon: CuponPanel | null }) {
  const id = useId();
  const [idCupon, setIdCupon] = useState(cupon?.id ?? null);
  const [aviso, setAviso] = useState<{
    tipo: 'ok' | 'error';
    texto: string;
  } | null>(null);
  const guardar = useGuardarCupon();
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(esquemaCupon),
    defaultValues: cupon ? formularioDesde(cupon) : CUPON_VACIO,
  });

  const alGuardar = handleSubmit(async (valores) => {
    setAviso(null);
    try {
      const guardado = await guardar.mutateAsync({
        id: idCupon,
        datos: datosDesde(valores),
      });
      if (!idCupon)
        window.history.replaceState(null, '', rutaCupon(guardado.id));
      setIdCupon(guardado.id);
      reset(formularioDesde(guardado));
      setAviso({ tipo: 'ok', texto: 'Cupón guardado.' });
    } catch (error) {
      if (
        !(error instanceof ErrorDeApi) ||
        ![400, 409].includes(error.estado)
      ) {
        setAviso({ tipo: 'error', texto: (error as Error).message });
        return;
      }
      const { porCampo, generales } = repartirErrores(error, CAMPOS_CUPON);
      for (const [campo, mensaje] of porCampo) {
        setError(
          campo,
          { type: 'server', message: mensaje },
          { shouldFocus: true },
        );
      }
      if (generales.length > 0)
        setAviso({ tipo: 'error', texto: generales.join(' ') });
    }
  });

  const props = { id, control, register, errors };
  return (
    <form
      onSubmit={alGuardar}
      noValidate
      aria-label="Cupón"
      className="flex flex-col gap-4 lg:gap-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link
            href={RUTA_CUPONES}
            className="inline-flex w-fit items-center gap-1 texto-etiqueta text-marca-profundo hover:underline"
          >
            <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
            Cupones
          </Link>
          <h1 className="titulo-h2 text-texto-principal">
            {idCupon ? 'Editar cupón' : 'Nuevo cupón'}
          </h1>
        </div>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          Guardar cupón
          {isSubmitting && <Spinner aria-label="Guardando el cupón" />}
        </Button>
      </div>
      {aviso && (
        <Alert variant={aviso.tipo === 'ok' ? 'default' : 'destructive'}>
          <AlertDescription>{aviso.texto}</AlertDescription>
        </Alert>
      )}
      {cupon && cupon.usos > 0 && (
        <p className="texto-pequeno text-texto-secundario">
          Ya se usó en {cupon.usos} {cupon.usos === 1 ? 'pedido' : 'pedidos'}:
          los cambios solo valen para los pedidos nuevos.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <TarjetaDescuento {...props} />
          <TarjetaAlcance {...props} />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <TarjetaReglas {...props} />
          <TarjetaCampana {...props} />
        </div>
      </div>
    </form>
  );
}
