/**
 * Rutas simuladas de regiones y comunas (docs/api-simulada.md).
 *
 * SCRUM-97 · Las direcciones guardan la comuna por su código CUT, pero el backend no tiene una
 * ruta para listarlas (y su base aún no carga las comunas). Forma propuesta al backend, anotada
 * en docs/historias/SCRUM-97.md:
 *
 *   GET /ubicaciones/regiones                     → UbicacionOficial[] (de norte a sur)
 *   GET /ubicaciones/regiones/:codigoCut/comunas  → UbicacionOficial[] (por nombre); 404 si la
 *                                                   región no existe
 *
 * Las regiones son las de prisma/seed.ts del backend. Las comunas son solo una muestra real de
 * la lista oficial (CUT), para probar la pantalla: las demás regiones responden una lista vacía.
 */
import type { UbicacionOficial } from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';

const REGIONES: UbicacionOficial[] = [
  { codigoCut: '15', nombre: 'Arica y Parinacota' },
  { codigoCut: '01', nombre: 'Tarapacá' },
  { codigoCut: '02', nombre: 'Antofagasta' },
  { codigoCut: '03', nombre: 'Atacama' },
  { codigoCut: '04', nombre: 'Coquimbo' },
  { codigoCut: '05', nombre: 'Valparaíso' },
  { codigoCut: '13', nombre: 'Metropolitana de Santiago' },
  { codigoCut: '06', nombre: "Libertador General Bernardo O'Higgins" },
  { codigoCut: '07', nombre: 'Maule' },
  { codigoCut: '16', nombre: 'Ñuble' },
  { codigoCut: '08', nombre: 'Biobío' },
  { codigoCut: '09', nombre: 'La Araucanía' },
  { codigoCut: '14', nombre: 'Los Ríos' },
  { codigoCut: '10', nombre: 'Los Lagos' },
  { codigoCut: '11', nombre: 'Aysén del General Carlos Ibáñez del Campo' },
  { codigoCut: '12', nombre: 'Magallanes y de la Antártica Chilena' },
];

const COMUNAS: Record<string, UbicacionOficial[]> = {
  '05': [
    { codigoCut: '05801', nombre: 'Quilpué' },
    { codigoCut: '05101', nombre: 'Valparaíso' },
    { codigoCut: '05804', nombre: 'Villa Alemana' },
    { codigoCut: '05109', nombre: 'Viña del Mar' },
  ],
  '08': [
    { codigoCut: '08101', nombre: 'Concepción' },
    { codigoCut: '08110', nombre: 'Talcahuano' },
  ],
  '13': [
    { codigoCut: '13110', nombre: 'La Florida' },
    { codigoCut: '13114', nombre: 'Las Condes' },
    { codigoCut: '13119', nombre: 'Maipú' },
    { codigoCut: '13120', nombre: 'Ñuñoa' },
    { codigoCut: '13123', nombre: 'Providencia' },
    { codigoCut: '13201', nombre: 'Puente Alto' },
    { codigoCut: '13101', nombre: 'Santiago' },
    { codigoCut: '13132', nombre: 'Vitacura' },
  ],
};

export const rutasUbicaciones: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/ubicaciones/regiones',
    historia: 'SCRUM-97',
    responder: () => json(REGIONES),
  },
  {
    metodo: 'GET',
    ruta: '/ubicaciones/regiones/:codigoCut/comunas',
    historia: 'SCRUM-97',
    responder: ({ params }) =>
      REGIONES.some((region) => region.codigoCut === params.codigoCut)
        ? json(COMUNAS[params.codigoCut] ?? [])
        : errorSimulado(404, 'La región no existe.'),
  },
];
