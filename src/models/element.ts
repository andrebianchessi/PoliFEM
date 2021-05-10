import { BeamProperties } from './beamProperties'
import { FrameProperties } from './frameProperties'
import { TrussProperties } from './trussProperties'

export class Element {
    private static all= new Map<number, Element>()
    static count = 0

    n1: Node
    n2: Node
    properties: BeamProperties | TrussProperties | FrameProperties

    constructor (n1:Node, n2:Node, properties: BeamProperties | TrussProperties| FrameProperties) {
        Element.count += 1
        this.n1 = n1
        this.n2 = n2
        this.properties = properties
        Element.all.set(Element.count, this)
    }
}
