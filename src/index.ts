import { plot, Plot } from 'nodeplotlib';
const data: Plot[] = [{x: [1, 3, 4, 5], y: [3, 12, 1, 4], text:['a','b','c','d'], hoverinfo:"text"}];
plot(data);