import { DynamicProblem } from './dynamicProblem'
import { Node } from './node'

export class InitialSpeed {
    dofIndex:number
    value: number
    constructor (node: Node, direction: 'X' | 'Y' | 'Z', value: number, p:DynamicProblem) {
        switch (direction) {
        case 'X': {
            if (node.uIndex == null) {
                throw new Error('Node has not been assigned to element')
            }
            this.dofIndex = node.uIndex!
            break
        }
        case 'Y': {
            if (node.vIndex == null) {
                throw new Error('Node has not been assigned to element')
            }
            this.dofIndex = node.vIndex!
            break
        }
        case 'Z': {
            if (node.wIndex == null) {
                throw new Error('Node has not been assigned to element')
            }
            this.dofIndex = node.wIndex!
            break
        }
        }
        this.value = value
        p.initialSpeeds.push(this)
    }
}
