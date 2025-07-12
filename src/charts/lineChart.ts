import * as d3 from 'd3';

export function drawLineChart(
  selector: string,
  data: { x: number, y: number }[],
  width = 400,
  height = 200
) {
  const svg = d3.select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x)!)
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)!])
    .range([height, 0]);

  const line = d3.line<{ x: number, y: number }>()
    .x(d => x(d.x))
    .y(d => y(d.y));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', line);
}