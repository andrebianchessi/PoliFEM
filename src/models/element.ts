import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
// eslint-disable-next-line camelcase
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { Angle } from './angleInRadians'
import { DistributedLoad } from './distributedLoad'
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

export class Element {
    static count = 0
    index: number
    type: 'Frame' | 'Truss'
    n1: Node
    n2: Node
    properties: FrameProperties | TrussProperties
    K: (U?: Matrix) => StiffnessMatrix
    M?: MassMatrix
    distributedLoads: DistributedLoad[]
    angle: Angle

    constructor (type: 'Frame' | 'Truss', n1:Node, n2:Node, properties: FrameProperties | TrussProperties, p: Problem) {
        Element.count += 1
        this.index = Element.count
        this.distributedLoads = []
        if (type === 'Frame') {
            if ((properties as FrameProperties).I == null) {
                throw new Error('I not provided for element ' + this.index)
            }
        }
        this.type = type
        this.n1 = n1
        this.n2 = n2

        if (this.n2.x !== this.n1.x) {
            this.angle = new Angle(Math.atan((this.n2.y - this.n1.y) / (this.n2.x - this.n1.x)))
        } else {
            this.angle = new Angle(-Math.PI / 2)
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
        this.K = function (U?: Matrix) {
            return (new StiffnessMatrix(this, type, U))
        }

        p.elements.set(p.elementCount, this)
        p.elementCount += 1
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

        const nl = mult([this.K(U).kLocal, ULocal]) as Matrix

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
     * @param xAdim Adimensional x
     *              (x=0 is at node 1 and x=1 is at node 2)
     */
    getForces (U: Matrix, p: StaticProblem, xAdim: number): Forces {
        const l = this.length()
        const nodalLoads = this.getNodalLoads(U, p)

        // Distributed forces equivalent applied at nodes in global coord.
        const fDistNodal = math.matrix!([[0], [0], [0], [0], [0], [0]], 'sparse')

        for (const ld of this.distributedLoads) {
            fDistNodal.set([0, 0], fDistNodal.get([0, 0]) + ld.l1.x)
            fDistNodal.set([1, 0], fDistNodal.get([1, 0]) + ld.l1.y)
            fDistNodal.set([2, 0], fDistNodal.get([2, 0]) + ld.l1.w)
            fDistNodal.set([3, 0], fDistNodal.get([3, 0]) + ld.l2.x)
            fDistNodal.set([4, 0], fDistNodal.get([4, 0]) + ld.l2.y)
            fDistNodal.set([5, 0], fDistNodal.get([5, 0]) + ld.l2.w)
        }

        // Distributed forces equivalent applied at nodes in local coord.
        const fDistNodalLocal = mult([getT_6x6(this.angle), fDistNodal]) as Matrix

        // subtract distributed loads contribution
        nodalLoads.X1 -= fDistNodalLocal.get([0, 0])
        nodalLoads.Y1 -= fDistNodalLocal.get([1, 0])
        nodalLoads.M1 -= fDistNodalLocal.get([2, 0])
        nodalLoads.X2 -= fDistNodalLocal.get([3, 0])
        nodalLoads.Y2 -= fDistNodalLocal.get([4, 0])
        nodalLoads.M2 -= fDistNodalLocal.get([5, 0])

        let n1 = 0
        let v1 = 0
        let w1 = 0
        let n2 = 0
        let v2 = 0
        let w2 = 0

        for (const ld of this.distributedLoads) {
            n1 += ld.l1Local.x
            v1 += ld.l1Local.y
            w1 += ld.l1Local.w
            n2 += ld.l2Local.x
            v2 += ld.l2Local.y
            w2 += ld.l2Local.w
        }

        const x = function (xAdim:number): number {
            return xAdim * l
        }

        const n = function (xAdim:number): number {
            return n1 + (n2 - n1) * xAdim
        }
        const v = function (xAdim:number): number {
            return v1 + (v2 - v1) * xAdim
        }
        const w = function (xAdim:number): number {
            return w1 + (w2 - w1) * xAdim
        }

        // TODO
        const N = function (xAdim:number) {
            return -(nodalLoads.X1 + (n(0) + n(xAdim)) * x(xAdim) / 2)
        }

        const V = function (xAdim:number) {
            return nodalLoads.Y1 + (v(0) + v(xAdim)) * x(xAdim) / 2
        }

        const M = function (xAdim:number) {
            return -(nodalLoads.M1 + (w(0) + w(xAdim)) * x(xAdim) / 2 - V(xAdim) * x(xAdim) + (v(0) + v(xAdim)) * x(xAdim) / 2 * x(xAdim) / 2)
        }

        return new Forces(0, V(xAdim), M(xAdim))
    }
}
