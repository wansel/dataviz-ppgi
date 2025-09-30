import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Configuração exclusiva para o build da página de demonstração
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Define a pasta 'dev' como a raiz do projeto para este build
  root: 'dev',
  build: {
    // Define o diretório de saída para 'dist-demo' na raiz do projeto
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
  // Essencial para que os caminhos funcionem no GitHub Pages
  base: '/dataviz-ppgi/',
});