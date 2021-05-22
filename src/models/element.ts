import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
// eslint-disable-next-line camelcase
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { sum } from '../functions/sum'
import { Angle } from './angleInRadians'
import { FrameProperties } from './frameProperties'
import { MassMatrix } from './massMatrix'
import { math } from './math'
import { NodalLoads } from './nodalLoads'
import { Node } from './node'
import { Problem } from './problem'
import { StiffnessMatrix } from './stiffnessMatrix'
import { TrussProperties } from './trussProperties'

export class Element {
    static count = 0
    index: number
    type: 'Frame' | 'Truss'
    n1: Node
    n2: Node
    properties: FrameProperties | TrussProperties
    K: (U?: Matrix) => StiffnessMatrix
    M?: MassMatrix

    constructor (type: 'Frame' | 'Truss', n1:Node, n2:Node, properties: FrameProperties | TrussProperties, p: Problem) {
        Element.count += 1
        this.index = Element.count
        if (type === 'Frame') {
            if ((properties as FrameProperties).I == null) {
                throw new Error('I not provided for element ' + this.index)
            }
        }
        this.type = type
        this.n1 = n1
        this.n2 = n2
        if (type === 'Frame') {
            if (this.n1.uIndex == null) {
                this.n1.uIndex = p.dof
                p.dof += 1
            }
            if (this.n1.vIndex == null) {
                this.n1.vIndex = p.dof
                p.dof += 1
            }
            if (this.n1.wIndex == null) {
                this.n1.wIndex = p.dof
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
            if (this.n2.wIndex == null) {
                this.n2.wIndex = p.dof
                p.dof += 1
            }
        }
        if (type === 'Truss') {
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
        }

        this.properties = properties
        this.K = function (U?: Matrix) {
            return (new StiffnessMatrix(this, type, U))
        }

        p.elements.set(p.elementCount, this)
        p.elementCount += 1
    }

    angle (U?: Matrix): Angle {
        let n1x
        let n2x
        let n1y
        let n2y
        if (U !== undefined && U !== null) {
            n1x = this.n1.x + U!.get([this.n1.uIndex!, 0])
            n2x = this.n2.x + U!.get([this.n2.uIndex!, 0])
            n1y = this.n1.y + U!.get([this.n1.vIndex!, 0])
            n2y = this.n2.y + U!.get([this.n2.vIndex!, 0])
        } else {
            n1x = this.n1.x
            n2x = this.n2.x
            n1y = this.n1.y
            n2y = this.n2.y
        }

        if (n2x !== n1x) {
            return new Angle(Math.atan((n2y - n1y) / (n2x - n1x)))
        } else {
            return new Angle(-Math.PI / 2)
        }
    }

    length ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }

    getNodalLoads (U: Matrix, p: Problem): NodalLoads {
        let t: Matrix
        let FLocal: Matrix
        let ULocal: Matrix

        if (this.type === 'Truss') {
            t = getT_4x4(this.angle(U))
            FLocal = math.matrix!([
                p.F!.get([this.n1.uIndex!, 0]),
                p.F!.get([this.n1.vIndex!, 0]),
                p.F!.get([this.n2.uIndex!, 0]),
                p.F!.get([this.n2.vIndex!, 0])
            ])
            ULocal = math.matrix!([
                U!.get([this.n1.uIndex!, 0]),
                U!.get([this.n1.vIndex!, 0]),
                U!.get([this.n2.uIndex!, 0]),
                U!.get([this.n2.vIndex!, 0])
            ])
        } else {
            t = getT_6x6(this.angle(U))
            FLocal = math.matrix!([
                p.F!.get([this.n1.uIndex!, 0]),
                p.F!.get([this.n1.vIndex!, 0]),
                p.F!.get([this.n1.wIndex!, 0]),
                p.F!.get([this.n2.uIndex!, 0]),
                p.F!.get([this.n2.vIndex!, 0]),
                p.F!.get([this.n2.wIndex!, 0])
            ])
            ULocal = math.matrix!([
                U.get([this.n1.uIndex!, 0]),
                U.get([this.n1.vIndex!, 0]),
                U.get([this.n1.wIndex!, 0]),
                U.get([this.n2.uIndex!, 0]),
                U.get([this.n2.vIndex!, 0]),
                U.get([this.n2.wIndex!, 0])
            ])
        }

        const KLocal = this.K(U).kLocal

        const nl = sum([FLocal, mult([KLocal, mult([t, ULocal])])]) as Matrix

        if (this.type === 'Truss') {
            return new NodalLoads(
                nl.get([0]),
                nl.get([1]),
                0,
                nl.get([2]),
                nl.get([3]),
                0
            )
        } else {
            return new NodalLoads(
                nl.get([0]),
                nl.get([1]),
                nl.get([2]),
                nl.get([3]),
                nl.get([4]),
                nl.get([5])
            )
        }
    }

    /**
     * Calculates normal tension in element
     * @param U Global displacement vector
     * @param p problem
     */
    getSigma (U: Matrix, p: Problem) {
        const nodalLoads = this.getNodalLoads(U, p)
        return -nodalLoads.X1 / this.properties.A
    }
}
