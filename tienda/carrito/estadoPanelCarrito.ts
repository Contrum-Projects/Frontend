'use client';

import { useSyncExternalStore } from 'react';

/*
 * Si el panel lateral del carrito está abierto. Lo abren el ícono del header y «Agregar al
 * carrito», que están en partes distintas de la página: por eso es un estado compartido, como
 * el carrito del navegador, y no un estado de un componente.
 */
let abierto = false;
const suscriptores = new Set<() => void>();

const emitir = () => suscriptores.forEach((avisar) => avisar());

const suscribir = (avisar: () => void) => {
  suscriptores.add(avisar);
  return () => suscriptores.delete(avisar);
};

export const abrirPanelCarrito = () => {
  if (abierto) return;
  abierto = true;
  emitir();
};

export const cerrarPanelCarrito = () => {
  if (!abierto) return;
  abierto = false;
  emitir();
};

export const usePanelCarritoAbierto = (): boolean =>
  useSyncExternalStore(
    suscribir,
    () => abierto,
    () => false,
  );
