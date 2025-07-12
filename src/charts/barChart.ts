import * as d3 from 'd3';

export function drawBarChart(
  selector: string,
  data: number[],
  width = 300,
  height = 150
) {
  const svg = d3.select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const xScale = d3.scaleBand()
    .domain(data.map((_, i) => i.toString()))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data)!])
    .range([height, 0]);

  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (_, i) => xScale(i.toString())!)
    .attr('y', d => yScale(d))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(d))
    .attr('fill', 'steelblue');
}