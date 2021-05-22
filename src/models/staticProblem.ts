import { math } from './math'
import { Layout, plot } from 'nodeplotlib'
import { Problem } from './problem'
import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { Annotations } from 'plotly.js'
import { Element } from './element'

export class StaticProblem extends Problem {
    U?: Matrix
    solve () {
        this.build()

        // Solve linear system
        this.U = math.lusolve!(this.K!, this.F!) as Matrix
    }

    getExternalNodalLoads () : Matrix {
        return mult([this.KWithoutBC!, this.U!]) as Matrix
    }

    plotDisplacements (displacementScaleFactor: number) {
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        let first = true
        for (const [, e] of this.elements) {
            const xd = []
            const yd = []
            const displacements = []
            for (const n of [e.n1, e.n2]) {
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
            data.push({ x: xd, y: yd, name: 'Deformed Structure (displacements scaled by ' + displacementScaleFactor + ')', text: displacements, hoverinfo: 'text', marker: { color: 'blue' }, showlegend: first })
            first = false
        }
        layout.title = 'Original and deformed structure'
        plot(data, layout)
    }

    /**
     *
     * @param minMagnitude Minumum load magnitude to be ploted
     */
    plotExternalLoads (minMagnitude: number = 0) {
        const arrowsLength = 100
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]

        const arrows:Partial<Annotations>[] = []
        const momentsX = []
        const momentsY = []
        const momentsText = []

        const externalLoads = this.getExternalNodalLoads()

        for (const [, map] of this.nodes) {
            for (const [, node] of map) {
                let fx, fy, fw
                if (node.uIndex != null) {
                    fx = externalLoads.get([node.uIndex!, 0])
                } else {
                    fx = 0
                }
                if (node.vIndex != null) {
                    fy = externalLoads.get([node.vIndex!, 0])
                } else {
                    fy = 0
                }
                if (Math.abs(fx) > minMagnitude || Math.abs(fy) > minMagnitude) {
                    const scalingFactor = arrowsLength / Math.sqrt(fx * fx + fy * fy)
                    const arrowX = -fx * scalingFactor
                    const arrowY = fy * scalingFactor
                    const magnitude = Math.sqrt(fx * fx + fy * fy).toString()
                    arrows.push(
                        {
                            text: magnitude,
                            x: node.x,
                            y: node.y,
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
                }
                if (node.wIndex != null) {
                    fw = externalLoads.get([node.wIndex!, 0])
                } else {
                    fw = 0
                }
                if (Math.abs(fw) > minMagnitude) {
                    momentsX.push(node.x)
                    momentsY.push(node.y)
                    momentsText.push(fw.toString())
                }
            }
        }

        const layout:Layout = {
            hovermode: 'closest',
            annotations: arrows,
            title: 'External loads'
        }

        data.push({ x: momentsX, y: momentsY, name: 'Applied moments', text: momentsText, hoverinfo: 'text', marker: { size: 18, color: 'red' }, mode: 'markers', type: 'scatter' })
        plot(data, layout)
    }

    plotForcesDiagram (e: Element) {
        const N: number[] = []
        const V: number[] = []
        const M: number[] = []
        const X: number[] = []
        for (let x = 0; x <= 1; x = x + 0.01) {
            const forces = e.getForces(this.U!, this, x)
            N.push(forces.N)
            V.push(forces.V)
            M.push(forces.M)
            X.push(x)
        }
        plot([{ x: X, y: N, name: 'N' }, { x: X, y: V, name: 'V' }, { x: X, y: M, name: 'M' }])
    }
}
