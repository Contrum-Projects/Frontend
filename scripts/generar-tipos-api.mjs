#!/usr/bin/env node
/**
 * Genera compartido/api/esquema.d.ts desde el Swagger del backend (`/api/docs-json`).
 *
 *   pnpm api:tipos                       # usa API_URL de .env.local o http://localhost:3000
 *   API_URL=http://otro:3000 pnpm api:tipos
 *
 * El backend tiene que estar corriendo fuera de producción (ahí Swagger está apagado).
 * El archivo generado se versiona: así la CI y quien no tenga el backend arriba compilan igual.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import openapiTS, { astToString } from 'openapi-typescript';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
nextEnv.loadEnvConfig(raiz);

const apiUrl = (process.env.API_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);
const origen = `${apiUrl}/api/docs-json`;
const destino = path.join(raiz, 'compartido', 'api', 'esquema.d.ts');

let documento;
try {
  const respuesta = await fetch(origen);
  if (!respuesta.ok) throw new Error(`respondió ${respuesta.status}`);
  documento = await respuesta.json();
} catch (error) {
  console.error(
    `No se pudo leer el Swagger en ${origen} (${error.message}).\n` +
      'Levanta el backend con `pnpm start:dev` en su repositorio o define API_URL.',
  );
  process.exit(1);
}

const ast = await openapiTS(documento, {
  // Sin esquema de respuesta, el cuerpo queda como `unknown` (no como `never`)
  defaultNonNullable: false,
});

const encabezado = `/**
 * NO EDITAR: generado con \`pnpm api:tipos\` desde ${origen.replace(apiUrl, '<API_URL>')}.
 * Versión de la API: ${documento.info?.version ?? '¿?'}. Rutas: ${Object.keys(documento.paths ?? {}).length}.
 */\n\n`;

await writeFile(destino, encabezado + astToString(ast));
console.log(
  `Tipos de la API actualizados: ${path.relative(raiz, destino)} (${Object.keys(documento.paths ?? {}).length} rutas).`,
);
