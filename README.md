# DataViz PPGI

Instalado o Node 24.8.0 de https://nodejs.org/pt/download/current
> No windows, marcada a opção de instalar as ferramentas necessárias (e Chocolatey)


Rodando o projeto:
```shell
npm install
npm run dev
```
> No windows, tive problemas com o powershell (PSSecurityException), optei por usar o cmd (via opções do vsCode)


----

Como usar

1. HTML: Crie um container `div` no seu HTML onde o gráfico será renderizado
```html
<div id="timeline-chart"></div>
```

2. TypeScript/JavaScript: Importe a função drawEventTimeline e os estilos, defina **seus dados** e chame a função.
```ts
import { drawEventTimeline, TimelineData } from 'event-timeline-d3';
// Importe o CSS empacotado pela biblioteca
import 'event-timeline-d3/dist/style.css';

const data: TimelineData = {
  event: {
    title: "Aula 03",
    subtitle: "Permanência dos estudantes no evento",
    start: new Date("2024-01-01T13:00"),
    end: new Date("2024-01-01T15:00")
  },
  students: [
    {
      name: 'Ariel Ferreira Carvalho',
      avatar: '/path/to/avatar1.jpeg',
      sessions: [
        { start: new Date('2024-01-01T12:45'), end: new Date('2024-01-01T14:40') },
        { start: new Date('2024-01-01T14:50'), end: new Date('2024-01-01T15:10') },
      ],
    },
    {
      name: 'Débora Dias Batista',
      avatar: '/path/to/avatar2.jpg',
      sessions: [], // Estudante que não se conectou
    },
    // ... mais estudantes
  ]
};

// Renderiza o gráfico
drawEventTimeline('#timeline-chart', data, {
  initialDelay: 20 // Opcional: define o limite de tempo inicial de atraso para a cor da barra
});
```

---
## Estrutra de Dados

A função principal espera um objeto com uma estrutura específica (TimelineData):

### Dados visualização EventTimeline:

```ts
interface Session {
  start: Date;
  end: Date;
}

interface StudentData {
  name: string;
  avatar: string;        // URL para a imagem do avatar
  sessions: Session[];
}

interface EventData {
  title: string;
  subtitle: string;
  start: Date;           // Início oficial do evento
  end: Date;             // Fim oficial do evento
}

interface TimelineData {
  event: EventData;
  students: StudentData[];
}
```

Exemplo de dados esperados:
```ts
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
```

### Dados InteractionChart

### Dados InvestedTime

### Dados PerformanceChart

