import { Matrix } from 'mathjs'
import { math } from './math'
import { plot } from 'nodeplotlib'
import { Problem } from './problem'

export class StaticProblem extends Problem {
    U?: Matrix
    solve () {
        this.buildK()

        this.buildF()

        this.applyBC()

        // Solve linear system
        this.U = math.usolve!(this.K!, this.F!) as Matrix
    }

    plot (structureOnly: boolean = false) {
        const displacementScaleFactor = 100
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        if (!structureOnly) {
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
                if (!structureOnly) {
                    data.push({ x: xd, y: yd, name: 'Deformed Structure (displacements scaled by ' + displacementScaleFactor + ')', text: displacements, hoverinfo: 'text', marker: { color: 'blue' }, showlegend: first })
                }
                first = false
            }
        }

        plot(data, layout)
    }
}
