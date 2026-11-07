'use client';

import { Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCupones } from './consultasCupones';
import { ListaCuponesCelular, TablaCupones } from './listaCupones';

export const RUTA_CUPONES = '/panel/cupones' as Route;
export const RUTA_CUPON_NUEVO = '/panel/cupones/nuevo' as Route;

/**
 * «Cupones» (SCRUM-150; sin diseño en Figma, sigue el listado de Campañas): cada cupón con su
 * descuento, a qué aplica, quién lo puede usar, vigencia, usos y lo descontado. Todo lo cuenta el
 * backend.
 */
export function PantallaCupones() {
  const consulta = useCupones();
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Cupones</h1>
        <Button asChild>
          <Link href={RUTA_CUPON_NUEVO}>
            <Plus aria-hidden className="lg:hidden" />
            Nuevo<span className="max-lg:sr-only"> cupón</span>
          </Link>
        </Button>
      </div>
      {consulta.isPending ? (
        <div aria-hidden className="flex flex-col gap-3">
          {[0, 1, 2].map((fila) => (
            <Skeleton key={fila} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : consulta.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      ) : consulta.data.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 texto-pequeno text-texto-secundario">
          Aún no hay cupones. Crea uno para dar un descuento en todo el pedido,
          en ciertos productos o en una marca.
        </p>
      ) : (
        <>
          <div className="rounded-lg border bg-card p-4 max-lg:hidden">
            <TablaCupones cupones={consulta.data} />
          </div>
          <div className="lg:hidden">
            <ListaCuponesCelular cupones={consulta.data} />
          </div>
        </>
      )}
    </div>
  );
}
