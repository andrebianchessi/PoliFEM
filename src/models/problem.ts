import { Matrix } from 'mathjs'
import { Element } from './element'
import { math } from './math'
import { Node } from './node'
import { plot, Plot } from 'nodeplotlib'
import { Load } from './load'

export class Problem {
    nodes: Map<number, Map<number, Node>>
    nodeCount: number
    elements: Map<number, Element>
    elementCount: number
    loads: Load[]
    K?: Matrix
    U?: Matrix
    F?: Matrix

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.nodeCount = 0
        this.elements = new Map<number, Element>()
        this.elementCount = 0
        this.loads = []
    }

    build () {
        // Initialize vectors and matrix
        this.K = math.zeros!([this.nodes.size * 6, this.nodes.size * 6], 'sparse') as Matrix
        this.U = math.zeros!([this.nodes.size * 6, 1], 'sparse') as Matrix
        this.F = math.zeros!([this.nodes.size * 6, 1], 'sparse') as Matrix

        // Build stiffness matrix
        for (const [, e] of this.elements) {
            const localIndices = [0, 1, 2, 3, 4, 5]
            const globalIndices = [e.n1.uIndex, e.n1.vIndex, e.n1.wIndex, e.n2.uIndex, e.n2.vIndex, e.n2.wIndex]
            for (const i of localIndices) {
                for (const j of localIndices) {
                    const initialVal = this.K!.get([globalIndices[i], globalIndices[j]])!
                    this.K!.set([globalIndices[i], globalIndices[j]], initialVal + e.K.k.get([i, j]))
                }
            }
        }
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
