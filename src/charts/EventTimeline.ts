import * as d3 from 'd3';



interface Session {
  start: Date;
  end: Date;
}

interface StudentData {
  name: string;
  avatar: string;
  sessions: Session[];
}

interface EventData {
  title: string;
  subtitle: string;
  start: Date;
  end: Date;
}

interface TimelineData {
  event: EventData;
  students: StudentData[]
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

function getMinutesWithinEvent(session: { start: Date, end: Date }, eventStart: Date, eventEnd: Date) {
  const s = session.start < eventStart ? eventStart : session.start;
  const e = session.end > eventEnd ? eventEnd : session.end;
  return Math.max(0, (e.getTime() - s.getTime()) / (1000 * 60));
}

export function drawEventTimeline(
  selector: string,
  data: TimelineData,
  options: Options = {}
){
  const margin = { top: 20, right: 20, bottom: 40, left: 240 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Definir o horário do evento
  // const eventStart = new Date('2024-01-01T13:00');
  // const eventEnd   = new Date('2024-01-01T15:00');

  //Definindo duração do evento
  console.log("Event duration");
  const eventDuration = (data.event.end.getTime() - data.event.start.getTime() / (1000*60)); // Em minutos
  console.log("Event duration"+eventDuration);

  let delayThreshold = options.initialDelay ?? 15; // começa em 15 minutos

  // Container principal
  const container = d3.select(selector);
  const containerNode = container.node();
  
  if(!containerNode) {
    console.error(`Elemento não encontrado para o seletor: "${selector}"`);
    return; // Interrompe a função se o container não existir
  }
    const containerWidth = containerNode.getBoundingClientRect().width;
    console.log(`A largura do container é: ${containerWidth}`);
  
  
  // SVG principal
  const svg = container
    // .select(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const defs = svg.append("defs");

  defs.append("filter")
    .attr("id", "grayscale")
    .append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "0.3333 0.3333 0.3333 0 0 \
                    0.3333 0.3333 0.3333 0 0 \
                    0.3333 0.3333 0.3333 0 0 \
                    0      0      0      1 0");

  //Grupo principal do gráfico (deslocado pela margem)
  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Escalas
  const marginMinutes = 30; // minutos extras
  const ms = marginMinutes * 60 * 1000; // converter para ms

  const x = d3.scaleTime()
    .domain([
      new Date(data.event.start.getTime() - ms), // 30 min antes
      new Date(data.event.end.getTime() + ms)    // 30 min depois
    ])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.students.map(d => d.name))
    .range([0, height])
    .padding(0);

  // Labels (ficam em outro grupo, alinhados à esquerda, fora do chartArea)
  const labelGroup = svg.append("g")
    .attr("class", "labels");
    // .attr("transform", `translate(10, ${margin.top})`) // 10 px da borda
  
  labelGroup.selectAll(".student-label")
    .data(data.students)
    .join("g")
    .attr("class", "student-label")
    .attr("transform", d=> `translate(0, ${y(d.name)!+margin.top})`) //adc margin.top
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
        .attr("clip-path", "circle(50%)")
        .attr("filter", d.sessions.length === 0? "url(#grayscale)" : null ) // aplica P&B
        .on("mouseover", function(_, d) {
          d3.select(this).attr("filter", null);
        })
        .on("mouseout", function(_,d) {
          if (d.sessions.length === 0) {
            d3.select(this).attr("filter", "url(#grayscale)"); //aplica de novo
          }
        });
      
      // Ícone de desconexão
      const iconSize = 16; // tamanho do ícone (ex: alerta vermelho)
      const iconOffset = 4; // margem interna

      g.append("image")
        .attr("class", "studant-avatar")
        .attr("xlink:href", d => d.sessions.length === 0 ? "/img/offline.png" : null)
          .attr("x", 0) // canto superior direito
          .attr("y", d => iconOffset)
          .attr("width", iconSize)
          .attr("height", iconSize); 

      // texto com quebra de linha
      const maxChars = 20;
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

  // Fundo do evento - Retângulo cinza claro ao fundo, cobrindo todos os alunos
  chartArea.append('rect')
    .attr('x', x(data.event.start))
    .attr('y', 0)
    .attr('width', x(data.event.end) - x(data.event.start))
    .attr('height', height)
    .attr('fill', '#e0e0e05a')
    .lower(); // envia para o fundo, atrás das barras


  // Axis
  chartArea.append('g')
    .attr('transform', `translate(0,${height})`)
    .call((g) => g.call(d3.axisBottom(x).ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat('%H:%M'))));

  // Zebra - Desenhar faixas de fundo alternadas
  svg.selectAll('.row-bg')
    .data(data.students)
    .join('rect')
    .attr('class', 'row-bg')
    .attr('x', 0)
    .attr('y', d => y(d.name)!+margin.top) // adc margin.top
    .attr('width', width)
    .attr('height', y.bandwidth())
    .attr('fill', (_, i) => (i % 2 === 0 ? '#FFFFFF' : '#F8F8F8'))
    // .attr('fill-opacity', 1) // opacidade reduzida;
    .lower();

    //Fundo cinza por estudante
    const backgrounds = chartArea
      .selectAll("student-bg")
      .data(data.students, d => d.name);  // chaveando pelo nome do aluno
  
    backgrounds.join("rect")
        .attr("x", 0) // começa logo depois do avatar
        .attr("y", d => (y(d.name)!+ (y.bandwidth() / 6)*2) ) // centralizar verticalmente
        .attr("width", width) // ocupa o resto
        .attr("height", y.bandwidth() / 3) // mais fino que a faixa inteira
        .attr("fill", "#00000011")
        .lower()




  // Desenhar as barras por estudante
  function updateBars() {
    console.log("updatebars");

    data.students.forEach(student => {
      
      const barheight = 15;

      // Soma total de minutos conectados dentro do evento
      const totalMinutes = d3.sum(student.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));


      // Definição de cor para os segmentos de sessão
      // const barColor = totalMinutes < delayThreshold ? "#f4b400" : "#2196f3";
      // const eventDurationMinutes = (data.event.end.getTime() - data.event.start.getTime()) / (1000 * 60);

      const barColor = totalMinutes < delayThreshold 
        ? "red" // atrasado
        : totalMinutes >= eventDuration 
          ? "#2196f3" // participou 100%
          : "#f4b400"; // participou parcialmente
      // 66bb6a
      console.log( student.name + " " + totalMinutes + " minutos = " + barColor);

      chartArea
        .selectAll(`.bar-${student.name.replace(/\s+/g, '-')}`)
        .data(student.sessions)
        .join('rect')
        .attr("class", `bar-${student.name.replace(/\s+/g, "-")}`)
        .attr("x", d => x(d.start))
        .attr("y", y(student.name)!+ (y.bandwidth() / 4)+ (barheight/2)) // centralizar verticalmente
        .attr('height', barheight)
        .attr('width', d => x(d.end) - x(d.start))
        .attr('fill', barColor);

    });
  }

  // Cria uma DIV para o input + label
  const controls = container
    .append("div")
    .attr("class", "mt-4 flex justify-center items-center gap-2");

  controls
    .append("label")
    .attr("for", "delay-input")
    .text("Atraso (min):");

  const delayInput = controls
    .append("input")
    .attr("id", "delay-input")
    .attr("type", "number")
    .attr("value", delayThreshold)
    .attr("min", 0)
    .attr("step", 1)
    .attr("class", "border rounded px-2 py-1 w-20 text-center");

  updateBars();
  
  delayInput.on("input", function(){
    delayThreshold = parseInt((this as HTMLInputElement).value, 10) || 0;
    updateBars();
  });
}

