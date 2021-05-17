/* eslint-disable camelcase */
import { plot } from 'nodeplotlib'
import { Matrix } from 'mathjs'
import { getCol } from '../functions/matrixUtils'
import { mult } from '../functions/mult'
import { sum } from '../functions/sum'
import { DynamicLoad } from './dynamicLoad'
import { Element } from './element'
import { MassMatrix } from './massMatrix'
import { math } from './math'
import { Node } from './node'
import { Problem } from './problem'
import { getEigs } from '../functions/getEigs'

export class DynamicProblem extends Problem {
    dynamicLoads: DynamicLoad[]
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

        while (t < this.duration!) {
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
        }
    }

    async solveModal () {
        this.build()
        const frequencies: number[] = []
        const displacements: number[][] = []
        const eigs = await getEigs(mult([this.Minv!, this.K!]) as Matrix)
        console.log(eigs)
        // for (let i = 0; i < (eigs.values as Matrix).size()[0]; i++) {
        //     // Check if oscilation is valid with the Bcs
        //     let invalidWithBCs = false
        //     let displacementVector: Matrix
        //     if (eigs.vectors.length !== 0) {
        //         displacementVector = getCol(i, eigs.vectors as Matrix)
        //         for (const bc of this.boundaryConditions) {
        //             for (const i of bc.restrictedIndices) {
        //                 if (displacementVector.get([i, 0]) !== bc.value) {
        //                     invalidWithBCs = true
        //                     break
        //                 }
        //             }
        //         }
        //     }

        //     if (!invalidWithBCs) {
        //         frequencies.push(Math.sqrt((eigs.values as Matrix).get([i, 0])))
        //         if (eigs.vectors.length !== 0) {
        //             displacements.push(displacementVector!)
        //         }
        //     }
        // }
        this.ModesOfVibration = displacements
        this.NaturalFrequencies = frequencies
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
            const c = e.angle.c()
            const s = e.angle.s()
            const u1 = this.U![i].get([e.n1.uIndex!, 0])
            const v1 = this.U![i].get([e.n1.uIndex!, 0])
            const u2 = this.U![i].get([e.n2.uIndex!, 0])
            const v2 = this.U![i].get([e.n2.uIndex!, 0])
            sigmaElementI.push(e.properties.E / e.length() * (-c * u1 + -s * v1 + c * u2 + s * v2))
        }
        plot([{ x: this.t, y: sigmaElementI }])
    }

    // plotModeOfVibration (i: number = 0, displacementScaleFactor: number = 10) {
    //     if (this.ModesOfVibration.length === 0) {
    //         console.log('Unable to determine modes of vibration\n')
    //         console.log('Natural frequencies:')
    //         console.log(this.NaturalFrequencies)
    //         return
    //     }
    //     const dataAndLayout = this.problemDescriptionPlotData()
    //     const data = dataAndLayout[0]
    //     const layout = dataAndLayout[1]

    //     let first = true
    //     for (const [, e] of this.elements) {
    //         const xd = []
    //         const yd = []
    //         for (const n of [e.n1, e.n2]) {
    //             const dx = this.ModesOfVibration[i].get([n.uIndex!, 0])
    //             const dy = this.ModesOfVibration[i].get([n.vIndex!, 0])
    //             xd.push(n.x + dx * displacementScaleFactor)
    //             yd.push(n.y + dy * displacementScaleFactor)
    //         }
    //         data.push({ x: xd, y: yd, name: 'Mode of vibration', hoverinfo: 'none', marker: { color: 'blue' }, showlegend: first })
    //         first = false
    //     }
    //     layout.title = 'Mode of vibration ' + i + ' (displacements scaled by ' + displacementScaleFactor + '). Frequency: ' + this.NaturalFrequencies[i]
    //     plot(data, layout)
    // }
}
