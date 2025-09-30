
import { drawActivityMonitor } from '../src';

import jsonData from './data/activity-monitor-data.json';

// Chama a função de desenho diretamente com os dados do JSON
drawActivityMonitor('#activity-monitor-chart', jsonData);

// EXEMPLO: Como usar o objeto de 'options' para customizar o gráfico
// Para testar, descomente a linha abaixo e comente a de cima.
/*
drawActivityMonitor('#activity-monitor-chart', jsonData, {
  rowHeight: 75,
  columnWidth: 120,
  margin: {
    left: 300 // Aumenta o espaço para nomes de estudantes maiores
  }
});
*/