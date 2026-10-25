import { connection } from 'next/server';
import { apiServidor } from '@/compartido/api/servidor';

async function apiConectada(): Promise<boolean> {
  try {
    const { data, response } = await apiServidor().GET('/api/salud');
    const salud = data as { estado?: string } | undefined;
    return response.ok && salud?.estado === 'ok';
  } catch {
    return false;
  }
}

/** Estado de GET /api/salud, leído en cada visita (no se guarda en caché). */
export async function EstadoApi() {
  await connection();

  if (await apiConectada()) {
    return (
      <p className="texto-pequeno text-muted-foreground">API conectada.</p>
    );
  }
  return (
    <p className="rounded-md bg-estado-aviso-fondo px-4 py-3 texto-pequeno text-estado-aviso-texto">
      No hay conexión con la API. Revisa que el backend esté corriendo y que
      API_URL apunte a él.
    </p>
  );
}
