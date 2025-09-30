// vite.config.demo.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

// Assumindo que seu ficheiro tenha uma estrutura parecida com esta
export default defineConfig({
  // >>> ADICIONE ESTA LINHA <<<
  // Define o caminho base para o deploy no GitHub Pages.
  // Deve ser o nome do seu repositório, com barras no início e no fim.
  base: '/dataviz-ppgi/',

  // O resto da sua configuração...
  build: {
    outDir: 'dist-demo', // Exemplo de diretório de saída
  },
  
  // Se tiver outras configurações, elas permanecem aqui
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});