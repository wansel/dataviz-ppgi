
import { drawActivityMonitor } from '../src';

import jsonData from './data/activity-monitor-data.json';


// -- Exclusivo GITHUB pages
// Define o nome do seu repositório no GitHub
const NOME_DO_REPOSITORIO = 'dataviz-ppgi';
// Verifica se está rodando no GitHub Pages para definir o caminho base
const isGhPages = window.location.hostname.includes('github.io');
const basePath = isGhPages ? `/${NOME_DO_REPOSITORIO}/` : '/';
// ---



// --- LÓGICA DE ORDENAÇÃO ---
// Ordena o array 'students' dentro do objeto jsonData.
// A função 'localeCompare' garante a ordenação alfabética correta para nomes em português.
jsonData.students.sort((alunoA, alunoB) => {
  return alunoA.name.localeCompare(alunoB.name);
});
// -------------------------

// Chama a função de desenho diretamente com os dados do JSON
// drawActivityMonitor('#activity-monitor-chart', jsonData);

// Chama a função de desenho passando o basePath
drawActivityMonitor(
  '#activity-monitor-chart', 
  jsonData,
  { basePath: basePath }
);

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