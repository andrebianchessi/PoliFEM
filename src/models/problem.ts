import { Element } from './element'
import { Node } from './node'
import { Load } from './load'
import { BoundaryCondition } from './boundaryCondition'
import { Annotations } from 'plotly.js'
import { Layout, Plot, plot } from 'nodeplotlib'
import { math } from './math'
import { replaceRowAndColByZeros } from '../functions/matrixUtils'
import { Matrix } from 'mathjs'

export class Problem {
    dof: number // degrees of freedom
    nodes: Map<number, Map<number, Node>>
    nodeCount: number
    elements: Map<number, Element>
    elementCount: number
    loads: Load[]
    boundaryConditions: BoundaryCondition[]
    K?: Matrix
    F?: Matrix
    U?: Matrix | Matrix[]
    M?: Matrix

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.nodeCount = 0
        this.elements = new Map<number, Element>()
        this.elementCount = 0
        this.loads = []
        this.boundaryConditions = []
        this.dof = 0
    }

    build () {
        this.buildK()
        this.buildF()
        this.applyBC()
    }

    buildK () {
        // Initialize matrix
        this.K = math.zeros!([this.dof, this.dof], 'sparse') as Matrix

        // Build stiffness matrix
        for (const [, e] of this.elements) {
            let localIndices: number[] = []
            let globalIndices: number[] = []
            if (e.type === 'Frame') {
                localIndices = [0, 1, 2, 3, 4, 5]
                globalIndices = [e.n1.uIndex!, e.n1.vIndex!, e.n1.wIndex!, e.n2.uIndex!, e.n2.vIndex!, e.n2.wIndex!]
            } else if (e.type === 'Truss') {
                localIndices = [0, 1, 2, 3]
                globalIndices = [e.n1.uIndex!, e.n1.vIndex!, e.n2.uIndex!, e.n2.vIndex!]
            }
            for (let i = 0; i < localIndices.length; i++) {
                for (let j = 0; j < localIndices.length; j++) {
                    const initialVal = this.K!.get([globalIndices[i]!, globalIndices[j]!])!
                    this.K!.set([globalIndices[i]!, globalIndices[j]!], initialVal + e.K.k.get([localIndices[i]!, localIndices[j]!]))
                }
            }
        }
    }

    buildF () {
        // Initialize vector
        this.F = math.zeros!([this.dof, 1], 'sparse') as Matrix

        // Build load vector
        for (const l of this.loads) {
            if (l.node.uIndex != null) {
                this.F!.set([l.node.uIndex!, 0], this.F!.get([l.node.uIndex!, 0]) + l.x)
            }
            if (l.node.vIndex != null) {
                this.F!.set([l.node.vIndex!, 0], this.F!.get([l.node.vIndex!, 0]) + l.y)
            }
            if (l.node.wIndex != null) {
                this.F!.set([l.node.wIndex!, 0], this.F!.get([l.node.wIndex!, 0]) + l.w)
            }
        }
    }

    applyBC () {
        for (const b of this.boundaryConditions) {
            for (const i of b.restrictedIndices) {
                replaceRowAndColByZeros(this.K!, i)
                this.K!.set([i, i], 1)
                this.F!.set([i, 0], b.value)
            }
        }
    }

    plot () {
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        plot(data, layout)
    }

    problemDescriptionPlotData (): [Plot[], Layout] {
        const arrows:Partial<Annotations>[] = []
        const momentsX = []
        const momentsY = []
        const momentsText = []
        const bcsX = []
        const bcsY = []
        const bcsText = []

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
            { x: bcsX, y: bcsY, name: 'Boundary conditions', text: bcsText, hoverinfo: 'text', marker: { color: 'purple', size: 13 }, mode: 'markers', type: 'scatter' }
        ]

        let first = true
        for (const [, e] of this.elements) {
            const x = []
            const y = []
            const nodesText = []
            for (const n of [e.n1, e.n2]) {
                x.push(n.x)
                y.push(n.y)
                nodesText.push(n.index.toString())
            }
            data.push({ x, y, text: nodesText, name: 'Undeformed Structure', hoverinfo: 'text', marker: { color: 'black' }, showlegend: first })
            first = false
        }

        const layout:Layout = {
            hovermode: 'closest',
            annotations: arrows
        }
        return [data, layout]
    }
}
