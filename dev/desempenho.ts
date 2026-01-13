import { drawPerformanceChart, parsePerformanceData } from '../src';
import jsonData from './data/performance-data.json';
// dev/data/performance-data.json

console.log("Oi");
// Parseia os dados para converter strings de data em objetos Date
const data = parsePerformanceData(jsonData);

// --- Exclusivo GITHUB pages
// Define o nome do seu repositório no GitHub
const NOME_DO_REPOSITORIO = 'dataviz-ppgi';
// Verifica se está rodando no GitHub Pages para definir o caminho base
const isGhPages = window.location.hostname.includes('github.io');
const basePath = isGhPages ? `/${NOME_DO_REPOSITORIO}/` : '/';
// ---

// Desenha o gráfico
// drawInteractionChart('#interaction-chart', data, { basePath: basePath });
drawPerformanceChart('#performance-chart', data, {
  basePath: basePath,
  initialSort: {
    column: "name",
    order: "asc"
  }
});