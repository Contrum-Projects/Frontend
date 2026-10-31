'use client';

import { useState } from 'react';
import type { EntradaRegistrada } from '@/compartido/api/respuestas';
import { ConfirmacionEntrada } from './confirmacionEntrada';
import type { FormatoRecibido } from './esquemaEntrada';
import { FormularioEntrada } from './formularioEntrada';

interface Registro {
  entrada: EntradaRegistrada;
  formatos: FormatoRecibido[];
}

/**
 * «Nueva entrada de inventario» (E11-H2 criterios 2 y 3): el formulario y, al registrar, la
 * confirmación con los subtotales. «Registrar otra» vuelve a un formulario vacío.
 */
export function PantallaEntradaNueva() {
  const [registro, setRegistro] = useState<Registro | null>(null);

  if (!registro) {
    return (
      <FormularioEntrada
        alRegistrar={(entrada, formatos) => setRegistro({ entrada, formatos })}
      />
    );
  }
  return (
    <ConfirmacionEntrada
      entrada={registro.entrada}
      formatos={registro.formatos}
      alRegistrarOtra={() => setRegistro(null)}
    />
  );
}
