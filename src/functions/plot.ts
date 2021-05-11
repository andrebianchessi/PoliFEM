import { plot, Plot } from 'nodeplotlib'
import { Problem } from '../models/problem'
export function plotElements (p:Problem) {
    const x = []
    const y = []
    for (const [, e] of p.elements) {
        x.push(e.n1.x)
        y.push(e.n1.y)
        x.push(e.n2.x)
        y.push(e.n2.y)
    }
    // const data: Plot[] = [{ x: [1, 3, 4, 5], y: [3, 12, 1, 4], text: ['a', 'b', 'c', 'd'], hoverinfo: 'text' }]
    const data: Plot[] = [{ x, y }]
    plot(data)
}
