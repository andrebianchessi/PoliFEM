import { Element } from './element'
import { Node } from './node'
import { Load } from './load'
import { BoundaryCondition } from './boundaryCondition'
import { Annotations } from 'plotly.js'
import { Layout, plot, Plot } from 'nodeplotlib'

export class Problem {
    dof: number // degrees of freedom
    nodes: Map<number, Map<number, Node>>
    nodeCount: number
    elements: Map<number, Element>
    elementCount: number
    loads: Load[]
    boundaryConditions: BoundaryCondition[]

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.nodeCount = 0
        this.elements = new Map<number, Element>()
        this.elementCount = 0
        this.loads = []
        this.boundaryConditions = []
        this.dof = 0
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
            for (const n of [e.n1, e.n2]) {
                x.push(n.x)
                y.push(n.y)
            }
            data.push({ x, y, name: 'Undeformed Structure', hoverinfo: 'none', marker: { color: 'black' }, showlegend: first })
            first = false
        }

        const layout:Layout = {
            hovermode: 'closest',
            annotations: arrows
        }
        plot(data, layout)
        return [data, layout]
    }
}
