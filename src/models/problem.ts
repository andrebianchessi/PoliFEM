import { Matrix } from 'mathjs'
import { Element } from './element'
import { math, replaceRowAndColByZeros } from './math'
import { Node } from './node'
import { Layout, plot, Plot } from 'nodeplotlib'
import { Load } from './load'
import { BoundaryCondition } from './boundaryCondition'
import { Annotations } from 'plotly.js'

export class Problem {
    nodes: Map<number, Map<number, Node>>
    nodeCount: number
    elements: Map<number, Element>
    elementCount: number
    loads: Load[]
    boundaryConditions: BoundaryCondition[]
    K?: Matrix
    U?: Matrix
    F?: Matrix

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.nodeCount = 0
        this.elements = new Map<number, Element>()
        this.elementCount = 0
        this.loads = []
        this.boundaryConditions = []
    }

    build () {
        // Initialize vectors and matrix
        this.K = math.zeros!([this.nodes.size * 6, this.nodes.size * 6], 'sparse') as Matrix
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

        // Build load vector
        for (const l of this.loads) {
            this.F!.set([l.node.uIndex, 0], this.F!.get([l.node.uIndex, 0]) + l.x)
            this.F!.set([l.node.vIndex, 0], this.F!.get([l.node.vIndex, 0]) + l.y)
            this.F!.set([l.node.wIndex, 0], this.F!.get([l.node.wIndex, 0]) + l.w)
        }

        // Apply BC's
        for (const b of this.boundaryConditions) {
            switch (b.type) {
            case 'Fix': {
                for (const i of [b.node.uIndex, b.node.vIndex, b.node.wIndex]) {
                    replaceRowAndColByZeros(this.K!, i)
                    this.K!.set([i, i], 1)
                    this.F!.set([i, 0], 0)
                }
                break
            }
            }
        }

        // Solve linear system
        this.U = math.usolve!(this.K!, this.F!) as Matrix
        console.log(this.U.toString())
    }

    plot () {
        const displacementScaleFactor = 2
        const x = []
        const y = []
        const xd = []
        const yd = []
        const displacements = []
        const arrows:Partial<Annotations>[] = []
        const momentsX = []
        const momentsY = []
        const momentsText = []
        const bcsX = []
        const bcsY = []
        const bcsText = []
        for (const [, e] of this.elements) {
            let dx = this.U!.get([e.n1.uIndex, 0])
            let dy = this.U!.get([e.n1.vIndex, 0])
            x.push(e.n1.x)
            y.push(e.n1.y)
            xd.push(e.n1.x + dx * displacementScaleFactor)
            yd.push(e.n1.y + dy * displacementScaleFactor)
            displacements.push('dx: ' + dx + '\ndy: ' + dy)

            dx = this.U!.get([e.n2.uIndex, 0])
            dy = this.U!.get([e.n2.vIndex, 0])
            x.push(e.n2.x)
            y.push(e.n2.y)
            xd.push(e.n2.x + dx * displacementScaleFactor)
            yd.push(e.n2.y + dy * displacementScaleFactor)
            displacements.push('dx: ' + dx + '\ndy: ' + dy)
        }
        const arrowsLength = 100
        for (const l of this.loads) {
            const scalingFactor = arrowsLength / Math.sqrt(l.x * l.x + l.y * l.y)
            const arrowX = -l.x * scalingFactor
            const arrowY = l.y * scalingFactor
            arrows.push(
                {
                    text: Math.sqrt(l.x * l.x + l.y * l.y).toString(),
                    x: l.node.x,
                    y: l.node.y,
                    xref: 'x',
                    yref: 'y',
                    showarrow: true,
                    arrowhead: 5,
                    ax: arrowX,
                    ay: arrowY,
                    arrowcolor: 'red',
                    font: { color: 'red', size: 17 }
                }
            )
            if (l.w !== 0) {
                momentsX.push(l.node.x)
                momentsY.push(l.node.y)
                momentsText.push(l.w.toString())
            }
        }
        for (const b of this.boundaryConditions) {
            bcsX.push(b.node.x)
            bcsY.push(b.node.y)
            if (b.value) {
                bcsText.push(b.type + ' : ' + b.value)
            } else {
                bcsText.push(b.type)
            }
        }

        const data: Plot[] = [
            { x: momentsX, y: momentsY, name: 'Applied moments', text: momentsText, hoverinfo: 'text', marker: { size: 18, color: 'red' }, mode: 'markers', type: 'scatter' },
            { x: bcsX, y: bcsY, name: 'Boundary conditions', text: bcsText, hoverinfo: 'text', marker: { color: 'purple', size: 13 }, mode: 'markers', type: 'scatter' },
            { x, y, name: 'Undeformed Structure', hoverinfo: 'none', marker: { color: 'black' } },
            { x: xd, y: yd, name: 'Deformed Structure (displacements scaled by ' + displacementScaleFactor + ')', text: displacements, hoverinfo: 'text', marker: { color: 'blue' } }
        ]
        const layout:Layout = {
            hovermode: 'closest',
            annotations: arrows
        }
        plot(data, layout)
    }
}
