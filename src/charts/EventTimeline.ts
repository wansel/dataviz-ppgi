import * as d3 from 'd3';

interface StudentData {
    name: string;
    photo: string;
    sessions: { start: Date; end: Date; color: string }[];
}

interface Options {
  imgPath?: string;
  width?: number;
  height?: number;
  box?: number;
}

export function drawEventTimeline(
  selector: string,
  // data: number[],
  data: StudentData[],
  options: Options = {}
){
  const margin = { top: 20, right: 20, bottom: 40, left: 200 };
  const width = 900 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Definir o horário do evento
  const eventStart = new Date('2024-01-01T13:00');
  const eventEnd   = new Date('2024-01-01T15:00');

  const container = d3.select(selector);
  
  const svg = d3
    // .select('#chart')
    .select(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleTime()
    .domain([new Date('2024-01-01T12:00'), new Date('2024-01-01T16:00')])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, height])
    .padding(0);
    // .padding(0.1);

  // Retângulo cinza claro ao fundo, cobrindo todos os alunos
  svg.append('rect')
  .attr('x', x(eventStart))
  .attr('y', 0)
  .attr('width', x(eventEnd) - x(eventStart))
  .attr('height', height)
  .attr('fill', '#E0E0E0')
  .lower(); // envia para o fundo, atrás das barras


  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call((g) => g.call(d3.axisBottom(x).ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat('%H:%M'))));

  svg.append('g')
    .call(d3.axisLeft(y));

  // Desenhar faixas de fundo alternadas (zebra)
  svg.selectAll('.row-bg')
    .data(data)
    .join('rect')
    .attr('class', 'row-bg')
    .attr('x', 0)
    .attr('y', d => y(d.name)!)
    .attr('width', width)
    .attr('height', y.bandwidth())
    .attr('fill', (_, i) => (i % 2 === 0 ? '#FFFFFF' : '#F8F8F8'))
    .attr('fill-opacity', 0.6); // opacidade reduzida;

  // Agora desenhar as barras por estudante
  data.forEach(student => {
    svg.selectAll(`.bar-${student.name.replace(/\s+/g, '-')}`)
      .data(student.sessions)
      .join('rect')
      .attr('x', d => x(d.start))
      .attr('y', y(student.name)!+20)
      // .attr('height', y.bandwidth())
      .attr('height', 20)
      .attr('width', d => x(d.end) - x(d.start))
      .attr('fill', d => d.color);
  });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      .attr('text-anchor', 'middle')
      .text('Atraso e desconexão ~15min.');    
}

