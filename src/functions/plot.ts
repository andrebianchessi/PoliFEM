import { Element } from '../models/element'
import { plot, Plot } from 'nodeplotlib'
export function plotElements () {
    const x = []
    const y = []
    for (const [, e] of Element.all) {
        x.push(e.n1.x)
        y.push(e.n1.y)
        x.push(e.n2.x)
        y.push(e.n2.y)
    }
    // const data: Plot[] = [{ x: [1, 3, 4, 5], y: [3, 12, 1, 4], text: ['a', 'b', 'c', 'd'], hoverinfo: 'text' }]
    const data: Plot[] = [{ x, y }]
    plot(data)
}
