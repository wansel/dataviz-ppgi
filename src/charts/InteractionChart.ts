import * as d3 from 'd3';

// =================================================================
// 1. INTERFACES E PARSER (permanecem os mesmos)
// =================================================================

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


// =================================================================
// 2. NOVA FUNÇÃO DA VISUALIZAÇÃO
// =================================================================

export function drawInteractionChart(
  selector: string,
  data: InteractionsData
) {
  // --- Configurações Iniciais ---
  const margin = { top: 20, right: 30, bottom: 20, left: 250 };
  const width = 1100 - margin.left - margin.right;
  const height = (data.students.length * 80);
  const daySpacing = 3; // Espaço em pixels entre os retângulos dos dias

  const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

  const container = d3.select(selector);
  container.html("");

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

  // Adiciona o retângulo para cada dia
  dayGroups.append("rect")
    .attr("height", 25)
    .attr("width", d => {
      return d.dailyTotalMinutes > 0 ? timeScaleWidth(d.dailyTotalMinutes) : 10;
    })
    .attr("rx", 3)   // borda arredondada horizontal
    .attr("ry", 3)   // borda arredondada vertical
    .attr("fill", d => d.dailyTotalMinutes > 0 ? "#3182ce" : "#8c8c8cff"); // Azul ou Cinza

  // Adiciona o texto (inicial do dia da semana) para cada dia
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
}