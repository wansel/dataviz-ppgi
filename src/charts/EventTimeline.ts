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
  const margin = { top: 50, right: 20, bottom: 40, left: 340 };
  // margin.left é o espaço reservado para o nome e a coluna de info
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  //Definindo duração do evento
  const eventDurationMinutes = (data.event.end.getTime() - data.event.start.getTime()) / (1000 * 60);
  let delayThreshold = options.initialDelay ?? 15;

  // Container principal
  const container = d3.select(selector);
  if (container.empty()) {
    console.error(`Elemento não encontrado para o seletor: "${selector}"`);
    return;
  }
  // Limpa o conteúdo anterior para evitar duplicatas ao redesenhar
  container.html("");

  const svg = container
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
// Escalas
  const marginMinutes = 30;
  const ms = marginMinutes * 60 * 1000;
  const x = d3.scaleTime()
    .domain([new Date(data.event.start.getTime() - ms), new Date(data.event.end.getTime() + ms)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.students.map(d => d.name))
    .range([0, height])
    .padding(0);

  
  // Estado da Ordenação
  let sortBy: { column: "name" | "stats" | null, order: "asc" | "desc" } = {
    column: null,
    order: "asc"
  };

  // Fundo do evento (retângulo cinza)
  chartArea.append('rect')
    .attr('x', x(data.event.start))
    .attr('y', 0)
    .attr('width', x(data.event.end) - x(data.event.start))
    .attr('height', height)
    .attr('fill', '#e0e0e05a')
    .lower();

  // Eixo X
  chartArea.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat('%H:%M')));



  // Grupo de cabeçalhos
  const headerGroup = svg.append("g")
    .attr("class", "headers")
    .attr("transform", `translate(${margin.left}, ${margin.top - 20})`); // Era - 10

  // ===== Coluna "Estudante"
  headerGroup.append("text")
    .attr("x", -margin.left + 10)
    .attr("y", 0)
    .attr("class", "cursor-pointer select-none font-semibold text-sm")
    .text("Estudante ▲▼")
    .on("click", () => handleSort("name"));


  // ===== Coluna "Tempo/Conexões"
  headerGroup.append("text")
    .attr("x", -90)
    .attr("y", 0)
    .attr("class", "cursor-pointer select-none font-semibold text-sm")
    .text("Tempo/Conexões ▲▼")
    .on("click", () => handleSort("stats"));


  // ===== Coluna "Antes"
  headerGroup.append("text")
    .attr("x", x(data.event.start) - 10) // um pouco antes do retângulo cinza
    .attr("y", -5)
    .attr("text-anchor", "end")
    // .style("font-weight", "bold")
    .style("font-size", "13px")
    .text("Antes");

  // ===== Coluna "Durante"
  headerGroup.append("text")
    .attr("x", (x(data.event.start) + x(data.event.end)) / 2) // centraliza no retângulo cinza
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", "13px")
    .text("Durante");

  // ===== Coluna "Depois"
  headerGroup.append("text")
    .attr("x", x(data.event.end) + 20) // logo após o retângulo cinza
    .attr("y", -5)
    .attr("text-anchor", "start")
    // .style("font-weight", "bold")
    .style("font-size", "13px")
    .text("Depois");

  // =================================================================
  // ✨ INÍCIO DA REATORAÇÃO PRINCIPAL ✨
  // =================================================================

  /**
   * Função principal que cria e posiciona todas as linhas de estudantes.
   */
  function redraw() {
    // Vincula os dados a grupos <g>, usando o nome do estudante como chave.
    // A chave é crucial para que o D3 mantenha a correspondência correta dos elementos durante as atualizações.
    const studentRowGroups = chartArea.selectAll<SVGGElement, StudentData>(".student-row")
      .data(data.students, d => d.name)
      .join(
        // ENTER: Cria a estrutura base para cada novo estudante.
        enter => {
          const g = enter.append("g")
            .attr("class", "student-row")
            .attr("transform", d => `translate(0, ${y(d.name)!})`);

          // 1. Fundo da linha (Zebra)
          g.append("rect")
            .attr("class", "row-bg")
            .attr("x", -margin.left)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", y.bandwidth())
            .attr("fill", (_, i) => (i % 2 === 0 ? '#FFFFFF' : '#F8F8F8'))
            .lower();

          // 2. Avatar
          const avatarSize = y.bandwidth() * 0.8;
          g.append("image")
            .attr("class", "student-avatar")
            .attr("x", -margin.left + 10)
            .attr("y", (y.bandwidth() - avatarSize) / 2)
            .attr("width", avatarSize)
            .attr("height", avatarSize)
            .attr("href", d => d.avatar)
            .attr("clip-path", "circle(50%)");

          // 3. Ícone de status (offline)
          g.append("image")
            .attr("class", "status-icon")
            .attr("xlink:href", d => d.sessions.length === 0 ? "/img/offline.png" : null)
            .attr("x", -margin.left + 10)
            .attr("y", 4)
            .attr("width", 16)
            .attr("height", 16);

          // 4. Nome do estudante (com quebra de linha)
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
              
              textElement.attr("y", y.bandwidth() / 2 - (lines.length -1) * 7); // Ajuste vertical para múltiplas linhas

              lines.forEach((ln, i) => {
                  textElement.append("tspan")
                      .attr("x", -margin.left + 10 + avatarSize + 6)
                      .attr("dy", i === 0 ? 0 : "1.2em")
                      .text(ln);
              });
          });

          // 5. Texto de estatísticas (Tempo/Conexões)
          g.append("text")
            .attr("class", "student-stats")
            .attr("x", -90)
            .attr("y", y.bandwidth() / 2)
            .style("font-size", "12px")
            .attr("dominant-baseline", "central");

          // 6. Fundo cinza claro para a área das barras
          g.append("rect")
            .attr("class", "timeline-bg")
            .attr("x", 0)
            .attr("y", y.bandwidth() / 3)
            .attr("width", width)
            .attr("height", y.bandwidth() / 3)
            .attr("fill", "#00000011")
            .lower();

          // 7. Container para as barras de sessão
          g.append("g")
            .attr("class", "session-bars-container");

          return g;
        }
      );

    // Após criar a estrutura, atualiza os elementos dinâmicos (cores e texto)
    updateColorsAndStats(studentRowGroups);
  }

  /**
   * Atualiza apenas os elementos que dependem do `delayThreshold` (cores e estatísticas).
   * É mais leve do que redesenhar tudo.
   * @param selection A seleção D3 dos grupos de estudantes a serem atualizados.
   */
  function updateColorsAndStats(selection: d3.Selection<SVGGElement, StudentData, SVGGElement, unknown>) {
    const barHeight = 15;

    selection.each(function(d) {
      const studentRow = d3.select(this);

      // --- Cálculos ---
      const totalMinutes = d3.sum(d.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
      const totalSessions = d.sessions.length;
      const barColor = totalMinutes < delayThreshold
        ? "red"
        : totalMinutes >= (eventDurationMinutes - delayThreshold)
        ? "#2196f3"
        : "#f4b400";

      // --- Atualizações ---

      // Atualiza filtro do avatar
      studentRow.select<SVGImageElement>(".student-avatar")
        .attr("filter", totalSessions === 0 ? "url(#grayscale)" : null);

      // Atualiza texto de estatísticas
      const statsText = studentRow.select<SVGTextElement>(".student-stats");
      statsText.selectAll("tspan").remove(); // Limpa antes de adicionar
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      const timeLabel = `${hours > 0 ? hours + "h" : ""}${minutes}m`;
      statsText.append("tspan").attr("x", -90).attr("dy", "-0.5em").text(timeLabel);
      statsText.append("tspan").attr("x", -90).attr("dy", "1.2em").text(`${totalSessions} con.`);

      // Atualiza barras de sessão (Data Join aninhado)
      studentRow.select<SVGGElement>(".session-bars-container")
        .selectAll("rect")
        .data(d.sessions)
        .join("rect")
        .attr("x", s => x(s.start))
        .attr("y", y.bandwidth() / 2 - barHeight / 2)
        .attr("width", s => x(s.end) - x(s.start))
        .attr("height", barHeight)
        .attr("fill", barColor);
    });
  }

  /**
   * Lida com a lógica de ordenação e dispara a transição.
   */
  function updateScalesAndRedraw() {
    // 1. Atualiza o domínio da escala Y com a nova ordem dos estudantes
    y.domain(data.students.map(d => d.name));

    // Define a transição para ser usada em todos os elementos
    const t = svg.transition().duration(750);

    // 2. ✨ RE-VINCULA OS DADOS À SELEÇÃO (PASSO CRUCIAL) ✨
    // Esta linha informa ao D3 sobre a nova ordem dos dados.
    // A função de chave (d => d.name) é essencial para garantir que o D3
    // mantenha o mesmo elemento DOM para cada estudante, apenas reordenando a seleção.
    const studentRows = chartArea.selectAll<SVGGElement, StudentData>(".student-row")
      .data(data.students, d => d.name);

    // 3. Transiciona cada grupo `.student-row` para sua nova posição vertical
    studentRows.transition(t)
      .attr("transform", d => `translate(0, ${y(d.name)!})`);

    // 4. ATUALIZA A COR DO FUNDO (ZEBRA) DURANTE A TRANSIÇÃO
    // Como os dados foram re-vinculados no passo 2, o índice 'i' aqui
    // agora corresponde à nova posição do estudante, corrigindo o padrão de cores.
    studentRows.select<SVGRectElement>(".row-bg")
      .transition(t)
      .attr("fill", (_, i) => {
        // Agora o 'i' está correto!
        return i % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
      });
  }
  
  /**
   * Centraliza a lógica de clique nos cabeçalhos para ordenação
   */
  function handleSort(column: "name" | "stats"){
      if (sortBy.column === column) {
        sortBy.order = sortBy.order === "asc" ? "desc" : "asc";
      } else {
        sortBy.column = column;
        sortBy.order = "asc";
      }
      
      const sortOrder = sortBy.order === "asc" ? d3.ascending : d3.descending;

      data.students.sort((a, b) => {
          if (column === 'name') {
              return sortOrder(a.name, b.name);
          } else { // stats
              const totalA = d3.sum(a.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
              const totalB = d3.sum(b.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
              return sortOrder(totalA, totalB);
          }
      });

      updateScalesAndRedraw();
  }


  // =================================================================
  // ✨ FIM DA REATORAÇÃO PRINCIPAL ✨
  // =================================================================

  // Controles (Input de Atraso)
  const controls = container.append("div").attr("class", "mt-4 flex justify-center items-center gap-2");
  controls.append("label").attr("for", "delay-input").text("Atraso (min):");
  const delayInput = controls.append("input")
    .attr("id", "delay-input")
    .attr("type", "number")
    .attr("value", delayThreshold)
    .attr("min", 0)
    .attr("step", 1)
    .attr("class", "border rounded px-2 py-1 w-20 text-center");

  delayInput.on("input", function() {
    delayThreshold = parseInt((this as HTMLInputElement).value, 10) || 0;
    // Chama a função mais leve, pois apenas cores e texto mudam.
    updateColorsAndStats(chartArea.selectAll(".student-row"));
  });

  // Desenho inicial
  redraw();
}