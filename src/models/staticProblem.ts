import { math } from './math'
import { Layout, plot } from 'nodeplotlib'
import { Problem } from './problem'
import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { Annotations } from 'plotly.js'
import { StructuralElement } from './structuralElement'

export class StaticProblem extends Problem {
    declare U?: Matrix
    solve () {
        this.build()
        // Solve linear system
        this.U = math.lusolve!(this.K!, this.F!) as Matrix
    }

    getExternalNodalLoads () : Matrix {
        return mult([this.KWithoutBC!, this.U!]) as Matrix
    }

    plotDisplacements (title: string, displacementScaleFactor: number) {
        const dataAndLayout = this.structuralProblemDescriptionPlotData(title)
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        let first = true
        for (const [, e] of this.structuralElements) {
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
        plot(data, layout)
    }

    /**
     * Plots all resulting nodal forces, including applied loads
     * @param minMagnitude Minimum load magnitude to be plotted
     */
    plotExternalLoads (title: string, minMagnitude: number = 0) {
        const arrowsLength = 100
        const dataAndLayout = this.structuralProblemDescriptionPlotData(title)
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
            title: title
        }

        data.push({ x: momentsX, y: momentsY, name: 'Applied moments', text: momentsText, hoverinfo: 'text', marker: { size: 18, color: 'red' }, mode: 'markers', type: 'scatter' })
        plot(data, layout)
    }

    /**
     * Plots all reaction forces at boundary conditions
     * @param title
     * @param minMagnitude
     */
    plotReactions (title: string, minMagnitude: number = 0) {
        const arrowsLength = 100
        const dataAndLayout = this.structuralProblemDescriptionPlotData(title)
        const data = dataAndLayout[0]

        const arrows:Partial<Annotations>[] = []
        const momentsX = []
        const momentsY = []
        const momentsText = []

        const externalLoads = this.getExternalNodalLoads()
        for (const bc of this.boundaryConditions) {
            const node = bc.node
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

            for (const l of this.structuralDistributedLoads) {
                if (node.index === l.e.n1.index) {
                    fx -= l.l1.x
                    fy -= l.l1.y
                }
                if (node.index === l.e.n2.index) {
                    fx -= l.l2.x
                    fy -= l.l2.y
                }
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
                for (const l of this.structuralDistributedLoads) {
                    if (node.index === l.e.n1.index) {
                        fw -= l.l1.w
                    }
                    if (node.index === l.e.n2.index) {
                        fw -= l.l2.w
                    }
                }
            } else {
                fw = 0
            }
            if (Math.abs(fw) > minMagnitude) {
                momentsX.push(node.x)
                momentsY.push(node.y)
                momentsText.push(fw.toString())
            }
        }

        const layout:Layout = {
            hovermode: 'closest',
            annotations: arrows,
            title: title
        }

        data.push({ x: momentsX, y: momentsY, name: 'Applied moments', text: momentsText, hoverinfo: 'text', marker: { size: 18, color: 'red' }, mode: 'markers', type: 'scatter' })
        plot(data, layout)
    }

    plotForcesDiagram (title: string, e: StructuralElement) {
        const N: number[] = []
        const V: number[] = []
        const M: number[] = []
        const X: number[] = []
        const forces = e.getForces(this.U!, this)
        for (let x = 0; x < 1.02; x += 0.02) {
            N.push(forces.N(x))
            V.push(forces.V(x))
            M.push(-forces.M(x))
            X.push(x)
        }
        const data: any[] = [{ x: X, y: N, name: 'N', hoverinfo: 'y' }, { x: X, y: V, name: 'V', hoverinfo: 'y' }, { x: X, y: M, name: 'M', hoverinfo: 'y' }]
        data.push({ x: [0, 1], y: [N[0] * 1.01, N[0] * 1.01], text: ['x:' + e.n1.x + ' y:' + e.n1.y, 'x:' + e.n2.x + ' y:' + e.n2.y], hoverinfo: 'text', name: 'Nodes', mode: 'markers', type: 'scatter' })
        const layout:Layout = {
            title: title
        }
        plot(data, layout)
    }
}
