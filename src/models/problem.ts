import { Element } from './element'
import { Node } from './node'

export class Problem {
    nodes: Map<number, Map<number, Node>>
    elements: Map<number, Element>

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.elements = new Map<number, Element>()
    }
}
