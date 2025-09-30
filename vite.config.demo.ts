// vite.config.demo.ts (VERSÃO CORRIGIDA)

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'; // Não precisa de config aqui
import { resolve } from 'path';
import { globSync } from 'glob';

// Esta lógica já funciona a partir da raiz do projeto, está perfeita.
const htmlFiles = globSync('dev/**/*.html').map(file => [
  file.slice(file.lastIndexOf('/') + 1, file.length - 5),
  resolve(process.cwd(), file)
]);

export default defineConfig({
  // O plugin do Tailwind agora irá encontrar o config automaticamente,
  // pois estamos a correr a partir da raiz do projeto.
  plugins: [
    tailwindcss(),
  ],

  // Removido 'root: "dev"'. Agora operamos a partir da raiz '.' (padrão).
  // root: 'dev', // REMOVIDO

  build: {
    //  caminho de saída agora é relativo à raiz do projeto.
    outDir: 'dist-demo', // Era '../dist-demo'
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(htmlFiles),
    },
  },
  
  // O caminho base para o GitHub Pages continua correto.
  base: '/dataviz-ppgi/',
  
  publicDir: 'public',
});