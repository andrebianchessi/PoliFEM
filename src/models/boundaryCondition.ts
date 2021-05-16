import { Node } from './node'
import { Problem } from './problem'

export class BoundaryCondition {
    node: Node
    type: 'Fix' | 'RollerX' | 'RollerY' | 'Pin'
    value?: number
    restrictedIndices: number[]

    constructor (node: Node, type: 'Fix' | 'RollerX' | 'RollerY' | 'Pin', p: Problem) {
        this.node = node
        this.type = type
        this.value = 0
        this.restrictedIndices = []
        p.boundaryConditions.push(this)
        switch (this.type) {
        case 'Fix': {
            for (const i of [this.node.uIndex, this.node.vIndex, this.node.wIndex]) {
                if (i != null) {
                    this.restrictedIndices.push(i)
                }
            }
            break
        }
        case 'RollerX': {
            for (const i of [this.node.vIndex]) {
                if (i != null) {
                    this.restrictedIndices.push(i)
                }
            }
            break
        }
        case 'RollerY': {
            for (const i of [this.node.uIndex]) {
                if (i != null) {
                    this.restrictedIndices.push(i)
                }
            }
            break
        }
        case 'Pin': {
            for (const i of [this.node.uIndex, this.node.vIndex]) {
                if (i != null) {
                    this.restrictedIndices.push(i)
                }
            }
            break
        }
        }
    }
}
