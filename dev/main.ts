// import '../src/style.css';
console.log("Tailwind carregado");
// import { drawBarChart, drawEventTimeline, drawLineChart, drawWeightsChart } from '../src';
import { drawEventTimeline } from '../src';
// drawBarChart('#grafico1', [15, 30, 20, 40]);

// drawLineChart('#grafico2', [
//   { x: 0, y: 10 },
//   { x: 1, y: 15 },
//   { x: 2, y: 8 },
//   { x: 3, y: 20 },
// ]);

// drawWeightsChart('#grafico3', [
//   { key: '1', title: 'Peso 1', description: 'Descrição 1', weight: 10, img: 'img1.svg' },
//   { key: '2', title: 'Peso 2', description: 'Descrição 2', weight: 20, img: 'img2.svg' },
//   { key: '3', title: 'Peso 3', description: 'Descrição 3', weight: 5, img: 'img3.svg' }
// ], {
//   imgPath: '/img'
// });

// const data: StudentData[] = [
const datagraf4 = [
  {
    name: 'Alice Silvana da Cruz',
    avatar: '/img/students/37.jpg',
    sessions: [{ start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T14:45'), color: '#2196f3' }],
  },
  {
    name: 'Carlos Eduardo Assis de Teixeira',
    avatar: '/img/students/45.jpg',
    sessions: [{ start: new Date('2024-01-01T13:30'), end: new Date('2024-01-01T15:10'), color: '#f4b400' }],
  },
  {
    name: 'Gabriel Arthur Mota',
    avatar: '/img/students/28.jpg',
    sessions: [
      { start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T13:30'), color: '#2196f3' },
      { start: new Date('2024-01-01T13:50'), end: new Date('2024-01-01T14:40'), color: '#2196f3' },
    ],
  },
  {
    name: 'Hellen Carolina Ester Cardoso',
    avatar: '/img/students/43.jpg',
    sessions: [],
  },
];

drawEventTimeline('#grafico4', datagraf4, {imgPath: '/img', title:'Aula 03', subtitle:'Permanência dos estudantes no evento'});