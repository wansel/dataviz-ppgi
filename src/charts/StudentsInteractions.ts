import * as d3 from 'd3';

export interface StudentsBoard {
    students: StudentRow[];
}

export interface StudentRow {
  avatar: string;
  name: string;
  weight: number;
  description: string;
  interactions: 
}

interface Options {
  imgPath?: string;
  width?: number;
  height?: number;
  box?: number;
}

export function drawStudentsInteractions(
    selector: string,
    data: StudentRow[]
    // options: Options = {}
) {
    const container = d3.select(selector);
    container.selectAll('*').remove();



}