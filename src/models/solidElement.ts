import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { MassMatrix } from './massMatrix'
import { math } from './math'
import { Node } from './node'
import { Problem } from './problem'
import { SolidElementProperties } from './solidElementProperties'
import { StiffnessMatrix } from './stiffnessMatrix'
import { StressState } from './stressState'

export class SolidElement {
    static firstIndex = 1
    static count = 0
    index: number
    n1: Node
    n2: Node
    n3: Node
    properties: SolidElementProperties
    K: StiffnessMatrix
    M?: MassMatrix
    p: Problem
    constructor (n1: Node, n2: Node, n3: Node, properties: SolidElementProperties, p: Problem) {
        this.p = p
        this.index = SolidElement.count + SolidElement.firstIndex
        SolidElement.count += 1

        this.properties = properties
        this.n1 = n1
        this.n2 = n2
        this.n3 = n3

        if (this.n1.uIndex == null) {
            this.n1.uIndex = p.dof
            p.dof += 1
        }
        if (this.n1.vIndex == null) {
            this.n1.vIndex = p.dof
            p.dof += 1
        }

        if (this.n2.uIndex == null) {
            this.n2.uIndex = p.dof
            p.dof += 1
        }
        if (this.n2.vIndex == null) {
            this.n2.vIndex = p.dof
            p.dof += 1
        }

        if (this.n3.uIndex == null) {
            this.n3.uIndex = p.dof
            p.dof += 1
        }
        if (this.n3.vIndex == null) {
            this.n3.vIndex = p.dof
            p.dof += 1
        }

        this.K = new StiffnessMatrix(this, 'PlaneStress')
        p.solidElements.set(p.solidElementCount, this)
        p.solidElementCount += 1
    }

    getArea () : number {
        return math.abs!(0.5 * math.det!(
            math.matrix!([
                [1, this.n1.x, this.n1.y],
                [1, this.n2.x, this.n2.y],
                [1, this.n3.x, this.n3.y]
            ])
        ))
    }

    getC (): Matrix {
        const E = this.properties.E
        const v = this.properties.v
        return mult([E / (1 - v * v), math.matrix!([
            [1, 1 * v, 0],
            [1 * v, 1, 0],
            [0, 0, 1 * (1 - v) / 2]
        ])]) as Matrix
    }

    getB (): Matrix {
        const x1 = this.n1.x
        const x2 = this.n2.x
        const x3 = this.n3.x
        const y1 = this.n1.y
        const y2 = this.n2.y
        const y3 = this.n3.y
        const A = this.getArea()
        const b1 = y2 - y3
        const b2 = y3 - y1
        const b3 = y1 - y2
        const c1 = x3 - x2
        const c2 = x1 - x3
        const c3 = x2 - x1
        return mult([1 / (2 * A), math.matrix!([
            [b1, 0, b2, 0, b3, 0],
            [0, c1, 0, c2, 0, c3],
            [c1, b1, c2, b2, c3, b3]
        ])]) as Matrix
    }

    getStressState (): StressState {
        const u1 = (this.p.U as Matrix).get([this.n1.uIndex!, 0])
        const v1 = (this.p.U as Matrix).get([this.n1.vIndex!, 0])
        const u2 = (this.p.U as Matrix).get([this.n2.uIndex!, 0])
        const v2 = (this.p.U as Matrix).get([this.n2.vIndex!, 0])
        const u3 = (this.p.U as Matrix).get([this.n3.uIndex!, 0])
        const v3 = (this.p.U as Matrix).get([this.n3.vIndex!, 0])
        const U = math.matrix!([
            [u1],
            [v1],
            [u2],
            [v2],
            [u3],
            [v3]
        ])
        const stresses = mult([this.getC(), this.getB(), U]) as Matrix
        return new StressState(stresses.get([0, 0]), stresses.get([1, 0]), stresses.get([2, 0]))
    }

    getVonMises (): number {
        return this.getStressState().getVonMises()
    }
}
