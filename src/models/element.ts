import { Angle } from './angleInRadians'
import { FrameProperties } from './frameProperties'
import { Node } from './node'
import { StiffnessMatrix } from './stiffnessMatrix'

export class Element {
    private static all= new Map<number, Element>()
    static count = 0

    type: 'Frame'
    n1: Node
    n2: Node
    properties: FrameProperties
    angle: Angle
    K: StiffnessMatrix

    constructor (type: 'Frame', n1:Node, n2:Node, properties: FrameProperties) {
        Element.count += 1
        this.type = type
        this.n1 = n1
        this.n2 = n2
        this.properties = properties
        this.angle = new Angle(Math.atan((n2.y - n1.y)) / (n2.x - n1.x))
        this.K = (new StiffnessMatrix(this, type))

        Element.all.set(Element.count, this)
    }

    length ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
}
