import { drawInteractionChart, parseInteractionData } from '../src';
import jsonData from './data/interactions-data.json';

// Parseia os dados para converter strings de data em objetos Date
const data = parseInteractionData(jsonData);

// Desenha o gráfico
drawInteractionChart('#interaction-chart', data);
