import { Matrix } from 'mathjs'
import { Element } from './element'
import { math } from './math'
import { Node } from './node'
import { plot, Plot } from 'nodeplotlib'

export class Problem {
    nodes: Map<number, Map<number, Node>>
    elements: Map<number, Element>
    K?: Matrix
    U?: Matrix
    F?: Matrix

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.elements = new Map<number, Element>()
    }

    build () {
        this.K = math.zeros!([this.nodes.size * 6, this.nodes.size * 6], 'sparse') as Matrix
        this.U = math.zeros!([this.nodes.size * 6, 1], 'sparse') as Matrix
        this.F = math.zeros!([this.nodes.size * 6, 1], 'sparse') as Matrix
    }

    plot () {
        const x = []
        const y = []
        for (const [, e] of this.elements) {
            x.push(e.n1.x)
            y.push(e.n1.y)
            x.push(e.n2.x)
            y.push(e.n2.y)
        }
        // const data: Plot[] = [{ x: [1, 3, 4, 5], y: [3, 12, 1, 4], text: ['a', 'b', 'c', 'd'], hoverinfo: 'text' }]
        const data: Plot[] = [{ x, y }]
        plot(data)
    }
}
