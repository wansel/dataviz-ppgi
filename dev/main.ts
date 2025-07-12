import { drawBarChart, drawLineChart, drawWeightsChart } from '../src';

drawBarChart('#grafico1', [15, 30, 20, 40]);

drawLineChart('#grafico2', [
  { x: 0, y: 10 },
  { x: 1, y: 15 },
  { x: 2, y: 8 },
  { x: 3, y: 20 },
]);

drawWeightsChart('#grafico3', [
  { key: '1', title: 'Peso 1', description: 'Descrição 1', weight: 10, img: 'img1.svg' },
  { key: '2', title: 'Peso 2', description: 'Descrição 2', weight: 20, img: 'img2.svg' },
  { key: '3', title: 'Peso 3', description: 'Descrição 3', weight: 5, img: 'img3.svg' }
], {
  imgPath: '/img'
});