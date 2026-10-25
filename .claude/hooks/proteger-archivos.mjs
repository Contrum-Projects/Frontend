#!/usr/bin/env node
// Hook PreToolUse (Edit/Write): bloquea cambios a archivos que no se deben tocar a mano.
// Salida 2 = bloquear; el mensaje de stderr le explica a Claude qué hacer en su lugar.
import { readFileSync } from 'node:fs';
import path from 'node:path';

let entrada;
try {
  entrada = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const archivo = entrada?.tool_input?.file_path;
if (!archivo) process.exit(0);

const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
const relativo = path
  .relative(raiz, path.resolve(raiz, archivo))
  .split(path.sep)
  .join('/');
const nombre = path.basename(relativo);

function bloquear(motivo) {
  process.stderr.write(`Bloqueado: ${motivo}\n`);
  process.exit(2);
}

if (nombre.startsWith('.env') && nombre !== '.env.example') {
  bloquear(
    `${relativo} es la configuración local de cada integrante. Agrega la variable en compartido/config/ y en .env.example, y pide al usuario que complete su .env.local.`,
  );
}

if (relativo === 'compartido/api/esquema.d.ts') {
  bloquear(
    `${relativo} se genera desde el Swagger del backend. Corre pnpm api:tipos con el backend arriba; si falta un tipo de respuesta, agrégalo en compartido/api/respuestas.ts.`,
  );
}

if (relativo === 'pnpm-lock.yaml') {
  bloquear('pnpm-lock.yaml se actualiza con pnpm add/remove, no a mano.');
}

if (relativo.startsWith('.next/') || relativo === 'next-env.d.ts') {
  bloquear(`${relativo} lo genera Next.js.`);
}

process.exit(0);
