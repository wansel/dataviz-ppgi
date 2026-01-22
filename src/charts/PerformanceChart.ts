import * as d3 from 'd3';

interface DifficultyPerformance {
  label: string;      // "Fácil", "Média", "Difícil"
  correct: number;
  incorrect: number;
  total: number;
}

interface StudentPerformance {
  id: string;
  name: string;
  avatar: string;
  performances: DifficultyPerformance[]; // Array de 3 posições
}

interface PerformanceChartData {
  students: StudentPerformance[];
}

interface Options {
  basePath?: string;
  width?: number;
  initialSort?: {
    column: "name";
    order?: "asc" | "desc";
  };
}


/**
 * Função para parsear o JSON bruto. 
 * Embora este gráfico não use objetos Date (diferente dos anteriores), 
 * mantemos a função para garantir tipagem e consistência na sua biblioteca.
 */
export function parsePerformanceData(jsonData: any): PerformanceChartData {
  if (!jsonData.students || !Array.isArray(jsonData.students)) {
    throw new Error("Formato de JSON inválido: esperado array de estudantes.");
  }
  return jsonData as PerformanceChartData;
}

/**
 * Visualização de Desempenho da Turma
 */
export function drawPerformanceChart(
  selector: string,
  data: PerformanceChartData,
  options: Options = {}
) {
  // 1. Configurações Iniciais
  const basePath = options.basePath ?? '';
  const margin = { top: 40, right: 60, bottom: 20, left: 250 };
  const rowHeight = 90; 
  const width = (options.width ?? 900) - margin.left - margin.right;
  const height = data.students.length * rowHeight;

  let sortBy = options.initialSort ?? { column: "name", order: "asc" };

  // 2. Ordenação Inicial dos Dados
  const initialOrder = sortBy.order === 'asc' ? d3.ascending : d3.descending;
  data.students.sort((a, b) => initialOrder(a.name, b.name));

  const container = d3.select(selector);
  if (container.empty()) return;
  container.html("");

  // --- ADICIONADO: Configuração do Tooltip ---
  const tooltip = container.append("div")
    .attr("class", "performance-tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("background", "rgba(17, 24, 39, 0.95)") // bg-gray-900 com opacidade
    .style("color", "#fff")
    .style("padding", "8px 12px")
    .style("border-radius", "6px")
    .style("font-size", "12px")
    .style("box-shadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
    .style("z-index", "100")
    .style("transition", "opacity 0.15s");

  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- Escalas ---
  const y = d3.scaleBand()
    .domain(data.students.map(d => d.id))
    .range([0, height])
    .padding(0);

  const maxTotal = d3.max(data.students.flatMap(s => s.performances.map(p => p.total))) ?? 0;
  const x = d3.scaleLinear()
    .domain([0, maxTotal])
    .range([0, width * 0.7]);

  // --- Cabeçalhos ---
  const headerGroup = svg.append("g")
    .attr("transform", `translate(20, ${margin.top - 15})`);

  const studentHeader = headerGroup.append("text")
    .attr("class", "text-sm font-bold cursor-pointer select-none")
    .style("font-family", "sans-serif")
    .text(`Estudante ${sortBy.order === 'asc' ? '▲' : '▼'}`)
    .on("click", function() {
        sortBy.order = sortBy.order === 'asc' ? 'desc' : 'asc';
        d3.select(this).text(`Estudante ${sortBy.order === 'asc' ? '▲' : '▼'}`);
        handleSort();
    });

  headerGroup.append("text")
    .attr("x", margin.left - 20)
    .attr("class", "text-sm font-semibold text-gray-600")
    .style("font-family", "sans-serif")
    .text("Quantidade Respondida / Total");

  /**
   * Função interna de desenho (Redraw)
   */
  function draw() {
    const studentRows = chartArea.selectAll<SVGGElement, StudentPerformance>(".student-row")
      .data(data.students, d => d.id)
      .join(
        enter => {
          const g = enter.append("g")
            .attr("class", "student-row")
            .attr("transform", d => `translate(0, ${y(d.id)!})`);

          // Fundo Zebrado
          g.append("rect")
            .attr("class", "row-bg")
            .attr("x", -margin.left)
            .attr("width", width + margin.left + margin.right)
            .attr("height", rowHeight)
            .attr("fill", (_, i) => i % 2 === 0 ? "#F9FAFB" : "#FFFFFF");

          // Avatar
          const avatarSize = y.bandwidth() * 0.8;
          g.append("image")
            .attr("x", -margin.left + 20)
            .attr("y", rowHeight / 2 - 25)
            .attr("width", 50)
            .attr("height", 50)
            .attr("href", d => `${basePath}${d.avatar}`)
            .attr("clip-path", "circle(50%)");

          // Nome
          // g.append("text")
          //   .attr("x", -margin.left + 80)
          //   .attr("y", rowHeight / 2)
          //   .attr("dominant-baseline", "middle")
          //   .attr("class", "text-sm font-medium")
          //   .style("font-family", "sans-serif")
          //   .text(d => d.name);
          const nameText = g.append("text")
            .attr("class", "student-name")
            .attr("x", -margin.left + 10 + avatarSize + 6)
            .attr("y", y.bandwidth() / 2)
            .style("font-size", "12px")
            .attr("dominant-baseline", "central");

          nameText.each(function(d) {
              const textElement = d3.select(this);
              const maxChars = 20;
              const words = d.name.split(" ");
              let line = "";
              const lines: string[] = [];
              words.forEach(w => {
                  if ((line + " " + w).trim().length > maxChars) {
                      lines.push(line.trim());
                      line = w;
                  } else {
                      line = (line + " " + w).trim();
                  }
              });
              if (line) lines.push(line.trim());
              
              textElement.attr("y", y.bandwidth() / 2 - (lines.length -1) * 7);

              lines.forEach((ln, i) => {
                  textElement.append("tspan")
                      .attr("x", -margin.left + 10 + avatarSize + 6)
                      .attr("dy", i === 0 ? 0 : "1.2em")
                      .text(ln);
              });
          });

          // Container para as 3 barras
          g.append("g")
            .attr("class", "bars-group")
            .attr("transform", `translate(0, 15)`);

          return g;
        }
      );

    // Atualiza as sub-barras (Nested Selection)
    studentRows.each(function(student) {
      const g = d3.select(this).select(".bars-group");
      const subBarHeight = 16;
      const subBarSpacing = 6;

      student.performances.forEach((perf, i) => {
        const yPos = i * (subBarHeight + subBarSpacing);
        const barGroup = g.selectAll(`.diff-bar-${i}`)
          .data([perf])
          .join("g")
          .attr("class", `diff-bar-${i}`);

        // --- ADICIONADO: Eventos de Interatividade no barGroup ---
        barGroup
          .style("cursor", "pointer")
          .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            tooltip.html(`
              <div style="font-weight: bold; border-bottom: 1px solid #374151; margin-bottom: 4px; padding-bottom: 4px;">${d.label}</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="color: #34d399;">${d.correct} acertos</span>
                <span style="color: #fb7185;">${d.incorrect} erros</span>
              </div>
            `);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function() {
            tooltip.style("opacity", 0);
          });

        // Barra Cinza (Total)
        barGroup.selectAll(".bg-bar").data([perf]).join("rect")
          .attr("x", 0)
          .attr("y", yPos)
          .attr("width", x(perf.total))
          .attr("height", subBarHeight)
          .attr("fill", "#E5E7EB")
          .attr("rx", 2);

        // Barra Vermelha (Erros)
        barGroup.selectAll(".err-bar").data([perf]).join("rect")
          .attr("x", 0)
          .attr("y", yPos)
          .attr("width", x(perf.incorrect))
          .attr("height", subBarHeight)
          .attr("fill", "#EF4444")
          .attr("rx", 2);

        // Barra Verde (Acertos)
        barGroup.selectAll(".corr-bar").data([perf]).join("rect")
          .attr("x", x(perf.incorrect))
          .attr("y", yPos)
          .attr("width", x(perf.correct))
          .attr("height", subBarHeight)
          .attr("fill", "#10B981")
          .attr("rx", 2);

        // Texto da Fração (00/00)
        barGroup.selectAll(".fraction-text").data([perf]).join("text")
          .attr("x", x(perf.total) + 10)
          .attr("y", yPos + subBarHeight / 2)
          .attr("dominant-baseline", "middle")
          .attr("class", "text-xs text-gray-500")
          .style("font-family", "monospace")
          .text(`${(perf.correct + perf.incorrect).toString().padStart(2, '0')}/${perf.total.toString().padStart(2, '0')}`);
      });
    });
  }

  /**
   * Lógica de Reordenação com Transição
   */
  function handleSort() {
    const order = sortBy.order === 'asc' ? d3.ascending : d3.descending;
    data.students.sort((a, b) => order(a.name, b.name));
    y.domain(data.students.map(d => d.id));
    
    const t = svg.transition().duration(750);
    
    const rows = chartArea.selectAll<SVGGElement, StudentPerformance>(".student-row")
      .data(data.students, d => d.id);

    rows.transition(t)
      .attr("transform", d => `translate(0, ${y(d.id)!})`);

    rows.select<SVGRectElement>(".row-bg")
      .transition(t)
      .attr("fill", (_, i) => i % 2 === 0 ? "#F9FAFB" : "#FFFFFF");
  }

  draw();
}