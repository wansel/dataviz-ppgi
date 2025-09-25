import * as d3 from 'd3';

type InteractionType = 'video' | 'quiz' | 'reading' | 'live';

interface Session {
  start: Date;
  end: Date;
  type: InteractionType;
}

interface DailyData {
  date: Date;
  sessions: Session[];
}

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  totalTimeMinutes: number;
  dailyData: DailyData[];
}

interface InteractionsData {
  startDate: Date;
  endDate: Date;
  students: Student[];
}

// Helper para parsear as datas no JSON
export function parseInteractionData(jsonData: any): InteractionsData {
  jsonData.startDate = new Date(jsonData.startDate);
  jsonData.endDate = new Date(jsonData.endDate);
  jsonData.students.forEach((student: any) => {
    student.dailyData.forEach((day: any) => {
      day.date = new Date(day.date);
      day.sessions.forEach((session: any) => {
        session.start = new Date(session.start);
        session.end = new Date(session.end);
      });
    });
  });
  return jsonData;
}

export function drawInteractionChart(
  selector: string,
  data: InteractionData,
  options: Options = {}
){

  const margin = { top: 50, right: 30, bottom: 50, left: 250 };
  const width = 1100 - margin.left - margin.right;
  const height = (data.students.length * 80); // 80px por estudante

  let detailedView = false; // Estado para a visão detalhada

  const container = d3.select(selector);
  container.html(""); // Limpa o container

  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // --- Escalas (Scales) ---

  // Escala Y para os estudantes
  const y = d3.scaleBand()
    .domain(data.students.map(s => s.id))
    .range([0, height])
    .padding(0.4);

  // Escala X para os DIAS (uma banda para cada dia)
  const days = d3.timeDay.range(data.startDate, d3.timeDay.offset(data.endDate, 1));
  const x = d3.scaleBand()
    .domain(days.map(d => d.toISOString()))
    .range([0, width])
    .padding(0.2);

  // Escala de TEMPO (aninhada) para posicionar as barras DENTRO de cada dia
  const timeScale = d3.scaleTime()
    .domain([d3.timeDay.start(data.startDate), d3.timeDay.end(data.startDate)])
    .range([0, x.bandwidth()]);

  // Escala de CORES para o modo detalhado
  const colorScale = d3.scaleOrdinal<InteractionType, string>()
    .domain(['video', 'quiz', 'reading', 'live'])
    .range(['#66b2ff', '#99ff99', '#ffcc66', '#ff6666']); // Azul, Verde, Laranja, Vermelho

  // --- Tooltip ---
  const tooltip = container.append("div")
    .attr("class", "timeline-tooltip absolute opacity-0 pointer-events-none p-4 bg-gray-800 text-white rounded-lg shadow-lg") // Tailwind classes
    .style("transition", "opacity 0.2s");

  // --- Eixos (Axes) ---
  const xAxis = (g: any) => g
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x)
      .tickValues(days)
      .tickFormat(d => d3.timeFormat("%a")(new Date(d)).charAt(0)) // D, S, T, Q...
    )
    .select('.domain').remove();

  svg.append('g').call(xAxis);

  // --- Renderização Principal ---

  // Cria um grupo para cada estudante (linha)
  const studentRows = svg.selectAll(".student-row")
    .data(data.students, (d: any) => d.id)
    .join("g")
    .attr("class", "student-row")
    .attr("transform", d => `translate(0, ${y(d.id)!})`);

  // Adiciona informações do estudante (avatar, nome, tempo)
  studentRows.append("image")
    .attr("x", -margin.left + 20)
    .attr("y", y.bandwidth() / 2 - 25)
    .attr("width", 50)
    .attr("height", 50)
    .attr("href", d => d.avatarUrl)
    .attr("clip-path", "circle(50%)");

  studentRows.append("text")
    .attr("x", -margin.left + 80)
    .attr("y", y.bandwidth() / 2 - 5)
    .attr("class", "font-semibold")
    .text(d => d.name);

  studentRows.append("text")
    .attr("x", -margin.left + 80)
    .attr("y", y.bandwidth() / 2 + 15)
    .attr("class", "text-gray-500 text-sm")
    .text(d => `${Math.floor(d.totalTimeMinutes/60)}h${d.totalTimeMinutes % 60}m`);

  // Cria um grupo para cada DIA dentro da linha de cada estudante
  const dayGroups = studentRows.selectAll(".day-group")
    .data(d => {
        // Mapeia os dados diários para os dias da semana
        const studentDays = new Map(d.dailyData.map(day => [day.date.toISOString().split('T')[0], day.sessions]));
        return days.map(day => ({
            date: day,
            sessions: studentDays.get(day.toISOString().split('T')[0]) || []
        }));
    })
    .join("g")
    .attr("class", "day-group")
    .attr("transform", d => `translate(${x(d.date.toISOString())!}, 0)`);

  // Fundo cinza para cada dia (para o hover)
  dayGroups.append("rect")
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", "transparent");

  // Desenha as BARRAS de sessão DENTRO de cada grupo de dia
  const sessionBars = dayGroups.selectAll(".session-bar")
    .data(d => d.sessions)
    .join("rect")
    .attr("class", "session-bar")
    .attr("x", d => timeScale(d.start))
    .attr("y", y.bandwidth() * 0.25)
    .attr("width", d => timeScale(d.end) - timeScale(d.start))
    .attr("height", y.bandwidth() * 0.5)
    .attr("rx", 2) // Bordas arredondadas
    .attr("fill", "#3182ce"); // Cor padrão (azul)

  // --- Interatividade ---

  // Eventos de hover no grupo do dia para o tooltip
  dayGroups
    .on("mouseover", function(event, d) {
        if (d.sessions.length === 0) return;
        
        // Agrega os dados por tipo de interação
        const summary = d3.rollup(d.sessions, 
            v => d3.sum(v, s => (s.end.getTime() - s.start.getTime()) / 60000), // Soma em minutos
            s => s.type
        );
        
        // Gera o HTML para o tooltip
        let tooltipHtml = `<div class="font-bold mb-2">${d3.timeFormat("%A, %d/%m")(d.date)}</div>`;
        summary.forEach((minutes, type) => {
            tooltipHtml += `<div class="flex items-center mb-1">
                <span class="w-4 h-4 rounded-full mr-2" style="background-color: ${colorScale(type)}"></span>
                <span>${type.charAt(0).toUpperCase() + type.slice(1)}: <strong>${Math.round(minutes)} min</strong></span>
            </div>`;
        });

        tooltip.html(tooltipHtml)
            .style("opacity", 1);
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY + 15) + "px");
    })
    .on("mouseout", function() {
        tooltip.style("opacity", 0);
    });

  // Função para alternar a visão detalhada
  function toggleDetails() {
    detailedView = !detailedView;
    sessionBars.transition()
      .duration(500)
      .attr("fill", d => detailedView ? colorScale(d.type) : "#3182ce");
  }

  // Adiciona o botão de toggle fora do SVG
  container.append("div")
    .attr("class", "mt-4 flex items-center justify-center")
    .html(`<label for="detailsToggle" class="mr-2">Interações detalhadas</label>
           <input type="checkbox" id="detailsToggle" class="toggle-checkbox">`)
    .select("#detailsToggle")
    .on("change", toggleDetails);


}