import * as d3 from 'd3';

interface StudentData {
    name: string;
    avatar: string;
    sessions: { start: Date; end: Date; color: string }[];
}

interface Options {
  title: string,
  subtitle: string,
  imgPath?: string;
  width?: number;
  height?: number;
  box?: number;
  initialDelay?: number; // valor inicial do atraso (minutos)
}

export function drawEventTimeline(
  selector: string,
  // data: number[],
  data: StudentData[],
  options: Options = {}
){
  const margin = { top: 20, right: 20, bottom: 40, left: 240 };
  const width = 900 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Definir o horário do evento
  const eventStart = new Date('2024-01-01T13:00');
  const eventEnd   = new Date('2024-01-01T15:00');

  let delayThreshold = options.initialDelay ?? 15; // começa em 15 minutos

  const svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
    // .append('g')
    // .attr('transform', `translate(${margin.left},${margin.top})`);

  //Grupo principal do gráfico (deslocado pela margem)
  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Escalas
  const x = d3
    .scaleTime()
    .domain([new Date('2024-01-01T12:00'), new Date('2024-01-01T16:00')])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, height])
    .padding(0);
    // .padding(0.1); //Padding desabilitado

  // Labels (ficam em outro grupo, alinhados à esquerda, foda do chartArea)
  const labelGroup = svg.append("g")
    .attr("class", "labels")
    .attr("transform", `translate(10, ${margin.top})`) // 10 px da borda
  
  labelGroup.selectAll(".student-label")
    .data(data)
    .join("g")
    .attr("class", "student-label")
    .attr("transform", d=> `translate(0, ${y(d.name)!})`)
    .each(function(d) {
      const g = d3.select(this)
      const avatarSize = y.bandwidth() * 0.8;

      // Para cada g, append image
      g.append("image")
        .attr("x", 0)
        .attr("y", (y.bandwidth() - avatarSize) / 2) // centraliza verticalmente
        .attr("width", avatarSize)
        .attr("height", avatarSize)
        .attr("href", d.avatar)
        .attr("clip-path", "circle(50%)");

      // texto com quebra de linha
      const maxChars = 18;
      const words = d.name.split(" ");
      const padding = 6; 

      let line = "";
      let lines: string[] = [];

      words.forEach(w=>{
        if ((line + " " + w).trim().length > maxChars) {
          lines.push(line.trim());
          line = w;
        } else {
          line += " " + w;
        }
      });
      if (line) lines.push(line.trim());
      
      // nome dos estudantes
      const text = g.append("text")
        .attr("x", avatarSize + padding)  // desloca para a direita do avatar
        .attr("y", y.bandwidth() / 2 - (lines.length - 1) * 6) // sobe se tiver mais de 1 linha
        .attr("text-anchor", "start")
        .style("font-size", "12px");

      // Adicionar <tspan> para cada linha
      lines.forEach((ln, i) => {
        text.append("tspan")
          .attr("x", avatarSize + padding) // mantém alinhado com a primeira linha
          .attr("dy", i === 0 ? 0 : "1.2em") // espaçamento entre linhas
          .text(ln);
      });


    })  

  // Retângulo cinza claro ao fundo, cobrindo todos os alunos
  chartArea.append('rect')
  .attr('x', x(eventStart))
  .attr('y', 0)
  .attr('width', x(eventEnd) - x(eventStart))
  .attr('height', height)
  .attr('fill', '#E0E0E0')
  .lower(); // envia para o fundo, atrás das barras


  // Axis
  chartArea.append('g')
    .attr('transform', `translate(0,${height})`)
    .call((g) => g.call(d3.axisBottom(x).ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat('%H:%M'))));

  // Desenhar faixas de fundo alternadas (zebra)
  chartArea.selectAll('.row-bg')
    .data(data)
    .join('rect')
    .attr('class', 'row-bg')
    .attr('x', 0)
    .attr('y', d => y(d.name)!)
    .attr('width', width)
    .attr('height', y.bandwidth())
    .attr('fill', (_, i) => (i % 2 === 0 ? '#FFFFFF' : '#F8F8F8'))
    .attr('fill-opacity', 0.6); // opacidade reduzida;

  // Renderizar os nomes + imagens dos estudantes
// const labelGroup = svg.append("g")
//   .attr("class", "labels");

// labelGroup.selectAll(".student-label")
//   .data(data)
//   .join("g")
//   .attr("class", "student-label")
//   .attr("transform", d => `translate(0, ${y(d.name)!})`)
//   .each(function(d) {
//     const g = d3.select(this);
//       //Nome do estudante (com quebra automática em até duas linhas)
//     const maxChars = 18;
//     const words = d.name.split(" ");
//     let line = "";
//     let lines: string[] = [];

//     words.forEach(w=>{
//       if ((line + " " + w).trim().length > maxChars) {
//         lines.push(line.trim());
//         line = w;
//       } else {
//         line += " " + w;
//       }
//     });
//     if (line) lines.push(line.trim());


//     // Imagem do estudante (avatar circular)
//     const avatarSize = y.bandwidth() * 0.8; // ajusta para caber na faixa
//     g.append("image")
//       .attr("x", -avatarSize - 10) // 10px de margem à esquerda
//       .attr("y", (y.bandwidth() - avatarSize) / 2)
//       .attr("width", avatarSize)
//       .attr("height", avatarSize)
//       .attr("href", d.avatar) // URL da imagem, ex: "img/aluno1.png"
//       .attr("clip-path", "circle(50%)"); // borda circular

//     // Criar elemento Text para Nome do estudante
//     // Criar elemento <text>
//   const text = g.append("text")
//     .attr("x", 0)
//     .attr("y", y.bandwidth() / 2 - (lines.length - 1) * 6) // sobe se tiver mais de 1 linha
//     .attr("text-anchor", "start")
//     .style("font-size", "12px");

//   // Adicionar <tspan> para cada linha
//   lines.forEach((ln, i) => {
//     text.append("tspan")
//       .attr("x", 0)
//       .attr("dy", i === 0 ? 0 : "1.2em") // espaçamento entre linhas
//       .text(ln);
//   });
//     // g.append("text")
//     //   .attr("x", 0)
//     //   .attr("y", y.bandwidth() / 2)
//     //   .attr("dy", "0.35em") // centralizar verticalmente
//     //   .attr("text-anchor", "start")
//     //   .style("font-size", "12px")
//     //   .text(d.name);
//   });

  // Agora desenhar as barras por estudante
  data.forEach(student => {
    chartArea.selectAll(`.bar-${student.name.replace(/\s+/g, '-')}`)
      .data(student.sessions)
      .join('rect')
      .attr('x', d => x(d.start))
      .attr('y', y(student.name)!+20)
      // .attr('height', y.bandwidth())
      .attr('height', 20)
      .attr('width', d => x(d.end) - x(d.start))
      .attr('fill', d => d.color);
  });

    //Atraso e desconexão
    chartArea.append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      .attr('text-anchor', 'middle')
      .text('Atraso e desconexão ~15min.');    
}

