import { drawPerformanceChart, parseInteractionData } from '../src';
import jsonData from './data/access-interactions-data.json';

// Parseia os dados para converter strings de data em objetos Date
const data = parseInteractionData(jsonData);

// Desenha o gráfico
drawPerformanceChart('#performance-chart', data);