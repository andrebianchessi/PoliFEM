import { Node } from './node'
import { Problem } from './problem'

export class BoundaryCondition {
    node: Node
    type: 'Fix' | 'RollerX' | 'RollerY' | 'Pin'
    value?: number

    constructor (node: Node, type: 'Fix' | 'RollerX' | 'RollerY' | 'Pin', p: Problem) {
        this.node = node
        this.type = type
        p.boundaryConditions.push(this)
    }
}
