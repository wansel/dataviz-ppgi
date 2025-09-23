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
const datagraf4 = {
  event: {
    title: "Aula 03",
    subtitle: "Permanência dos estudantes no evento",
    start: new Date("2024-01-01T13:00"),
    end: new Date("2024-01-01T15:00")
  },
  students: [
    {
      name: 'Alice Silvana da Cruz',
      avatar: '/img/students/f37.jpg',
      sessions: [{ start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T14:45'), color: '#2196f3' }],
    },
    {
      name: 'Carlos Eduardo Assis de Teixeira',
      avatar: '/img/students/m45.jpg',
      sessions: [{ start: new Date('2024-01-01T13:30'), end: new Date('2024-01-01T15:10'), color: '#f4b400' }],
    },
    {
      name: 'Gabriel Arthur Mota',
      avatar: '/img/students/m28.jpg',
      sessions: [
        { start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T13:30') },
        { start: new Date('2024-01-01T13:50'), end: new Date('2024-01-01T14:40') },
      ],
    },
    {
      name: 'Hellen Carolina Ester Cardoso',
      avatar: '/img/students/f43.jpg',
      sessions: [],
    },
    {
      name: 'Ariel Ferreira Carvalho',
      avatar: '/img/students/m01.jpeg',
      sessions: [
        { start: new Date('2024-01-01T13:42'), end: new Date('2024-01-01T14:25') },
        { start: new Date('2024-01-01T14:30'), end: new Date('2024-01-01T14:55') },
      ],
    },
    {
      name: 'Edson Fernandes Rodrigues',
      avatar: '/img/students/m60.jpg',
      sessions: [
        { start: new Date('2024-01-01T12:50'), end: new Date('2024-01-01T14:10') },
        { start: new Date('2024-01-01T14:20'), end: new Date('2024-01-01T15:00') },
      ],
    },
    {
      name: 'Débora Dias Batista',
      avatar: '/img/students/f78.jpg',
      sessions: [
        { start: new Date('2024-01-01T13:35'), end: new Date('2024-01-01T14:05') },
        { start: new Date('2024-01-01T14:15'), end: new Date('2024-01-01T14:45') },
      ],
    },
  ]
};


// let datagraf4b = [
//     {
//       name: 'Alice Silvana da Cruz',
//       avatar: '/img/students/f37.jpg',
//       sessions: [{ start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T14:45'), color: '#2196f3' }],
//     },
//     {
//       name: 'Carlos Eduardo Assis de Teixeira',
//       avatar: '/img/students/m45.jpg',
//       sessions: [{ start: new Date('2024-01-01T13:30'), end: new Date('2024-01-01T15:10'), color: '#f4b400' }],
//     },
//     {
//       name: 'Gabriel Arthur Mota',
//       avatar: '/img/students/m28.jpg',
//       sessions: [
//         { start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T13:30'), color: '#2196f3' },
//         { start: new Date('2024-01-01T13:50'), end: new Date('2024-01-01T14:40'), color: '#2196f3' },
//       ],
//     },
//     {
//       name: 'Hellen Carolina Ester Cardoso',
//       avatar: '/img/students/f43.jpg',
//       sessions: [],
//     },
//     {
//       name: 'Ariel Ferreira Carvalho',
//       avatar: '/img/students/m01.jpeg',
//       sessions: [
//         { start: new Date('2024-01-01T13:42'), end: new Date('2024-01-01T14:25'), color: '#2196f3' },
//         { start: new Date('2024-01-01T14:30'), end: new Date('2024-01-01T14:55'), color: '#2196f3' },
//       ],
//     },
//     {
//       name: 'Édson Fernandes Rodrigues',
//       avatar: '/img/students/m60.jpg',
//       sessions: [
//         { start: new Date('2024-01-01T12:50'), end: new Date('2024-01-01T14:10'), color: '#2196f3' },
//         { start: new Date('2024-01-01T14:20'), end: new Date('2024-01-01T15:00'), color: '#2196f3' },
//       ],
//     },
//     {
//       name: 'Débora Dias Batista',
//       avatar: '/img/students/f78.jpg',
//       sessions: [
//         { start: new Date('2024-01-01T13:35'), end: new Date('2024-01-01T14:05'), color: '#2196f3' },
//         { start: new Date('2024-01-01T14:15'), end: new Date('2024-01-01T14:45'), color: '#2196f3' },
//       ],
//     },
//   ]


drawEventTimeline('#grafico4', datagraf4, {imgPath: '/img'});