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
  title?: string,
  subtitle?: string,
  imgPath?: string;
  basePath?: string; // Caminho base das imagens
  width?: number;
  height?: number;
  box?: number;
  initialDelay?: number; // valor inicial do atraso (minutos)
  initialSort?: {
    column: "name" | "stats";
    order?: "asc" | "desc";
  }
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
  // ADICIONADO: Processa a opção basePath, com uma string vazia como padrão.
  const basePath = options.basePath ?? '';

  const margin = { top: 50, right: 20, bottom: 40, left: 350 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  const eventDurationMinutes = (data.event.end.getTime() - data.event.start.getTime()) / (1000 * 60);
  let delayThreshold = options.initialDelay ?? 15;

  let sortBy: { column: "name" | "stats" | null, order: "asc" | "desc" };
  if (options.initialSort) {
    sortBy = {
      column: options.initialSort.column,
      order: options.initialSort.order || "asc"
    };
  } else {
    sortBy = {
      column: "name",
      order: "asc"
    };
  }

  if (sortBy.column) {
    const sortOrder = sortBy.order === "asc" ? d3.ascending : d3.descending;
    data.students.sort((a, b) => {
      if (sortBy.column === 'name') {
        return sortOrder(a.name, b.name);
      } else {
        const totalA = d3.sum(a.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
        const totalB = d3.sum(b.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
        return sortOrder(totalA, totalB);
      }
    });
  }

  const container = d3.select(selector);
  if (container.empty()) {
    console.error(`Elemento não encontrado para o seletor: "${selector}"`);
    return;
  }
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

  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const marginMinutes = 30;
  const ms = marginMinutes * 60 * 1000;
  const x = d3.scaleTime()
    .domain([new Date(data.event.start.getTime() - ms), new Date(data.event.end.getTime() + ms)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.students.map(d => d.name))
    .range([0, height])
    .padding(0);

  chartArea.append('rect')
    .attr('x', x(data.event.start))
    .attr('y', 0)
    .attr('width', x(data.event.end) - x(data.event.start))
    .attr('height', height)
    .attr('fill', '#e0e0e05a')
    .lower();

  chartArea.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat('%H:%M')));

  const headerGroup = svg.append("g")
    .attr("class", "headers")
    .attr("transform", `translate(${margin.left}, ${margin.top - 20})`);

  headerGroup.append("text")
    .attr("x", -margin.left + 10)
    .attr("y", 0)
    .attr("class", "sort-header sort-name cursor-pointer select-none font-semibold text-sm")
    .text("Estudante")
    .on("click", () => handleSort("name"));

  headerGroup.append("text")
    .attr("x", -120)
    .attr("y", 0)
    .attr("class", "sort-header sort-stats cursor-pointer select-none font-semibold text-sm")
    .text("Tempo/Conexões")
    .on("click", () => handleSort("stats"));

  headerGroup.append("text")
    .attr("x", x(data.event.start) - 10)
    .attr("y", -5)
    .attr("text-anchor", "end")
    .style("font-size", "13px")
    .text("Antes");

  headerGroup.append("text")
    .attr("x", (x(data.event.start) + x(data.event.end)) / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", "13px")
    .text("Durante");

  headerGroup.append("text")
    .attr("x", x(data.event.end) + 20)
    .attr("y", -5)
    .attr("text-anchor", "start")
    .style("font-size", "13px")
    .text("Depois");

  function redraw() {
    const studentRowGroups = chartArea.selectAll<SVGGElement, StudentData>(".student-row")
      .data(data.students, d => d.name)
      .join(
        enter => {
          const g = enter.append("g")
            .attr("class", "student-row")
            .attr("transform", d => `translate(0, ${y(d.name)!})`);

          g.append("rect")
            .attr("class", "row-bg")
            .attr("x", -margin.left)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", y.bandwidth())
            .attr("fill", (_, i) => (i % 2 === 0 ? '#FFFFFF' : '#F8F8F8'))
            .attr('fill-opacity', 0.5)
            .lower();

          const avatarSize = y.bandwidth() * 0.8;
          g.append("image")
            .attr("class", "student-avatar")
            .attr("x", -margin.left + 10)
            .attr("y", (y.bandwidth() - avatarSize) / 2)
            .attr("width", avatarSize)
            .attr("height", avatarSize)
            .attr("href", d => `${basePath}${d.avatar}`) // Adiciona o basePath ao href do avatar.
            .attr("clip-path", "circle(50%)");

          g.append("image")
            .attr("class", "status-icon")
            // MODIFICADO: Adiciona o basePath ao ícone de status e remove a barra inicial.
            .attr("xlink:href", d => d.sessions.length === 0 ? `${basePath}img/offline.png` : null)
            .attr("x", -margin.left + 10)
            .attr("y", 4)
            .attr("width", 16)
            .attr("height", 16);

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

          g.append("text")
            .attr("class", "student-stats")
            .attr("x", -120)
            .attr("y", y.bandwidth() / 2)
            .style("font-size", "12px")
            .attr("dominant-baseline", "central");

          g.append("rect")
            .attr("class", "timeline-bg")
            .attr("x", 0)
            .attr("y", y.bandwidth() / 3)
            .attr("width", width)
            .attr("height", y.bandwidth() / 3)
            .attr("fill", "#00000011")
            .lower();

          g.append("g")
            .attr("class", "session-bars-container");

          return g;
        }
      );

    updateColorsAndStats(studentRowGroups);
    updateHeaderIcons();
  }

  function updateColorsAndStats(selection: d3.Selection<SVGGElement, StudentData, SVGGElement, unknown>) {
    const barHeight = 15;

    selection.each(function(d) {
      const studentRow = d3.select(this);
      const totalMinutes = d3.sum(d.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
      const totalSessions = d.sessions.length;
      const barColor = totalMinutes < delayThreshold
        ? "red"
        : totalMinutes >= (eventDurationMinutes - delayThreshold)
        ? "#2196f3"
        : "#f4b400";

      studentRow.select<SVGImageElement>(".student-avatar")
        .attr("filter", totalSessions === 0 ? "url(#grayscale)" : null);

      const statsText = studentRow.select<SVGTextElement>(".student-stats");
      statsText.selectAll("tspan").remove();
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      const timeLabel = `${hours > 0 ? hours + "h" : ""}${minutes}m`;
      statsText.append("tspan").attr("x", -120).attr("dy", "-0.5em").text(timeLabel);
      statsText.append("tspan").attr("x", -120).attr("dy", "1.2em").text(`${totalSessions} con.`);

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

  function updateScalesAndRedraw() {
    y.domain(data.students.map(d => d.name));
    const t = svg.transition().duration(750);
    const studentRows = chartArea.selectAll<SVGGElement, StudentData>(".student-row")
      .data(data.students, d => d.name);

    studentRows.transition(t)
      .attr("transform", d => `translate(0, ${y(d.name)!})`);

    studentRows.select<SVGRectElement>(".row-bg")
      .transition(t)
      .attr("fill", (_, i) => {
        return i % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
      });
  }
  
  function updateHeaderIcons() {
    const nameHeader = headerGroup.select(".sort-name");
    const statsHeader = headerGroup.select(".sort-stats");
    const icon = sortBy.order === 'asc' ? ' ▲' : ' ▼';

    if (sortBy.column === 'name') {
      nameHeader.text("Estudante" + icon);
      nameHeader.classed("font-bold", true);
      statsHeader.classed("font-bold", false).text("Tempo/Conexões");
    } 
    else if (sortBy.column === 'stats') {
      statsHeader.text("Tempo/Conexões" + icon);
      statsHeader.classed("font-bold", true);
      nameHeader.classed("font-bold", false).text("Estudante");
    }
  }

  function handleSort(column: "name" | "stats"){
      if (sortBy.column === column) {
        sortBy.order = sortBy.order === "asc" ? "desc" : "asc";
      } else {
        sortBy.column = column;
        sortBy.order = "asc";
      }

      updateHeaderIcons();
      
      const sortOrder = sortBy.order === "asc" ? d3.ascending : d3.descending;

      data.students.sort((a, b) => {
          if (column === 'name') {
              return sortOrder(a.name, b.name);
          } else {
              const totalA = d3.sum(a.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
              const totalB = d3.sum(b.sessions, s => getMinutesWithinEvent(s, data.event.start, data.event.end));
              return sortOrder(totalA, totalB);
          }
      });

      updateScalesAndRedraw();
  }

  const controls = container.append("div").attr("class", "mt-4 flex justify-center items-center gap-2");
  controls.append("label").attr("for", "delay-input").text("Ausência (min):");
  const delayInput = controls.append("input")
    .attr("id", "delay-input")
    .attr("type", "number")
    .attr("value", delayThreshold)
    .attr("min", 0)
    .attr("step", 1)
    .attr("class", "border rounded px-2 py-1 w-20 text-center");

  delayInput.on("input", function() {
    delayThreshold = parseInt((this as HTMLInputElement).value, 10) || 0;
    updateColorsAndStats(chartArea.selectAll(".student-row"));
  });

  redraw();
}