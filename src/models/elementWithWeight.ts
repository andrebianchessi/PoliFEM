import { Element } from './element'
import { FrameProperties } from './frameProperties'
import { Load } from './load'
import { Node } from './node'
import { Problem } from './problem'
import { TrussProperties } from './trussProperties'

export class ElementWithWeight extends Element {
    constructor (type: 'Frame' | 'Truss', n1:Node, n2:Node, properties: FrameProperties | TrussProperties, p: Problem, g:number) {
        super(type, n1, n2, properties, p)
        const nodesWeight = -properties.rho! * super.length() / 2 * g
        new Load(0, nodesWeight, 0, n1, p, true)
        new Load(0, nodesWeight, 0, n2, p, true)
    }
}
