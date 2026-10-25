import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// `server-only` corta el build si un archivo de servidor llega al navegador; en las pruebas no aplica
vi.mock('server-only', () => ({}));

afterEach(() => {
  cleanup();
});
