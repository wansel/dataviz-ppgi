import { drawBarChart, drawLineChart } from '../src';

drawBarChart('#grafico1', [15, 30, 20, 40]);

drawLineChart('#grafico2', [
  { x: 0, y: 10 },
  { x: 1, y: 15 },
  { x: 2, y: 8 },
  { x: 3, y: 20 },
]);