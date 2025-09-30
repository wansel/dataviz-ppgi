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
  totalTimeMinutes: number;
  dailyData: DailyData[];
}

interface InteractionsData {
  startDate: Date;
  endDate: Date;
  interactionTypes: Record<InteractionTypeKey, InteractionTypeMetadata>;
  students: Student[];
}

// ADICIONADO: Interface de opções para a função
interface Options {
  basePath?: string;
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

// MODIFICADO: Assinatura da função para aceitar 'options'
export function drawInteractionChart(
  selector: string,
  data: InteractionsData,
  options: Options = {}
) {
  // ADICIONADO: Processa a opção basePath
  const basePath = options.basePath ?? '';

  // --- Configurações Iniciais ---
  const margin = { top: 20, right: 30, bottom: 20, left: 350 };
  const width = 1100 - margin.left - margin.right;
  const height = (data.students.length * 80);
  const daySpacing = 3;
  let detailedView = false;

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

  // --- Cabeçalhos das colunas ---
  const headerGroup = svg.append("g")
    .attr("class", "chart-headers")
    .attr("transform", "translate(0, -10)");

  const headerTextStyle = "text-sm font-semibold text-gray-700";

  headerGroup.append("text")
    .attr("x", -margin.left + 20)
    .attr("text-anchor", "start")
    .attr("class", headerTextStyle)
    .text("Estudantes");

  headerGroup.append("text")
    .attr("x", -50)
    .attr("text-anchor", "middle")
    .attr("class", headerTextStyle)
    .text("Tempo total");

  headerGroup.append("text")
    .attr("x", 0)
    .attr("text-anchor", "start")
    .attr("class", headerTextStyle)
    .text("Acessos e Interações");

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
  const y = d3.scaleBand()
    .domain(processedStudents.map(s => s.id))
    .range([0, height])
    .padding(0);

  const maxTotalTime = d3.max(processedStudents, s => s.grandTotalMinutes) || 0;
  const timeScaleWidth = d3.scaleLinear()
    .domain([0, maxTotalTime + 120])
    .range([0, width]);

  function formatTotalTime(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes < 0) return "0h00";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${hours}h${paddedMinutes}`;
  }

  // --- 3. Renderização Principal ---
  const studentInfoYCenter = y.bandwidth() / 2;

  const studentRows = svg.selectAll(".student-row")
    .data(processedStudents, (d: any) => d.id)
    .join("g")
    .attr("class", "student-row")
    .attr("transform", d => `translate(0, ${y(d.id)!})`);
  
  studentRows.append("rect")
    .attr("class", "row-background")
    .attr("x", -margin.left)
    .attr("y", 0)
    .attr("width", width + margin.left + margin.right)
    .attr("height", y.bandwidth())
    .attr("fill", (d, i) => i % 2 === 0 ? "#F8f8f8" : "#FFFFFF")
    .lower();

  studentRows.append("image")
      .attr("x", -margin.left + 20)
      .attr("y", studentInfoYCenter - 25)
      .attr("width", 50)
      .attr("height", 50)
      .attr("href", d => `${basePath}${d.avatarUrl}`)
      .attr("clip-path", "circle(50%)");

  studentRows.append("text")
      .attr("x", -margin.left + 80)
      .attr("y", studentInfoYCenter)
      .attr("dominant-baseline", "middle")
      .attr("class", "align-middle")
      .text(d => d.name);

  studentRows.append("text")
    .attr("x", -50)
    .attr("y", studentInfoYCenter)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("class", "text-gray-800 align-middle")
    .text(d => formatTotalTime(d.grandTotalMinutes));

  const dayGroups = studentRows.selectAll(".day-group")
    .data(d => d.dailyData)
    .join("g")
    .attr("class", "day-group");

  const simpleView = dayGroups.append("g").attr("class", "simple-view");
  simpleView.append("rect")
    .attr("height", 25)
    .attr("width", d => d.dailyTotalMinutes > 0 ? timeScaleWidth(d.dailyTotalMinutes) : 10)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("fill", d => d.dailyTotalMinutes > 0 ? "#3182ce" : "#8c8c8cff");

  const detailedViewG = dayGroups.append("g")
    .attr("class", "detailed-view")
    .style("opacity", 0)
    .style("pointer-events", "none");

  detailedViewG.each(function(dayData) {
    const g = d3.select(this);
    if (dayData.dailyTotalMinutes > 0) {
      let sessionXOffset = 0;
      dayData.sessions.forEach(session => {
        const sessionDuration = (session.end.getTime() - session.start.getTime()) / 60000;
        if (sessionDuration <= 0) return; 

        const sessionWidth = timeScaleWidth(sessionDuration);
        g.append("rect")
          .attr("x", sessionXOffset)
          .attr("height", 25)
          .attr("width", sessionWidth)
          .attr("fill", data.interactionTypes[session.type]?.color || '#ccc');
        sessionXOffset += sessionWidth;
      });
    } else {
      g.append("rect")
        .attr("height", 25)
        .attr("width", 10)
        .attr("fill", "#8c8c8cff");
    }
  });

  dayGroups.append("text")
    .attr("y", 25 + 15)
    .attr("text-anchor", "middle")
    .attr("class", "text-xs text-gray-500")
    .text(d => dayFormatter.format(d.date).charAt(0).toUpperCase())
    .attr("x", function(d) {
        const parentRectWidth = d.dailyTotalMinutes > 0 ? timeScaleWidth(d.dailyTotalMinutes) : 10;
        return parentRectWidth / 2;
    });

  // --- 4. Posicionamento Sequencial ---
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
      const weekday = tooltipWeekdayFormatter.format(d.date);
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const dayMonth = d3.timeFormat("%d/%m")(d.date);
      let tooltipHtml = `<div class="font-bold mb-2 border-b border-gray-600 pb-1">${capitalizedWeekday}, ${dayMonth}</div>`;

      if (d.sessions.length > 0) {
        const summary = d3.rollup(d.sessions, 
            v => d3.sum(v, s => (s.end.getTime() - s.start.getTime()) / 60000),
            s => s.type
        );
        
        summary.forEach((minutes, typeKey) => {
            const typeMeta = data.interactionTypes[typeKey];
            if (!typeMeta) return;

            tooltipHtml += `
              <div class="flex items-start my-2">
                <img src="${basePath}${typeMeta.iconUrl}" class="w-7 h-7 mr-3 mt-1" alt="${typeMeta.name}" />
                <div>
                  <div class="font-semibold">${typeMeta.name} (${Math.round(minutes)} min)</div>
                  <div class="text-xs text-gray-300">${typeMeta.legend}</div>
                </div>
              </div>`;
        });
      } else {
        tooltipHtml += `<div class="text-gray-300 italic py-2 px-1">Estudante não se conectou</div>`;
      }
      tooltip.html(tooltipHtml).style("opacity", 1);
    })
    .on("mousemove", event => tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY + 15) + "px"))
    .on("mouseout", () => tooltip.style("opacity", 0));

  // --- Controle de Visão Detalhada ---
  function toggleDetails() {
    detailedView = !detailedView;
    d3.selectAll(".simple-view")
      .transition().duration(300)
      .style("opacity", detailedView ? 0 : 1)
      .style("pointer-events", detailedView ? "none" : "auto");
    d3.selectAll(".detailed-view")
      .transition().duration(300)
      .style("opacity", detailedView ? 1 : 0)
      .style("pointer-events", detailedView ? "auto" : "none");
  }

  container.append("div")
    .attr("class", "mt-4 flex items-center justify-center")
    .html(`...`) // O HTML do toggle permanece o mesmo
    .select("#detailsToggle")
    .on("change", toggleDetails);

  // --- Legenda ---
  const legendContainer = container.append("div")
    .attr("class", "legend-container mt-8 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4");
  
  const legendData = Object.values(data.interactionTypes);

  const legendItems = legendContainer.selectAll(".legend-item")
    .data(legendData)
    .join("div")
    .attr("class", "legend-item flex items-start p-2 rounded-md");

  legendItems.append("div")
    .attr("class", "flex-shrink-0 mr-4 mt-1")
    .html(d => `
      <div class="relative w-8 h-8">
        <div class="absolute inset-0 rounded-full"></div>
        <img src="${basePath}${d.iconUrl}" class="relative w-8 h-8" alt="${d.name}" />
      </div>
    `);

  legendItems.append("div")
    .html(d => `
      <p class="font-bold" style="color: ${d.color};">${d.name}</p>
      <p class="text-sm text-gray-600">${d.legend}</p>
    `);
}