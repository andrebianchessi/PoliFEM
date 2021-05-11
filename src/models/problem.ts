import { Element } from './element'
import { Node } from './node'
import { Load } from './load'
import { BoundaryCondition } from './boundaryCondition'

export class Problem {
    nodes: Map<number, Map<number, Node>>
    nodeCount: number
    elements: Map<number, Element>
    elementCount: number
    loads: Load[]
    boundaryConditions: BoundaryCondition[]

    constructor () {
        this.nodes = new Map<number, Map<number, Node>>()
        this.nodeCount = 0
        this.elements = new Map<number, Element>()
        this.elementCount = 0
        this.loads = []
        this.boundaryConditions = []
    }

    getDegreesOfFreedom ():number {
        let dof = 0
        for (const [, map] of this.nodes) {
            for (const [, node] of map) {
                if (node.uIndex != null) {
                    dof += 1
                }
                if (node.vIndex != null) {
                    dof += 1
                }
                if (node.wIndex != null) {
                    dof += 1
                }
            }
        }
        return dof
    }
}
