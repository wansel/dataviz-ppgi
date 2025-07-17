import * as d3 from 'd3';
import { sortByKey } from '../utils/sortByKey';

export interface WeightItem {
  key: string;
  title: string;
  description: string;
  weight: number;
  img: string;
}

interface Options {
  imgPath?: string;
  width?: number;
  height?: number;
  box?: number;
}

export function drawWeightsChart(
  selector: string,
  data: WeightItem[],
  options: Options = {}
) {
  const container = d3.select(selector);
  container.selectAll('*').remove();

  const sortedData = sortByKey(data, 'weight');
  const box = options.box ?? 150;

  const weightScale = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.weight)!])
    .range([0, 1]);

  const chartContainer = container.append('div')
    .classed('weightsContainer', true)
    .classed('shadow', true);

  const grid = chartContainer.append('div')
    .classed('weightsGridContainer', true)
    .style('display', 'flex')
    .style('flex-wrap', 'wrap')
    .style('gap', '16px')
    .style('align-items', 'flex-end');

  const maxBox = box; // altura máxima

  const weights = grid.selectAll('.div-weight')
    .data(sortedData.filter(d => d.weight !== 0))
    .enter()
    .append('div')
    .classed('div-weight', true)
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('justify-content', 'flex-end')
    .style('align-items', 'center')
    .style('height', `${maxBox}px`)
    .style('position', 'relative');

  weights.append('div')
    .classed('title', true)
    .text(d => d.title);

  weights.append('img')
    .classed('weightimg', true)
    .attr('src', d => `${options.imgPath ?? ''}/peso.svg`)
    .attr('width', d => box * weightScale(d.weight))
    .attr('height', d => box * weightScale(d.weight));

  const tooltip = weights.append('span')
    .attr('class', 'tooltipContainer')
    .style('display', 'none')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('left', '50%')
    .style('bottom', '100%')
    .style('transform', 'translateX(-50%) translateY(-8px)')
    .style('width', '0px')
    .style('height', '0px')
    .style('overflow', 'hidden');

  const tooltipGrid = tooltip.append('div')
    .classed('tooltipGrid', true)
    .style('display', 'inline')
    .style('padding', '20px');

  const tooltipInfo = tooltipGrid.append('div')
    .classed('tooltipInfo', true)
    .style('margin', '16px');

  const title = tooltipInfo.append('div').classed('tooltipTitle', true);

  title.append('img')
    .classed('tooltipImg', true)
    .attr('src', (d:WeightItem) => `${options.imgPath ?? ''}${d.img}`)
    .attr('width', 50)
    .attr('height', 50);

  title.append('div')
    .style('padding', '8px')
    .text((d:WeightItem) => d.title);

  title.append('div')
    .classed('tooltipTitleWeight', true)
    .text((d:WeightItem) => `${d.weight} Kg`);

  tooltipInfo.append('div')
    .classed('tooltipDescription', true)
    .append('text')
    .text((d:WeightItem) => d.description);

  weights
    .on('mouseover', function () {
      d3.select(this).select('.tooltipContainer')
        .transition()
        .duration(500)
        .style('opacity', 1)
        .style('display', 'inline')
        .style('width', '240px')
        .style('height', 'auto');
    })
    .on('mouseout', function () {
      d3.select(this).select('.tooltipContainer')
        .transition()
        .duration(500)
        .style('opacity', 0)
        .style('display', 'none')
        .style('width', '0px')
        .style('height', '0px');
    });

  // Corrige deslocamento da última tooltip
  grid.select('.div-weight:last-child .tooltipContainer')
    .style('transform', 'translateX(-240px)');
}