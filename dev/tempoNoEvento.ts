
import { drawEventTimeline } from '../src';

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

drawEventTimeline('#grafico4', datagraf4, {imgPath: '/img'});