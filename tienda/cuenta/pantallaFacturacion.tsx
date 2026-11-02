'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { FormularioFacturacion } from './formularioFacturacion';
import { ListaFacturacion } from './listaFacturacion';

/**
 * Qué muestra el formulario: datos nuevos o un registro existente. `abierto` solo cuenta en
 * celular (en escritorio la tarjeta de datos nuevos siempre está). `version` lo vacía después
 * de guardar o cancelar.
 */
type Edicion =
  | { tipo: 'nueva'; abierto: boolean; version: number }
  | { tipo: 'editar'; registro: DatosFacturacionCuenta };

/** Adónde vuelve el foco al cerrar el formulario, para no dejarlo en `body`. */
type DestinoFoco = 'lista' | 'agregar';

/** 10b Datos de facturación (Figma 2066:3519 y 2070:2578, E9-H2). */
export function PantallaFacturacion() {
  const [edicion, setEdicion] = useState<Edicion>({
    tipo: 'nueva',
    abierto: false,
    version: 0,
  });
  /** Cada aumento lleva el foco al RUT («Agregar» o «Editar»); con 0 no lo mueve. */
  const [enfoque, setEnfoque] = useState(0);
  const destinoFoco = useRef<DestinoFoco | null>(null);
  const tituloLista = useRef<HTMLHeadingElement>(null);
  const botonAgregar = useRef<HTMLButtonElement>(null);

  const version = edicion.tipo === 'nueva' ? edicion.version : 0;
  const registro = edicion.tipo === 'editar' ? edicion.registro : undefined;
  const abierto = edicion.tipo === 'editar' || edicion.abierto;

  useEffect(() => {
    const destino = destinoFoco.current;
    destinoFoco.current = null;
    if (destino === 'agregar') botonAgregar.current?.focus();
    if (destino === 'lista') tituloLista.current?.focus();
  }, [edicion]);

  const agregar = () => {
    // Si ya está en datos nuevos, conserva lo escrito: solo abre y enfoca
    setEdicion(
      edicion.tipo === 'nueva'
        ? { ...edicion, abierto: true }
        : { tipo: 'nueva', abierto: true, version: version + 1 },
    );
    setEnfoque((n) => n + 1);
  };

  const cerrar = (destino: DestinoFoco | null) => {
    destinoFoco.current = destino;
    setEnfoque(0);
    setEdicion({ tipo: 'nueva', abierto: false, version: version + 1 });
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href={RUTAS.misDatos}
          className="flex min-h-10 items-center gap-1.5 self-start texto-etiqueta text-marca-profundo hover:underline md:hidden"
        >
          <ArrowLeft className="size-4.5 stroke-[1.75]" aria-hidden />
          Mi cuenta
        </Link>
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          Datos de facturación
        </h1>
      </div>
      <ListaFacturacion
        refTitulo={tituloLista}
        alAgregar={agregar}
        alEditar={(elegido) => {
          setEdicion({ tipo: 'editar', registro: elegido });
          setEnfoque((n) => n + 1);
        }}
        alEliminar={(eliminado) => {
          if (registro?.id === eliminado.id) cerrar(null);
        }}
      />
      <div className={cn(!abierto && 'hidden md:block')}>
        <FormularioFacturacion
          key={registro ? `editar-${registro.id}` : `nueva-${version}`}
          registro={registro}
          enfoque={enfoque}
          // Al cancelar datos nuevos (solo en celular) vuelve al botón que los abrió
          alCancelar={() => cerrar(registro ? 'lista' : 'agregar')}
          alGuardar={() => cerrar('lista')}
        />
      </div>
      {!abierto && (
        <Button
          ref={botonAgregar}
          variant="contorno"
          size="grande"
          className="w-full md:hidden"
          onClick={agregar}
        >
          Agregar datos de facturación
        </Button>
      )}
      <p className="texto-pequeno text-texto-secundario">
        Al pedir factura en el checkout eliges cuál usar. Una factura ya emitida
        conserva los datos que tenía al emitirse, aunque después los edites.
      </p>
    </>
  );
}
