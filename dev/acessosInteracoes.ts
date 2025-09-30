import { drawInteractionChart, parseInteractionData } from '../src';
import jsonData from './data/access-interactions-data.json';

// Parseia os dados para converter strings de data em objetos Date
const data = parseInteractionData(jsonData);

// --- Exclusivo GITHUB pages
// Define o nome do seu repositório no GitHub
const NOME_DO_REPOSITORIO = 'dataviz-ppgi';
// Verifica se está rodando no GitHub Pages para definir o caminho base
const isGhPages = window.location.hostname.includes('github.io');
const basePath = isGhPages ? `/${NOME_DO_REPOSITORIO}/` : '/';
// ---

// Desenha o gráfico
drawInteractionChart('#interaction-chart', data, { basePath: basePath });
