'use client';

import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { EntradaRegistrada } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { formatearPesosNetos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { nombreDelFormato } from '@/panel/packs/buscadorFormatos';
import { Tarjeta } from '@/panel/productos/formularioProducto';
import { nombreUbicacion } from './consultasEntradas';
import { textoDocumento, type FormatoRecibido } from './esquemaEntrada';

const ENCABEZADO =
  'h-auto px-2 py-2 texto-leyenda whitespace-normal text-texto-secundario';
const CELDA =
  'px-2 py-3 align-top break-words whitespace-normal texto-pequeno text-texto-principal';
const CIFRA = `${CELDA} text-right tabular-nums`;

/** Un monto que el backend aún no entrega (pedido a SCRUM-37): se dice, no se calcula. */
const Monto = ({ valor }: { valor?: number }) =>
  valor === undefined ? (
    <>
      <span aria-hidden>—</span>
      <span className="sr-only">Sin dato</span>
    </>
  ) : (
    formatearPesosNetos(valor)
  );

/**
 * Confirmación del registro (E11-H2 criterio 2): la entrada como la respondió el backend, con el
 * subtotal de cada formato y los totales. Los nombres de los formatos son los del formulario
 * (la respuesta solo trae su id).
 */
export function ConfirmacionEntrada({
  entrada,
  formatos,
  alRegistrarOtra,
}: {
  entrada: EntradaRegistrada;
  formatos: FormatoRecibido[];
  alRegistrarOtra: () => void;
}) {
  const titulo = useRef<HTMLHeadingElement>(null);
  // El formulario desaparece: el foco pasa al título para que se lea la confirmación
  useEffect(() => titulo.current?.focus(), []);
  const formatoDe = (id: number) =>
    formatos.find((formato) => formato.formatoId === id);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-2">
        <h1
          ref={titulo}
          tabIndex={-1}
          className="flex items-center gap-2 titulo-h2 text-texto-principal outline-none"
        >
          <CircleCheck
            aria-hidden
            className="size-6 shrink-0 text-marca-profundo"
            strokeWidth={1.75}
          />
          Entrada registrada
        </h1>
        <p className="texto-pequeno text-texto-secundario">
          {textoDocumento(entrada)} de {entrada.proveedor.razonSocial}, recibida
          el {formatearDia(entrada.fechaRecepcion)} en{' '}
          {nombreUbicacion(entrada.ubicacion)}.
        </p>
        {entrada.observacion && (
          <p className="texto-pequeno break-words text-texto-secundario">
            Observación: {entrada.observacion}
          </p>
        )}
      </div>
      <Tarjeta titulo="Formatos recibidos">
        <Table
          aria-label="Formatos de la entrada registrada"
          className="table-fixed"
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={ENCABEZADO}>Formato</TableHead>
              <TableHead className={`w-16 text-right lg:w-24 ${ENCABEZADO}`}>
                Cantidad
              </TableHead>
              <TableHead
                className={`w-32 text-right max-lg:hidden ${ENCABEZADO}`}
              >
                Costo unitario neto
              </TableHead>
              <TableHead className={`w-24 text-right lg:w-32 ${ENCABEZADO}`}>
                Subtotal neto
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entrada.detalles.map((detalle) => {
              const formato = formatoDe(detalle.formatoId);
              return (
                <TableRow
                  key={detalle.formatoId}
                  className="hover:bg-transparent"
                >
                  <TableCell className={CELDA}>
                    {formato
                      ? nombreDelFormato(formato)
                      : `Formato ${detalle.formatoId}`}
                    {formato && (
                      <span className="block texto-leyenda text-texto-secundario">
                        {formato.sku}
                        <span className="lg:hidden">
                          {' · '}
                          {formatearPesosNetos(detalle.costoUnitarioNeto)} c/u
                        </span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={CIFRA}>{detalle.cantidad}</TableCell>
                  <TableCell className={`${CIFRA} max-lg:hidden`}>
                    {formatearPesosNetos(detalle.costoUnitarioNeto)}
                  </TableCell>
                  <TableCell className={CIFRA}>
                    <Monto valor={detalle.subtotalNeto} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="bg-transparent">
            <TableRow className="hover:bg-transparent">
              <TableCell className={`${CELDA} texto-etiqueta`}>Total</TableCell>
              <TableCell className={`${CIFRA} texto-etiqueta`}>
                {entrada.unidades ?? <Monto />}
              </TableCell>
              <TableCell className="max-lg:hidden" />
              <TableCell className={`${CIFRA} texto-etiqueta`}>
                <Monto valor={entrada.costoNetoTotal} />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Tarjeta>
      <div className="flex flex-col-reverse gap-3 lg:flex-row">
        <Button
          variant="contorno"
          className="max-lg:min-h-10"
          onClick={alRegistrarOtra}
        >
          Registrar otra entrada
        </Button>
        <Button asChild className="max-lg:min-h-10">
          <Link href="/panel/inventario/entradas">Ver entradas</Link>
        </Button>
      </div>
    </div>
  );
}
