import { Node } from './node'

export class BoundaryCondition {
    node: Node
    type: 'Fix'

    constructor (node: Node, type: 'Fix') {
        this.node = node
        this.type = type
    }
}
