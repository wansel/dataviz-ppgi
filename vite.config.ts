import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
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
    // Importante: por padrão, no modo "lib", o CSS é extraído para um arquivo separado (ex: style.css).
    // Se você quer que o CSS seja injetado diretamente no arquivo JS (via uma tag <style>),
    // você pode descomentar a linha abaixo. No entanto, um arquivo CSS separado é geralmente melhor para os usuários da sua biblioteca.
    cssCodeSplit: false,
  },
  server: {
    open: '/dev/index.html', // Abre direto a página de teste
  }
});