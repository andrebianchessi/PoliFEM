import { Matrix } from 'mathjs'
import { plot } from 'nodeplotlib'
import { Problem } from './problem'

export class DynamicProblem extends Problem {
    K?: Matrix
    U?: Matrix
    F?: Matrix
    M?: Matrix
    C?: Matrix

    solve () {
    }

    plot (structureOnly: boolean = false) {
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        plot(data, layout)
    }
}
