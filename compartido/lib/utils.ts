import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** Estilos de texto de Figma definidos como utilidades en app/globals.css. */
const ESTILOS_DE_TEXTO = [
  'display-escritorio',
  'display-celular',
  'titulo-h1',
  'titulo-h2',
  'titulo-h3',
  'texto-cuerpo',
  'texto-cuerpo-fuerte',
  'texto-pequeno',
  'texto-etiqueta',
  'texto-leyenda',
  'texto-precio',
  'texto-sobretitulo',
];

const unirClases = extendTailwindMerge<'estilo-texto'>({
  extend: {
    classGroups: { 'estilo-texto': ESTILOS_DE_TEXTO },
    conflictingClassGroups: {
      'estilo-texto': [
        'font-size',
        'leading',
        'tracking',
        'font-weight',
        'font-family',
      ],
    },
  },
});

/** Une clases de Tailwind resolviendo conflictos (`cn('p-4', condicion && 'p-6')`). */
export function cn(...entradas: ClassValue[]) {
  return unirClases(clsx(entradas));
}
