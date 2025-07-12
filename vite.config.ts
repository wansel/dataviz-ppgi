import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // permite rodar a partir da raiz do projeto
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MinhaBibliotecaD3',
      fileName: (format) => `minha-biblioteca-d3.${format}.js`,
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: {
          d3: 'd3',
        },
      },
    },
  },
  server: {
    open: '/dev/index.html', // Abre direto a página de teste
  }
});