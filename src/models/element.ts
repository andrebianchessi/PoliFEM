import { Angle } from './angleInRadians'
import { FrameProperties } from './frameProperties'
import { Node } from './node'
import { Problem } from './problem'
import { StiffnessMatrix } from './stiffnessMatrix'

export class Element {
    type: 'Frame'
    n1: Node
    n2: Node
    properties: FrameProperties
    angle: Angle
    K: StiffnessMatrix

    constructor (type: 'Frame', n1:Node, n2:Node, properties: FrameProperties, p: Problem) {
        this.type = type
        this.n1 = n1
        this.n2 = n2
        this.properties = properties
        if (n2.x !== n1.x) {
            this.angle = new Angle(Math.atan((n2.y - n1.y)) / (n2.x - n1.x))
        } else {
            this.angle = new Angle(-Math.PI / 2)
        }
        this.K = (new StiffnessMatrix(this, type))

        p.elements.set(p.elements.size, this)
    }

    length ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
}
