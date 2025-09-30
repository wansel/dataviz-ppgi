// src/ActivityMonitor.js
import * as d3 from 'd3';

// --- Funções Auxiliares (Helpers) ---

/**
 * Processa a hierarquia de tópicos para criar uma lista plana de recursos
 * e uma estrutura de dados para os cabeçalhos.
 * @param {Array} topics - A lista de tópicos do JSON.
 * @returns {{flatResources: Array, headers: Array}}
 */
function _flattenResources(topics) {
  const flatResources = [];
  const headers = [];

  function recurse(nodes, level) {
    if (!nodes) return;
    nodes.forEach(node => {
      // É um recurso (folha da árvore) se tiver a propriedade 'type'
      if (node.type) {
        flatResources.push(node);
      }
      // É um nó de agrupamento se tiver 'children'
      if (node.children) {
        const startIndex = flatResources.length;
        recurse(node.children, level + 1);
        const endIndex = flatResources.length;
        
        if (endIndex > startIndex) {
          if (!headers[level]) headers[level] = [];
          headers[level].push({
            name: node.name,
            startIndex: startIndex,
            colSpan: endIndex - startIndex
          });
        }
      }
    });
  }
  
  recurse(topics, 0);
  return { flatResources, headers };
}

/**
 * Cria e configura as escalas X e Y para o gráfico.
 * @returns {{x: d3.ScaleBand, y: d3.ScaleBand}}
 */
function _createScales(flatResources, students, chartWidth, chartHeight) {
  const x = d3.scaleBand()
    .domain(flatResources.map(r => r.id))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleBand()
    .domain(students.map(s => s.id))
    .range([0, chartHeight])
    .padding(0);
    
  return { x, y };
}

/**
 * Encapsula a criação e o controle do tooltip.
 * @returns {{show: Function, move: Function, hide: Function}}
 */
function _createTooltip() {
  const tooltip = d3.select('body').append("div")
    .attr("class", "activity-tooltip absolute opacity-0 pointer-events-none p-3 bg-slate-800 text-white rounded-lg shadow-xl z-10 text-sm")
    .style("transition", "opacity 0.2s ease-in-out");

  const show = (event, htmlContent) => {
    tooltip.html(htmlContent).style("opacity", 1);
  };
  const move = (event) => {
    tooltip
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 10}px`);
  };
  const hide = () => {
    tooltip.style("opacity", 0);
  };

  return { show, move, hide };
}

/**
 * Desenha os cabeçalhos hierárquicos do gráfico.
 */
function _drawHeaders(selection, { headers, flatResources, scales }) {
  const { x } = scales;
  const headerGroup = selection.append("g").attr("class", "chart-headers");

  headers.forEach((levelHeaders, level) => {
    headerGroup.selectAll(`.header-level-${level}`)
      .data(levelHeaders)
      .join("text")
      .attr("x", d => x(flatResources[d.startIndex].id) + (d.colSpan * x.step()) / 2 - (x.paddingInner() * x.step()) / 2)
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
}

/**
 * Desenha as linhas de estudantes, incluindo fundo, avatar e nome.
 */
function _drawStudentRows(selection, { students, scales, config, chartWidth }) {
  const { y } = scales;
  
  const studentRows = selection.selectAll(".student-row")
    .data(students)
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
    
  return studentRows;
}

/**
 * Desenha as células de interação e anexa os eventos de tooltip.
 */
function _drawInteractionCells(studentRows, { flatResources, scales, config, tooltip }) {
  const { x, y } = scales;
  
  const cells = studentRows.selectAll(".cell")
    .data(student => flatResources.map(resource => ({
      resource: resource,
      studentId: student.id,
      state: student.interactions[resource.id]
    })))
    .join("g")
    .attr("class", "cell cursor-pointer")
    .attr("transform", d => `translate(${x(d.resource.id)}, 0)`);

  // Adiciona um retângulo invisível para garantir uma área de hover consistente
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
    .text(d => config.stateConfig[d.state]?.icon || config.stateConfig.default.icon)
    .style("pointer-events", "none"); // Garante que o evento do mouse seja capturado pelo grupo 'g'

  // Anexa os eventos ao grupo da célula
  cells.on("mouseover", (event, d) => {
    const stateLabel = (d.state || "Não interagiu").replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const tooltipHtml = `
      <div class="font-bold border-b border-slate-600 pb-2 mb-2">${d.resource.name}</div>
      <div class="flex flex-col space-y-1">
        <div><span class="font-semibold text-slate-400">Status:</span> ${stateLabel}</div>
        <div><span class="font-semibold text-slate-400">Tipo:</span> ${d.resource.type}</div>
        <div class="mt-1 pt-1 border-t border-slate-700 text-slate-300 italic">${d.resource.description}</div>
      </div>
    `;
    tooltip.show(event, tooltipHtml);
  })
  .on("mousemove", tooltip.move)
  .on("mouseout", tooltip.hide);
}


// --- Função Principal (Orquestradora) ---

const DEFAULTS = {
  margin: { top: 120, right: 20, bottom: 50, left: 250 },
  rowHeight: 60,
  columnWidth: 100,
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

/**
 * Renderiza o gráfico ActivityMonitor.
 * @param {string} selector - Seletor CSS para o container.
 * @param {object} data - Os dados brutos do arquivo JSON.
 * @param {object} options - Opções de configuração para customizar a visualização.
 */
export function drawActivityMonitor(selector, data, options = {}) {
  // 1. Validação e Configuração
  const container = d3.select(selector);
  if (container.empty() || !data || !data.students) {
    console.error("Erro: Seletor inválido ou dados ausentes.");
    return;
  }
  
  const config = {
    ...DEFAULTS,
    ...options,
    margin: { ...DEFAULTS.margin, ...options.margin },
    stateConfig: { ...DEFAULTS.stateConfig, ...options.stateConfig }
  };
  container.html("");

  // 2. Preparação dos Dados e Escalas
  const { flatResources, headers } = _flattenResources(data.topics);
  const chartWidth = flatResources.length * config.columnWidth;
  const chartHeight = data.students.length * config.rowHeight;
  const scales = _createScales(flatResources, data.students, chartWidth, chartHeight);
  
  // 3. Criação dos Elementos SVG e Tooltip
  const svg = container.append("svg")
    .attr("width", chartWidth + config.margin.left + config.margin.right)
    .attr("height", chartHeight + config.margin.top + config.margin.bottom)
    .append("g")
    .attr("transform", `translate(${config.margin.left}, ${config.margin.top})`);
    
  const tooltip = _createTooltip();
  
  // 4. Desenho dos Componentes do Gráfico
  _drawHeaders(svg, { headers, flatResources, scales });
  const studentRows = _drawStudentRows(svg, { students: data.students, scales, config, chartWidth });
  _drawInteractionCells(studentRows, { flatResources, scales, config, tooltip });
}