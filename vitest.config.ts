import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Suite minima para a logica pura do projeto (calculo CVSS, utilitarios de
// Markdown/TODO, estado de projeto): valida funcoes criticas sem UI
// cobre apenas a camada de calculo e manipulacao pura de dados.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
