import * as d3 from 'd3';

type InteractionTypeKey = 'video' | 'quiz' | 'reading' | 'live' | string;

interface InteractionTypeMetadata {
  name: string;
  legend: string;
  iconUrl: string;
  color: string;
}

interface Session {
  start: Date;
  end: Date;
   type: InteractionTypeKey;
}

interface DailyData {
  date: Date;
  sessions: Session[];
}

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  totalTimeMinutes: number; // Este campo do JSON pode ser ignorado, vamos recalcular
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
  data: InteractionsData
) {
  // --- Configurações Iniciais ---
  const margin = { top: 20, right: 30, bottom: 20, left: 350 };
  const width = 1100 - margin.left - margin.right;
  const height = (data.students.length * 80);
  const daySpacing = 3; // Espaço em pixels entre os retângulos dos dias
  let detailedView = false; // Estado para a visão detalhada

  const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
  const tooltipWeekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });

  const container = d3.select(selector);
  container.html("");

  // --- Tooltip ---
  const tooltip = container.append("div")
    .attr("class", "timeline-tooltip absolute opacity-0 pointer-events-none p-3 bg-gray-800 text-white rounded-lg shadow-xl z-10")
    .style("transition", "opacity 0.2s");

  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // --- 1. Pré-processamento de Dados ---
  const days = d3.timeDay.range(data.startDate, d3.timeDay.offset(data.endDate, 1));
  
  const processedStudents = data.students.map(student => {
    const dailyMap = new Map(student.dailyData.map(d => [d.date.toISOString().split('T')[0], d.sessions]));
    
    const augmentedDailyData = days.map(day => {
      const sessions = dailyMap.get(day.toISOString().split('T')[0]) || [];
      const dailyTotalMinutes = d3.sum(sessions, s => (s.end.getTime() - s.start.getTime()) / 60000);
      return { date: day, sessions, dailyTotalMinutes };
    });

    const grandTotalMinutes = d3.sum(augmentedDailyData, d => d.dailyTotalMinutes);

    return { ...student, dailyData: augmentedDailyData, grandTotalMinutes };
  });

  // --- 2. Escalas ---
  
  // Escala Y para posicionar os estudantes verticalmente
  const y = d3.scaleBand()
    .domain(processedStudents.map(s => s.id))
    .range([0, height])
    .padding(0.4);

  // Escala X para converter MINUTOS em LARGURA (pixels)
  const maxTotalTime = d3.max(processedStudents, s => s.grandTotalMinutes) || 0;
  const timeScaleWidth = d3.scaleLinear()
    .domain([0, maxTotalTime + 120]) // + 2 horas de margem
    .range([0, width]); // O tempo máximo preenche a largura total

  // --- 3. Renderização Principal ---
  const studentRows = svg.selectAll(".student-row")
    .data(processedStudents, (d: any) => d.id)
    .join("g")
    .attr("class", "student-row")
    .attr("transform", d => `translate(0, ${y(d.id)!})`);
    
  // Adiciona informações do estudante (avatar, nome)
  studentRows.append("image")
      .attr("x", -margin.left + 20)
      .attr("y", 0)
      .attr("width", 50)
      .attr("height", 50)
      .attr("href", d => d.avatarUrl)
      .attr("clip-path", "circle(50%)");

  studentRows.append("text")
      .attr("x", -margin.left + 80)
      .attr("y", 25)
      // .attr("class", "font-semibold align-middle")
      .attr("class", "align-middle")
      .text(d => d.name);

  // Para cada estudante, cria os grupos para cada dia
  const dayGroups = studentRows.selectAll(".day-group")
    .data(d => d.dailyData)
    .join("g")
    .attr("class", "day-group");

  // A. Visão Simples (uma barra por dia)
  const simpleView = dayGroups.append("g").attr("class", "simple-view");
  simpleView.append("rect")
    .attr("height", 25)
    .attr("width", d => d.dailyTotalMinutes > 0 ? timeScaleWidth(d.dailyTotalMinutes) : 10)
    .attr("rx", 3)   // borda arredondada horizontal
    .attr("ry", 3)   // borda arredondada vertical
    .attr("fill", d => d.dailyTotalMinutes > 0 ? "#3182ce" : "#8c8c8cff");

  // B. Visão Detalhada (segmentos por sessão)
  const detailedViewG = dayGroups.append("g")
    .attr("class", "detailed-view")
    .style("opacity", 0) // Começa invisível
    .style("pointer-events", "none"); // Não interfere com o mouse

  detailedViewG.each(function(dayData) {
    const g = d3.select(this);

    // SE HÁ SESSÕES, desenha os segmentos coloridos um a um
    if (dayData.dailyTotalMinutes > 0) {
      let sessionXOffset = 0;
      dayData.sessions.forEach(session => {
        const sessionDuration = (session.end.getTime() - session.start.getTime()) / 60000;
        // Evita desenhar barras com largura zero ou negativa
        if (sessionDuration <= 0) return; 

        const sessionWidth = timeScaleWidth(sessionDuration);
        
        g.append("rect")
          .attr("x", sessionXOffset)
          .attr("height", 25)
          .attr("width", sessionWidth)
          .attr("fill", data.interactionTypes[session.type]?.color || '#ccc');
        
        sessionXOffset += sessionWidth;
      });
    } 
    // SENÃO (se não há sessões), desenha o retângulo cinza de placeholder ✨
    else {
      g.append("rect")
        .attr("height", 25)
        .attr("width", 10) // Largura fixa para dias inativos
        .attr("fill", "#8c8c8cff"); // Cor cinza
    }
  });


  // Adiciona o texto (inicial do dia da semana) para cada dia (comum em ambas as visões)
  dayGroups.append("text")
    .attr("y", 25 + 15) // Posiciona abaixo do retângulo
    .attr("text-anchor", "middle")
    .attr("class", "text-xs text-gray-500")
    .text(d => {
        // Ex: "seg." -> "s" -> "S"
        return dayFormatter.format(d.date).charAt(0).toUpperCase();
    })
    .attr("x", function(d) {
        // Centraliza o texto no meio do retângulo correspondente
        const parentRectWidth = d.dailyTotalMinutes > 0 ? timeScaleWidth(d.dailyTotalMinutes) : 10;
        return parentRectWidth / 2;
    });

  // --- 4. Posicionamento Sequencial ---
  // Após criar todos os elementos, iteramos em cada linha para posicioná-los
  studentRows.each(function() {
      let currentX = 0;
      d3.select(this).selectAll(".day-group").attr("transform", function(d: any) {
          const rectWidth = d.dailyTotalMinutes > 0 ? timeScaleWidth(d.dailyTotalMinutes) : 10;
          const transform = `translate(${currentX}, ${y.bandwidth() / 2 - 12.5})`;
          currentX += rectWidth + daySpacing;
          return transform;
      });
  });

  // --- Interatividade (Tooltip) ---
  dayGroups
    .on("mouseover", function(event, d) {
      if (d.sessions.length === 0) return;
      
      const summary = d3.rollup(d.sessions, 
          v => d3.sum(v, s => (s.end.getTime() - s.start.getTime()) / 60000),
          s => s.type
      );
      
      // Formata o dia da semana completo em português (ex: "segunda-feira")
      const weekday = tooltipWeekdayFormatter.format(d.date);
      // Deixa a primeira letra maiúscula para um melhor estilo
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      // Usa d3.timeFormat apenas para a parte numérica (dia/mês), que não precisa de tradução
      const dayMonth = d3.timeFormat("%d/%m")(d.date);

      let tooltipHtml = `<div class="font-bold mb-2 border-b border-gray-600 pb-1">${capitalizedWeekday}, ${dayMonth}</div>`;
      
      summary.forEach((minutes, typeKey) => {
          const typeMeta = data.interactionTypes[typeKey];
          if (!typeMeta) return;

          tooltipHtml += `
            <div class="flex items-start my-2">
              <img src="${typeMeta.iconUrl}" class="w-8 h-8 mr-3 mt-1" alt="${typeMeta.name}" />
              <div>
                <div class="font-semibold">${typeMeta.name} (${Math.round(minutes)} min)</div>
                <div class="text-xs text-gray-300">${typeMeta.legend}</div>
              </div>
            </div>`;
      });

      tooltip.html(tooltipHtml).style("opacity", 1);
    })
    .on("mousemove", event => tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY + 15) + "px"))
    .on("mouseout", () => tooltip.style("opacity", 0));

  // --- Controle de Visão Detalhada ---
  function toggleDetails() {
    detailedView = !detailedView;
    
    // Transição suave entre as visões
    d3.selectAll(".simple-view")
      .transition().duration(300)
      .style("opacity", detailedView ? 0 : 1)
      .style("pointer-events", detailedView ? "none" : "auto");

    d3.selectAll(".detailed-view")
      .transition().duration(300)
      .style("opacity", detailedView ? 1 : 0)
      .style("pointer-events", detailedView ? "auto" : "none");
  }

  // Adiciona o botão de toggle
  container.append("div")
    .attr("class", "mt-4 flex items-center justify-center")
    .html(`
      <label class="flex items-center cursor-pointer">
        <span class="mr-3 text-sm font-medium text-gray-900">Interações detalhadas</span>
        <div class="relative">
          <input type="checkbox" id="detailsToggle" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </label>
    `)
    .select("#detailsToggle")
    .on("change", toggleDetails);


  // --- Legenda ao final da visualização ---
  // 1. Cria o container principal da legenda com classes de Grid
  const legendContainer = container.append("div")
    .attr("class", "legend-container mt-8 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4");
  
    // 2. Converte o objeto de tipos de interação em um array para o D3
  const legendData = Object.values(data.interactionTypes);

  // 3. Usa o padrão de data join do D3 para criar um item para cada tipo
  const legendItems = legendContainer.selectAll(".legend-item")
    .data(legendData)
    .join("div")
    .attr("class", "legend-item flex items-start p-2 rounded-md");

  // 4. Adiciona o ícone e a cor a cada item
  legendItems.append("div")
    .attr("class", "flex-shrink-0 mr-4 mt-1")
    .html(d => `
      <div class="relative w-8 h-8">
        <div class="absolute inset-0 rounded-full"></div>
        <img src="${d.iconUrl}" class="relative w-8 h-8" alt="${d.name}" />
      </div>
    `);

  // 5. Adiciona o bloco de texto (nome e descrição) a cada item
  legendItems.append("div")
    .html(d => `
      <p class="font-bold" style="color: ${d.color};">${d.name}</p>
      <p class="text-sm text-gray-600">${d.legend}</p>
    `);

}