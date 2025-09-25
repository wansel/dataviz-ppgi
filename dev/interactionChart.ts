import { drawInteractionChart, parseInteractionData } from '../src';
import jsonData from './data/interactions-data.json';

// Parseia os dados para converter strings de data em objetos Date
const data = parseInteractionData(jsonData);

// Desenha o gráfico
drawInteractionChart('#interaction-chart', data);


// drawEventTimeline('#grafico4', datagraf4, {imgPath: '/img'});
// drawInteractionChart('#graf-intercation', dataGraf, {imgPath: '/img'});


// const dataGraf = {
//   startDate: "2025-09-07",
//   endDate: "2025-09-13",
//   students: [
//     {
//       id: "student-01",
//       name: "Alice Silvana da Cruz",
//       avatarUrl: "https://i.pravatar.cc/150?u=alice",
//       totalTimeMinutes: 180,
//       dailyData: [
//         {
//           date: "2025-09-08",
//           sessions: [
//             { "start": "2025-09-08T10:00:00", "end": "2025-09-08T10:45:00", "type": "video" },
//             { "start": "2025-09-08T11:00:00", "end": "2025-09-08T11:30:00", "type": "quiz" }
//           ]
//         },
//         {
//           date: "2025-09-09",
//           sessions: [
//             { "start": "2025-09-09T14:00:00", "end": "2025-09-09T15:30:00", "type": "reading" }
//           ]
//         },
//         { date: "2025-09-11", sessions: [] }
//       ]
//     },
//     {
//       id: "student-02",
//       name: "Carlos Eduardo Assis de Teixeira",
//       avatarUrl: "https://i.pravatar.cc/150?u=carlos",
//       totalTimeMinutes: 300,
//       dailyData: [
//         {
//           date: "2025-09-07",
//           sessions: [
//             { start: "2025-09-07T09:00:00", end: "2025-09-07T10:15:00", type: "live" }
//           ]
//         },
//         {
//           "date": "2025-09-09",
//           sessions: [
//             { start: "2025-09-09T19:00:00", "end": "2025-09-09T20:00:00", type: "video" },
//             { start: "2025-09-09T20:00:00", "end": "2025-09-09T20:30:00", type: "quiz" },
//             { start: "2025-09-09T20:45:00", "end": "2025-09-09T21:30:00", type: "reading" }
//           ]
//         }
//       ]
//     }
//   ]
// }

// import jsonData from './interactions-data.json';



