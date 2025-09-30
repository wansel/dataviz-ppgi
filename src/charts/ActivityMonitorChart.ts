// src/ActivityMonitor.js
import * as d3 from 'd3';

/**
 * Renderiza o gráfico ActivityMonitor.
 * @param {string} selector Seletor CSS para o container onde o gráfico será renderizado.
 * @param {ActivityMonitorData} data Os dados brutos do arquivo JSON.
 * @param {object} options Opções de configuração para customizar a visualização.
 */
export function drawActivityMonitor(
  selector,
  data,
  options = {}
) {
  // --- 1. Configurações e Preparação ---
  const defaults = {
    margin: { top: 120, right: 20, bottom: 50, left: 250 },
    rowHeight: 60,
    columnWidth: 100,
    // A configuração de ícones e cores agora pode ser sobrescrita via options
    stateConfig: {
      'correto': { icon: '✓', class: 'text-emerald-500 font-bold' },
      'incorreto': { icon: '✕', class: 'text-red-500 font-bold' },
      'visualizou': { icon: '👁', class: 'text-sky-500' },
      'nao-visualizou': { icon: '➖', class: 'text-slate-300' },
      'aguardando-resposta': { icon: '💬', class: 'text-amber-500' },
      'aguardando-correcao': { icon: '📝', class: 'text-blue-500' },
      'default': { icon: '●', class: 'text-slate-300' }
    }
  };

  // Mescla as opções padrão com as fornecidas pelo usuário
  const config = {
    ...defaults,
    ...options,
    margin: { ...defaults.margin, ...options.margin }, // Garante a mesclagem profunda das margens
  };

  const container = d3.select(selector);
  if (container.empty()) {
    console.error(`Erro: O seletor "${selector}" não foi encontrado.`);
    return;
  }
  container.html(""); // Limpa o container

  // --- Tooltip ---
  const tooltip = d3.select('body').append("div")
    .attr("class", "activity-tooltip absolute opacity-0 pointer-events-none p-3 bg-slate-800 text-white rounded-lg shadow-xl z-10 text-sm")
    .style("transition", "opacity 0.2s");
  
  // --- 2. Pré-processamento de Dados (interno) ---
  const flatResources = [];
  const headers = [];

  function flattenHierarchy(nodes, level, parentPath) {
    if (!nodes) return;
    nodes.forEach(node => {
      const currentPath = [...parentPath, node.name];
      if (node.type) { // É um recurso (folha)
        flatResources.push({ ...node, path: parentPath });
      }
      if (node.children) { // É um nó de agrupamento (pai)
        if (!headers[level]) headers[level] = [];
        const startIndex = flatResources.length;
        flattenHierarchy(node.children, level + 1, currentPath);
        const endIndex = flatResources.length;
        if (endIndex > startIndex) {
          headers[level].push({ name: node.name, level: level, startIndex: startIndex, colSpan: endIndex - startIndex });
        }
      }
    });
  }
  flattenHierarchy(data.topics, 0, []);

  // --- 3. Escalas ---
  const chartWidth = flatResources.length * config.columnWidth;
  const chartHeight = data.students.length * config.rowHeight;

  const x = d3.scaleBand()
    .domain(flatResources.map(r => r.id))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleBand()
    .domain(data.students.map(s => s.id))
    .range([0, chartHeight])
    .padding(0);

  // --- 4. Renderização do SVG ---
  const svg = container.append("svg")
    .attr("width", chartWidth + config.margin.left + config.margin.right)
    .attr("height", chartHeight + config.margin.top + config.margin.bottom)
    .append("g")
    .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
  
  // --- 5. Renderização dos Cabeçalhos ---
  const headerGroup = svg.append("g").attr("class", "chart-headers");
  headers.forEach((levelHeaders, level) => {
    // ... (lógica dos cabeçalhos)
    headerGroup.selectAll(`.header-level-${level}`)
      .data(levelHeaders)
      .join("text")
      .attr("x", d => x.paddingOuter() * x.step() + d.startIndex * x.step() + (d.colSpan * x.step()) / 2)
      .attr("y", -35 * (headers.length - level))
      .attr("class", "text-center font-semibold text-slate-600 text-base")
      .attr("text-anchor", "middle")
      .text(d => d.name);
  });
  headerGroup.selectAll(".resource-header")
    .data(flatResources)
    .join("text")
    .attr("x", d => x(d.id) + x.bandwidth() / 2)
    .attr("y", -15)
    .attr("class", "resource-header text-sm text-slate-500")
    .attr("text-anchor", "middle")
    .text(d => d.name);


  // --- 6. Renderização das Linhas de Estudantes ---
  const studentRows = svg.selectAll(".student-row")
    .data(data.students)
    .join("g")
    .attr("class", "student-row")
    .attr("transform", d => `translate(0, ${y(d.id)})`);

  studentRows.append("rect")
    .attr("x", -config.margin.left)
    .attr("width", chartWidth + config.margin.left + config.margin.right)
    .attr("height", y.bandwidth())
    .attr("class", (d, i) => (i % 2 === 0 ? "fill-slate-50" : "fill-white"));

  studentRows.append("image")
    .attr("href", d => d.avatar)
    .attr("x", -config.margin.left + 20)
    .attr("y", (y.bandwidth() - 40) / 2)
    .attr("width", 40)
    .attr("height", 40)
    .attr("clip-path", "circle(50%)");

  studentRows.append("text")
    .attr("x", -config.margin.left + 70)
    .attr("y", y.bandwidth() / 2)
    .attr("class", "student-name text-sm font-medium text-slate-800")
    .attr("dominant-baseline", "middle")
    .text(d => d.name);

  // --- 7. Renderização das Células de Interação (Ícones) ---
  const cells = studentRows.selectAll(".cell")
    .data(student => flatResources.map(resource => ({
      resource: resource,
      studentId: student.id,
      state: student.interactions[resource.id]
    })))
    .join("g")
    .attr("class", "cell cursor-pointer")
    .attr("transform", d => `translate(${x(d.resource.id)}, 0)`);
  
  cells.append("rect")
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("class", "fill-transparent");
    
  cells.append("text")
    .attr("x", x.bandwidth() / 2)
    .attr("y", y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("class", d => `text-2xl ${config.stateConfig[d.state]?.class || config.stateConfig.default.class}`)
    .text(d => config.stateConfig[d.state]?.icon || config.stateConfig.default.icon);

  // --- 8. Interatividade (Tooltip) ---
  // ... (a lógica do tooltip permanece a mesma, usando o objeto `tooltip` criado acima)
  cells
    .on("mouseover", function (event, d) {
      const stateLabel = (d.state || "Não interagiu").replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let tooltipHtml = `
        <div class="font-bold border-b border-slate-600 pb-2 mb-2">${d.resource.name}</div>
        <div class="flex flex-col space-y-1">
          <div><span class="font-semibold text-slate-400">Status:</span> ${stateLabel}</div>
          <div><span class="font-semibold text-slate-400">Tipo:</span> ${d.resource.type}</div>
          <div class="mt-1 pt-1 border-t border-slate-700 text-slate-300 italic">${d.resource.description}</div>
        </div>
      `;
      tooltip.html(tooltipHtml).style("opacity", 1);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));
}