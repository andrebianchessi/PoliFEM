import { Angle } from './angleInRadians'
import { FrameProperties } from './frameProperties'
import { Node } from './node'
import { Problem } from './problem'
import { StiffnessMatrix } from './stiffnessMatrix'

export class Element {
    type: 'Frame' | 'Truss' | 'Beam'
    n1: Node
    n2: Node
    properties: FrameProperties
    angle: Angle
    K: StiffnessMatrix

    constructor (type: 'Frame' | 'Truss'| 'Beam', n1:Node, n2:Node, properties: FrameProperties, p: Problem) {
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
        if (type === 'Beam') {
            if (this.n1.vIndex == null) {
                this.n1.vIndex = p.dof
                p.dof += 1
            }
            if (this.n1.wIndex == null) {
                this.n1.wIndex = p.dof
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

        this.properties = properties
        if (n2.x !== n1.x) {
            this.angle = new Angle(Math.atan((n2.y - n1.y)) / (n2.x - n1.x))
        } else {
            this.angle = new Angle(-Math.PI / 2)
        }
        this.K = (new StiffnessMatrix(this, type))

        p.elements.set(p.elementCount, this)
        p.elementCount += 1
    }

    length ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
}
