import { Angle } from './angleInRadians'
import { BeamProperties } from './beamProperties'
import { FrameProperties } from './frameProperties'
import { Node } from './node'
import { TrussProperties } from './trussProperties'

export class Element {
    private static all= new Map<number, Element>()
    static count = 0

    n1: Node
    n2: Node
    properties: BeamProperties | TrussProperties | FrameProperties
    angle: Angle

    constructor (n1:Node, n2:Node, properties: BeamProperties | TrussProperties| FrameProperties) {
        Element.count += 1
        this.n1 = n1
        this.n2 = n2
        this.properties = properties
        this.angle = new Angle(Math.atan((n2.y - n1.y)) / (n2.x - n1.x))
        Element.all.set(Element.count, this)
    }

    length ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
}
