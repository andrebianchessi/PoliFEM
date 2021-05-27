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
    K: StiffnessMatrix
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
        this.K = new StiffnessMatrix(this, type)

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
     * @param xAdim Adimensional x
     *              (x=0 is at node 1 and x=1 is at node 2)
     */
    getForces (U: Matrix, p: StaticProblem, xAdim: number): Forces {
        const l = this.length()
        const x = l * xAdim
        const nodalLoads = this.getNodalLoads(U, p)

        let n1 = 0
        let v1 = 0
        let w1 = 0
        let n2 = 0
        let v2 = 0
        let w2 = 0

        for (const dl of this.distributedLoads) {
            n1 += dl.l1.x
            v1 += dl.l1.y
            w1 += dl.l1.w
            n2 += dl.l2.x
            v2 += dl.l2.y
            w2 += dl.l2.w
        }

        const t = getT_6x6(this.angle)
        const f = mult([
            t,
            math.matrix!([
                [n1],
                [v1],
                [w1],
                [n2],
                [v2],
                [w2]
            ])
        ]) as Matrix

        const N1 = nodalLoads.X1 - f.get([0, 0])
        const V1 = nodalLoads.Y1 - f.get([1, 0])
        const M1 = nodalLoads.M1 - f.get([2, 0])
        // const N2 = nodalLoads.X2 - f.get([3, 0])
        // const V2 = nodalLoads.Y2 - f.get([4, 0])
        // const M2 = nodalLoads.M2 - f.get([5, 0])

        let n1D = 0
        let v1D = 0
        let n2D = 0
        let v2D = 0

        for (const dl of this.distributedLoads) {
            n1D += dl.l1Local.x
            v1D += dl.l1Local.y
            n2D += dl.l2Local.x
            v2D += dl.l2Local.y
        }

        const n = function (xAdim:number):number {
            return n1D + (n2D - n1D) * xAdim
        }
        const v = function (xAdim:number):number {
            return v1D + (v2D - v1D) * xAdim
        }

        const N = -(N1 + (n(0) + n(xAdim)) * x / 2)
        const V = V1 + (v(0) + v(xAdim)) * x / 2

        const s1 = (v(0) * x)
        const x1 = x / 2
        const s2 = (v(xAdim) - v(0)) * x / 2
        const x2 = 2 / 3 * x
        let xG = (s1 * x1 + s2 * x2) / (s1 + s2)
        if (isNaN(xG)) {
            xG = 0
        }
        console.log(xG)

        const M = -(M1 - (v(0) + v(xAdim)) * x / 2 * xG - V * x)
        return new Forces(N, V, M)
    }
}
