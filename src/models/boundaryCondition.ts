import { Node } from './node'
import { Problem } from './problem'

export class BoundaryCondition {
    node: Node
    type: 'Fix'

    constructor (node: Node, type: 'Fix', p:Problem) {
        this.node = node
        this.type = type
        p.boundaryConditions.push(this)
    }
}
