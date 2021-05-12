import { Matrix } from 'mathjs'
import { plot } from 'nodeplotlib'
import { math } from './math'
import { Problem } from './problem'

export class DynamicProblem extends Problem {
    U?: Matrix[]
    M?: Matrix
    timeStep: number

    constructor (timeStep: number) {
        // Initial conditions are all asumed to be zero
        super()
        this.timeStep = timeStep
    }

    setInitialConditions () {
        const U0 = math.zeros!([this.dof, 1]) as Matrix
        this.U = [U0]
    }

    buildM () {
        this.M = math.zeros!([this.dof, this.dof], 'sparse') as Matrix
    }

    solve () {
    }

    plot (structureOnly: boolean = false) {
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        plot(data, layout)
    }
}
