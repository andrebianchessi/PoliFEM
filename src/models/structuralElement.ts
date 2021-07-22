import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
// eslint-disable-next-line camelcase
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { Angle } from './angleInRadians'
import { StructuralDistributedLoad } from './structuralDistributedLoad'
import { Forces } from './forces'
import { FrameProperties } from './frameProperties'
import { MassMatrix } from './massMatrix'
import { math } from './math'
import { NodalLoads } from './nodalLoads'
import { Node } from './node'
import { Problem } from './problem'
import { StaticProblem } from './staticProblem'
import { StiffnessMatrix } from './stiffnessMatrix'
import { TrussProperties } from './trussProperties'

export class StructuralElement {
    static count = 0
    index: number
    type: 'Frame' | 'Truss'
    n1: Node
    n2: Node
    properties: FrameProperties | TrussProperties
    K: StiffnessMatrix
    M?: MassMatrix
    distributedLoads: StructuralDistributedLoad[]
    angle: Angle

    constructor (type: 'Frame' | 'Truss', n1:Node, n2:Node, properties: FrameProperties | TrussProperties, p: Problem) {
        StructuralElement.count += 1
        this.index = StructuralElement.count
        this.distributedLoads = []
        if (type === 'Frame') {
            if ((properties as FrameProperties).I == null) {
                throw new Error('I not provided for element ' + this.index)
            }
        }
        this.type = type
        this.n1 = n1
        this.n2 = n2

        if (this.n2.x === this.n1.x) {
            if (n1.y < n2.y) {
                this.angle = new Angle(Math.PI / 2)
            } else {
                this.angle = new Angle(-Math.PI / 2)
            }
        } else if (this.n2.y === this.n1.y) {
            if (this.n1.x < this.n2.x) {
                this.angle = new Angle(0)
            } else {
                this.angle = new Angle(Math.PI)
            }
        } else {
            this.angle = new Angle(Math.atan((this.n2.y - this.n1.y) / (this.n2.x - this.n1.x)))
        }

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
        this.K = new StiffnessMatrix(this, type)

        p.structuralElements.set(p.structuralElementCount, this)
        p.structuralElementCount += 1
    }

    length ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }

    getNodalLoads (U: Matrix, p: StaticProblem): NodalLoads {
        let t: Matrix
        let ULocal: Matrix

        if (this.type === 'Truss') {
            t = getT_4x4(this.angle)
            ULocal = mult([
                t, math.matrix!([
                    [U!.get([this.n1.uIndex!, 0])],
                    [U!.get([this.n1.vIndex!, 0])],
                    [U!.get([this.n2.uIndex!, 0])],
                    [U!.get([this.n2.vIndex!, 0])]
                ])
            ]) as Matrix
        } else {
            t = getT_6x6(this.angle)
            ULocal = mult([
                t, math.matrix!([
                    [U.get([this.n1.uIndex!, 0])],
                    [U.get([this.n1.vIndex!, 0])],
                    [U.get([this.n1.wIndex!, 0])],
                    [U.get([this.n2.uIndex!, 0])],
                    [U.get([this.n2.vIndex!, 0])],
                    [U.get([this.n2.wIndex!, 0])]
                ])
            ]) as Matrix
        }

        const nl = mult([this.K.kLocal, ULocal]) as Matrix

        if (this.type === 'Truss') {
            return new NodalLoads(
                nl.get([0, 0]),
                nl.get([1, 0]),
                0,
                nl.get([2, 0]),
                nl.get([3, 0]),
                0
            )
        } else {
            return new NodalLoads(
                nl.get([0, 0]),
                nl.get([1, 0]),
                nl.get([2, 0]),
                nl.get([3, 0]),
                nl.get([4, 0]),
                nl.get([5, 0])
            )
        }
    }

    /**
     * Calculates normal tension in element
     * @param U Global displacement vector
     * @param p Problem instance
     */
    getNormalTension (U: Matrix, p: StaticProblem) {
        const nodalLoads = this.getNodalLoads(U, p)
        return -nodalLoads.X1 / this.properties.A
    }

    /**
     *  Returns forces and moments at adimensional x location
     * @param U Global displacement vector
     * @param p Problem instance
     *              (x=0 is at node 1 and x=1 is at node 2)
     */
    getForces (U: Matrix, p: StaticProblem): Forces {
        const l = this.length()
        const nodalLoads = this.getNodalLoads(U, p)

        const x = function (xAdim: number):number {
            return xAdim * l
        }

        let fx1 = 0
        let fy1 = 0
        let fw1 = 0
        let fx2 = 0
        let fy2 = 0
        let fw2 = 0

        for (const dl of this.distributedLoads) {
            fx1 += dl.l1.x
            fy1 += dl.l1.y
            fw1 += dl.l1.w
            fx2 += dl.l2.x
            fy2 += dl.l2.y
            fw2 += dl.l2.w
        }

        const t = getT_6x6(this.angle)
        const f = mult([
            t,
            math.matrix!([
                [fx1],
                [fy1],
                [fw1],
                [fx2],
                [fy2],
                [fw2]
            ])
        ]) as Matrix

        const N1 = nodalLoads.X1 - f.get([0, 0])
        const V1 = nodalLoads.Y1 - f.get([1, 0])
        const M1 = nodalLoads.M1 - f.get([2, 0])
        // const N2 = nodalLoads.X2 - f.get([3, 0])
        // const V2 = nodalLoads.Y2 - f.get([4, 0])
        // const M2 = nodalLoads.M2 - f.get([5, 0])

        let n1 = 0
        let v1 = 0
        let n2 = 0
        let v2 = 0

        for (const dl of this.distributedLoads) {
            n1 += dl.l1PerLengthLocal.x
            v1 += dl.l1PerLengthLocal.y
            n2 += dl.l2PerLengthLocal.x
            v2 += dl.l2PerLengthLocal.y
        }

        const n = function (xAdim:number):number {
            return n1 + (n2 - n1) * xAdim
        }
        const v = function (xAdim:number):number {
            return v1 + (v2 - v1) * xAdim
        }

        const N = function (xAdim:number): number {
            return -(N1 + (n(0) + n(xAdim)) * xAdim / l / 2)
        }
        const V = function (xAdim:number): number {
            return V1 + (v(0) + v(xAdim)) * xAdim / l / 2
        }

        const s1 = function (xAdim:number):number {
            return (v(0) * x(xAdim))
        }
        const x1 = function (xAdim:number):number {
            return x(xAdim) / 2
        }
        const s2 = function (xAdim:number):number {
            return (v(xAdim) - v(0)) * x(xAdim) / 2
        }

        const x2 = function (xAdim:number):number {
            return 2 / 3 * x(xAdim)
        }
        const xG = function (xAdim:number):number {
            let r = (s1(xAdim) * x1(xAdim) + s2(xAdim) * x2(xAdim)) / (s1(xAdim) + s2(xAdim))
            if (isNaN(r)) {
                r = 0
            }
            return r
        }

        const M = function (xAdim:number): number {
            return -(M1 + (v(0) + v(xAdim)) * x(xAdim) / 2 * xG(xAdim) - V(xAdim) * x(xAdim))
        }
        return new Forces(N, V, M)
    }
}
