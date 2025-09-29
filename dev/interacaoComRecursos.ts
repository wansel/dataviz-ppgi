import { drawInteractionChart, parseInteractionData } from '../src';
import jsonData from './data/activity-monitor-data.json';

// Parseia os dados para converter strings de data em objetos Date
const data = parseInteractionData(jsonData);

// Desenha o gráfico
drawActivityMonitor('#activity-monitor-chart', data);