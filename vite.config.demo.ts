import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { globSync } from 'glob';

// Encontra todos os arquivos .html dentro da pasta 'dev'
const htmlFiles = globSync('dev/**/*.html').map(file => [
  // Cria um nome para a entrada, ex: 'index' ou 'tempo-no-evento'
  file.slice(file.lastIndexOf('/') + 1, file.length - 5),
  // Cria o caminho absoluto para o arquivo, que o Vite precisa
  resolve(process.cwd(), file)
]);

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Define 'dev' como a raiz do projeto para este build
  root: 'dev',
  build: {
    // Define o diretório de saída na raiz do projeto
    outDir: '../dist-demo',
    emptyOutDir: true,
    rollupOptions: {
      // Informa ao Vite para construir todas as páginas HTML encontradas
      input: Object.fromEntries(htmlFiles),
    },
  },
  // Essencial para que os caminhos funcionem no GitHub Pages
  base: '/dataviz-ppgi/',
});