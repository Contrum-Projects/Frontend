import 'server-only';
import { connection } from 'next/server';
import { exigir } from '@/compartido/api/errores';
import { apiServidor } from '@/compartido/api/servidor';
import type { SlidePortada } from './destinoPortada';

/**
 * Slides de la portada del inicio (SCRUM-157), como visitante. Se piden en cada visita: un
 * cambio del panel se ve al recargar y el backend decide qué destinos siguen a la venta. Si la
 * API falla, la portada queda vacía y el inicio muestra el banner del pack.
 */
export async function leerPortada(): Promise<SlidePortada[]> {
  await connection();
  try {
    return exigir<SlidePortada[]>(await apiServidor().GET('/api/portada'));
  } catch {
    return [];
  }
}
