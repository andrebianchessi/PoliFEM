import { Matrix } from 'mathjs'
import { plot } from 'nodeplotlib'
import { MassMatrix } from './massMatrix'
import { math } from './math'
import { Problem } from './problem'

export class DynamicProblem extends Problem {
    U?: Matrix[]
    M?: Matrix
    timeStep: number
    duration: number

    constructor (timeStep: number, duration: number) {
        // Initial conditions are all asumed to be zero
        super()
        this.timeStep = timeStep
        this.duration = duration
    }

    setInitialConditions () {
        const U0 = math.zeros!([this.dof, 1]) as Matrix
        this.U = [U0]
    }

    buildM () {
        this.M = math.zeros!([this.dof, this.dof], 'sparse') as Matrix
        // Build mass matrix
        for (const [, e] of this.elements) {
            e.M = new MassMatrix(e, 'Truss')
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
                    const initialVal = this.M!.get([globalIndices[i]!, globalIndices[j]!])!
                    this.M!.set([globalIndices[i]!, globalIndices[j]!], initialVal + e.M!.m.get([localIndices[i]!, localIndices[j]!]))
                }
            }
        }
    }

    solve () {
        let t = 0
        let uPast = this.U![0]
        let uPresent = this.U![0]
        while (t < this.duration) {
            const Mdt2: Matrix = math.dotMultiply!(1 / this.timeStep * this.timeStep, this.M!) as Matrix
            const minusMdt2uPast: Matrix = math.multiply!(math.dotMultiply!(-1 / this.timeStep * this.timeStep, this.M!), uPast) as Matrix
            const _2Mdt2uPresent: Matrix = math.multiply!(math.dotMultiply!(2 / this.timeStep * this.timeStep, this.M!), uPresent) as Matrix
            const minusKuPresent : Matrix = math.multiply!(math.dotMultiply!(-1, this.K!), uPresent) as Matrix
            const uNext: Matrix = math.multiply!(math.inv!(Mdt2), math.add!(math.add!(math.add!(this.F!, minusKuPresent), _2Mdt2uPresent), minusMdt2uPast))

            uPast = uPresent
            uPresent = uNext
            t += this.timeStep
        }
    }

    plot (structureOnly: boolean = false) {
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        plot(data, layout)
    }
}
