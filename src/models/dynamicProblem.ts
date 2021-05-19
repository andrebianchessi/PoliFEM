/* eslint-disable camelcase */
import { plot } from 'nodeplotlib'
import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { sum } from '../functions/sum'
import { DynamicLoad } from './dynamicLoad'
import { Element } from './element'
import { MassMatrix } from './massMatrix'
import { math } from './math'
import { Node } from './node'
import { Problem } from './problem'
import { getEigs } from '../functions/getEigs'
import { InitialSpeed } from './initialSpeed'
import { timeStepsToRecalculateK } from '../constants'

export class DynamicProblem extends Problem {
    dynamicLoads: DynamicLoad[]
    initialSpeeds: InitialSpeed[]
    M?: Matrix
    Minv?: Matrix
    FDynamic?: (t:number) => Matrix
    timeStep?: number
    duration?: number
    t: number[]
    U?: Matrix[]
    Udot?: Matrix[]
    Udotdot?: Matrix[]
    NaturalFrequencies: number[]
    ModesOfVibration: number[][]

    constructor (timeStep?: number, duration?: number) {
        super()
        this.timeStep = timeStep
        this.duration = duration
        this.t = []
        this.dynamicLoads = []
        this.NaturalFrequencies = []
        this.ModesOfVibration = []
        this.initialSpeeds = []
    }

    build () {
        super.build()
        this.buildM()
        this.setInitialConditions()
    }

    /**
     * Sets all initial displacements and velocities to zero
     */
    setInitialConditions () {
        this.U = [math.zeros!([this.dof, 1], 'sparse') as Matrix]
        this.Udot = [math.zeros!([this.dof, 1], 'sparse') as Matrix]
        for (const initialSpeed of this.initialSpeeds) {
            this.Udot[0].set([initialSpeed.dofIndex, 0], initialSpeed.value)
        }
    }

    buildM () {
        this.M = math.zeros!([this.dof, this.dof], 'sparse') as Matrix
        // Build mass matrix
        for (const [, e] of this.elements) {
            e.M = new MassMatrix(e, e.type)
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
                    this.M!.set([globalIndices[i]!, globalIndices[j]!], initialVal + e.M!.m!.get([localIndices[i]!, localIndices[j]!]))
                }
            }
        }
        this.Minv = math.inv!(this.M)
    }

    buildF () {
        super.buildF()
        this.FDynamic = function (t:number) {
            const Ft = math.zeros!([this.dof, 1], 'sparse') as Matrix

            // Build load vector
            for (const l of this.dynamicLoads) {
                if (l.node.uIndex != null) {
                Ft!.set([l.node.uIndex!, 0], this.F!.get([l.node.uIndex!, 0]) + l.x(t))
                }
                if (l.node.vIndex != null) {
                Ft!.set([l.node.vIndex!, 0], this.F!.get([l.node.vIndex!, 0]) + l.y(t))
                }
                if (l.node.wIndex != null) {
                Ft!.set([l.node.wIndex!, 0], this.F!.get([l.node.wIndex!, 0]) + l.w(t))
                }
            }
            return Ft
        }
    }

    solveTimeHistory () {
        this.build()

        const dt = this.timeStep!
        let t = 0
        let uPresent = this.U![0]
        this.Udotdot = []
        this.Udotdot!.push(
            mult([this.Minv!, sum([this.F!, this.FDynamic!(t), mult([-1, this.K!, this.U![0]])])]) as Matrix
        )
        let uPast = sum([uPresent, mult([-dt, this.Udot![0]]), mult([dt * dt / 2, this.Udotdot![0]])])

        let timeStep = 0
        while (t < this.duration!) {
            timeStep++
            const uNext = mult([
                mult([dt * dt, this.Minv!]),
                sum([
                    this.F!,
                    this.FDynamic!(t),
                    mult([-1, this.K!, uPresent]),
                    mult([2 / (dt * dt), this.M!, uPresent]),
                    mult([-1 / (dt * dt), this.M!, uPast])
                ])
            ]) as Matrix

            uPast = math.clone!(uPresent)
            uPresent = uNext
            this.U!.push(uPresent)
            t += this.timeStep!
            this.t.push(t)
            if (timeStep % timeStepsToRecalculateK === 0) {
                this.buildK(uPresent)
                this.applyBC()
            }
        }
    }

    async solveModal () {
        this.build()
        const frequencies: number[] = []
        const displacements: number[][] = []
        const eigs = getEigs(mult([this.Minv!, this.K!]) as Matrix, this)
        for (let i = 0; i < eigs.values.length; i++) {
            const displacementVector = eigs.vectors[i]
            frequencies.push(Math.sqrt(eigs.values[i]) / (2 * Math.PI))
            displacements.push(displacementVector!)
        }
        // sort ascending by vibration
        const combinedList = []
        for (let i = 0; i < frequencies.length; i++) {
            combinedList.push({ value: frequencies[i], vector: displacements[i] })
        }
        combinedList.sort(function (a, b) {
            return a.value - b.value
        })
        this.ModesOfVibration = []
        this.NaturalFrequencies = []
        for (const c of combinedList) {
            this.NaturalFrequencies.push(c.value)
            this.ModesOfVibration.push(c.vector)
        }
    }

    plotNodeXDisplacement (node: Node) {
        const uNodeI: number[] = []
        for (let i = 0; i < this.U!.length; i++) {
            uNodeI.push((this.U![i]).get([node.uIndex!, 0]))
        }
        plot([{ x: this.t, y: uNodeI }])
    }

    plotNodeYDisplacement (node: Node) {
        const uNodeI: number[] = []
        for (let i = 0; i < this.U!.length; i++) {
            uNodeI.push((this.U![i]).get([node.vIndex!, 0]))
        }
        plot([{ x: this.t, y: uNodeI }])
    }

    plotElementTension (e: Element) {
        const sigmaElementI: number[] = []
        for (let i = 0; i < this.U!.length; i++) {
            const c = e.angle(this.U![i]).c()
            const s = e.angle(this.U![i]).s()
            const u1 = this.U![i].get([e.n1.uIndex!, 0])
            const v1 = this.U![i].get([e.n1.uIndex!, 0])
            const u2 = this.U![i].get([e.n2.uIndex!, 0])
            const v2 = this.U![i].get([e.n2.uIndex!, 0])
            sigmaElementI.push(e.properties.E / e.length() * (-c * u1 + -s * v1 + c * u2 + s * v2))
        }
        plot([{ x: this.t, y: sigmaElementI }])
    }

    plotModeOfVibration (i: number = 0, displacementScaleFactor: number = 10) {
        if (i >= this.ModesOfVibration.length) {
            console.log('Only ' + this.ModesOfVibration.length + ' modes of vibration calculated')
            return
        }
        const dataAndLayout = this.problemDescriptionPlotData()
        const data = dataAndLayout[0]
        const layout = dataAndLayout[1]

        let first = true
        for (const [, e] of this.elements) {
            const xd = []
            const yd = []
            for (const n of [e.n1, e.n2]) {
                const dx = this.ModesOfVibration[i][n.uIndex!]
                const dy = this.ModesOfVibration[i][n.vIndex!]
                xd.push(n.x + dx * displacementScaleFactor)
                yd.push(n.y + dy * displacementScaleFactor)
            }
            data.push({ x: xd, y: yd, name: 'Mode of vibration', hoverinfo: 'none', marker: { color: 'blue' }, showlegend: first })
            first = false
        }
        layout.title = 'Mode of vibration ' + i + ' (displacements scaled by ' + displacementScaleFactor + '). Frequency: ' + this.NaturalFrequencies[i] + ' Hz'
        plot(data, layout)
    }
}
