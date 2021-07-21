import { StructuralElement } from './structuralElement'
import { Node } from './node'
import { Load } from './load'
import { BoundaryCondition } from './boundaryCondition'
import { Annotations } from 'plotly.js'
import { Layout, Plot, plot } from 'nodeplotlib'
import { math } from './math'
import { getCol, replaceRowAndColByZeros } from '../functions/matrixUtils'
import { Matrix } from 'mathjs'
import { InitialSpeed } from './initialSpeed'
import { bcColor, initSpeedColor, loadColor, distLoadColor } from '../constants'
import { StructuralDistributedLoad } from './structuralDistributedLoad'
import { SolidElement } from './solidElement'

export class Problem {
    dof: number // degrees of freedom
    nodes: Map<number, Map<number, Node>>
    nodeCount: number
    structuralElements: Map<number, StructuralElement>
    solidElements: Map<number, SolidElement>
    structuralElementCount: number
    solidElementCount: number
    loads: Load[]
    structuralDistributedLoads: StructuralDistributedLoad[]
    boundaryConditions: BoundaryCondition[]
    initialSpeeds?: InitialSpeed[]
    K?: Matrix
    KWithoutBC?:Matrix
    F?: Matrix
    U?: Matrix | Matrix[]
    M?: Matrix

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.nodeCount = 0
        this.structuralElements = new Map<number, StructuralElement>()
        this.solidElements = new Map<number, SolidElement>()
        this.structuralElementCount = 0
        this.solidElementCount = 0
        this.loads = []
        this.structuralDistributedLoads = []
        this.boundaryConditions = []
        this.dof = 0
    }

    build () {
        this.buildK()
        this.KWithoutBC = math.clone!(this.K)
        this.buildF()
        this.applyBC()
    }

    buildK (U?: Matrix) {
        // Initialize matrix
        this.K = math.zeros!([this.dof, this.dof], 'sparse') as Matrix

        // Build stiffness matrix
        for (const [, e] of this.structuralElements) {
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
                const col = getCol(i, this.K!)
                for (let row = 0; row < this.dof; row++) {
                    const colValue = col.get([row, 0])
                    const initialFValue = this.F!.get([row, 0])
                    this.F!.set([row, 0], initialFValue - colValue * b.value)
                }
                replaceRowAndColByZeros(this.K!, i)
                this.K!.set([i, i], 1)
                this.F!.set([i, 0], b.value)
            }
        }
    }

    plot () {
        const dataAndLayout = this.structuralProblemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        plot(data, layout)
    }

    structuralProblemDescriptionPlotData (): [Plot[], Layout] {
        const arrowsLength = 100
        const arrows:Partial<Annotations>[] = []
        const momentsX = []
        const momentsY = []
        const momentsText = []
        const initialRotationX = []
        const initialRotationY = []
        const initialRotationText = []
        const bcsX = []
        const bcsY = []
        const bcsText = []
        for (const l of this.loads) {
            if (!l.isDistEquivalent) {
                const scalingFactor = arrowsLength / Math.sqrt(l.x * l.x + l.y * l.y)
                const arrowX = -l.x * scalingFactor
                const arrowY = l.y * scalingFactor
                const magnitude = Math.sqrt(l.x * l.x + l.y * l.y).toString()
                arrows.push(
                    {
                        text: magnitude,
                        x: l.node.x,
                        y: l.node.y,
                        xref: 'x',
                        yref: 'y',
                        showarrow: true,
                        arrowhead: 5,
                        ax: arrowX,
                        ay: arrowY,
                        arrowcolor: loadColor,
                        font: { color: loadColor, size: 17 }
                    }
                )
                if (l.w !== 0) {
                    momentsX.push(l.node.x)
                    momentsY.push(l.node.y)
                    momentsText.push(l.w.toString())
                }
            }
        }

        for (const l of this.structuralDistributedLoads) {
            const nDivs = 25
            const scalingFactor = arrowsLength / Math.max(Math.sqrt(l.l1PerLengthLocal.x * l.l1PerLengthLocal.x + l.l1PerLengthLocal.y * l.l1PerLengthLocal.y), Math.sqrt(l.l2PerLengthLocal.x * l.l2PerLengthLocal.x + l.l2PerLengthLocal.y * l.l2PerLengthLocal.y))
            for (let i = 0; i <= nDivs; i++) {
                const x = l.l1PerLengthLocal.node.x + (l.l2PerLengthLocal.node.x - l.l1PerLengthLocal.node.x) / nDivs * i
                const y = l.l1PerLengthLocal.node.y + (l.l2PerLengthLocal.node.y - l.l1PerLengthLocal.node.y) / nDivs * i
                let lx = -(l.l1PerLengthLocal.x + (l.l2PerLengthLocal.x - l.l1PerLengthLocal.x) / nDivs * i)
                let ly = (l.l1PerLengthLocal.y + (l.l2PerLengthLocal.y - l.l1PerLengthLocal.y) / nDivs * i)
                const magnitude = Math.sqrt(lx * lx + ly * ly).toString()
                lx = lx * scalingFactor
                ly = ly * scalingFactor
                if (magnitude !== '0') {
                    arrows.push(
                        {
                            text: i === 0 || i === nDivs ? magnitude : '',
                            x: x,
                            y: y,
                            xref: 'x',
                            yref: 'y',
                            showarrow: true,
                            arrowhead: 1,
                            ax: lx,
                            ay: ly,
                            arrowcolor: distLoadColor,
                            font: { color: distLoadColor, size: 17 }
                        }
                    )
                }
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
        if (this.initialSpeeds != null) {
            for (const initialSpeed of this.initialSpeeds) {
                if (initialSpeed.direction === 'X' || initialSpeed.direction === 'Y') {
                    const scalingFactor = Math.abs(arrowsLength / initialSpeed.value)
                    const ax = initialSpeed.direction === 'X' ? scalingFactor * initialSpeed.value : 0
                    const ay = initialSpeed.direction === 'Y' ? scalingFactor * initialSpeed.value : 0
                    arrows.push(
                        {
                            text: Math.abs(initialSpeed.value).toString(),
                            x: initialSpeed.node.x,
                            y: initialSpeed.node.y,
                            xref: 'x',
                            yref: 'y',
                            showarrow: true,
                            arrowhead: 5,
                            ax: ax,
                            ay: ay,
                            arrowcolor: initSpeedColor,
                            font: { color: initSpeedColor, size: 17 }
                        }
                    )
                } else {
                    initialRotationX.push(initialSpeed.node.x)
                    initialRotationY.push(initialSpeed.node.y)
                    initialRotationText.push(initialSpeed.value.toString())
                }
            }
        }

        const data: Plot[] = [
            { x: momentsX, y: momentsY, name: 'Applied moments', text: momentsText, hoverinfo: 'text', marker: { size: 18, color: loadColor }, mode: 'markers', type: 'scatter' },
            { x: bcsX, y: bcsY, name: 'Boundary conditions', text: bcsText, hoverinfo: 'text', marker: { color: bcColor, size: 13 }, mode: 'markers', type: 'scatter' },
            { x: initialRotationX, y: initialRotationY, name: 'Initial rotation speed', text: initialRotationText, hoverinfo: 'text', marker: { size: 18, color: initSpeedColor }, mode: 'markers', type: 'scatter' }
        ]

        let first = true
        for (const [, e] of this.structuralElements) {
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
            annotations: arrows,
            title: 'Problem description'
        }
        return [data, layout]
    }
}
