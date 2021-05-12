import { Matrix } from 'mathjs'
import { math, replaceRowAndColByZeros } from './math'
import { Layout, plot, Plot } from 'nodeplotlib'
import { Annotations } from 'plotly.js'
import { Problem } from './problem'

export class StaticProblem extends Problem {
    K?: Matrix
    U?: Matrix
    F?: Matrix

    solve () {
        const dof = this.dof
        // Initialize vectors and matrix
        this.K = math.zeros!([dof, dof], 'sparse') as Matrix
        this.F = math.zeros!([dof, 1], 'sparse') as Matrix

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

        // Apply BC's
        for (const b of this.boundaryConditions) {
            switch (b.type) {
            case 'Fix': {
                for (const i of [b.node.uIndex, b.node.vIndex, b.node.wIndex]) {
                    if (i != null) {
                        replaceRowAndColByZeros(this.K!, i)
                        this.K!.set([i, i], 1)
                        this.F!.set([i, 0], 0)
                    }
                }
                break
            }
            }
        }

        // Solve linear system
        this.U = math.usolve!(this.K!, this.F!) as Matrix
    }

    plot (plotSolution: boolean) {
        const displacementScaleFactor = 100
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
            const xd = []
            const yd = []
            const displacements = []
            for (const n of [e.n1, e.n2]) {
                x.push(n.x)
                y.push(n.y)
                if (plotSolution) {
                    const dx = this.U!.get([n.uIndex!, 0])
                    const dy = this.U!.get([n.vIndex!, 0])
                    xd.push(n.x + dx * displacementScaleFactor)
                    yd.push(n.y + dy * displacementScaleFactor)
                    if (n.wIndex == null) {
                        displacements.push('dx: ' + dx + '\ndy: ' + dy)
                    } else {
                        displacements.push('dx: ' + dx + '\ndy: ' + dy + '\ndz:' + this.U!.get([n.wIndex!, 0]))
                    }
                }
            }
            data.push({ x, y, name: 'Undeformed Structure', hoverinfo: 'none', marker: { color: 'black' }, showlegend: first })
            if (plotSolution) {
                data.push({ x: xd, y: yd, name: 'Deformed Structure (displacements scaled by ' + displacementScaleFactor + ')', text: displacements, hoverinfo: 'text', marker: { color: 'blue' }, showlegend: first })
            }

            first = false
        }

        const layout:Layout = {
            hovermode: 'closest',
            annotations: arrows
        }
        plot(data, layout)
    }
}
