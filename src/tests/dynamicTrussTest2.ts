/*

Test of an axial impact on bar fixed o one end

*/

import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'

/**
 * Finds truss bridge natural frequency
 */
export function DynamicTrussTest2 () {
    console.log('Dynamic truss test 2')
    const L = 100
    const properties = { E: 30 * 1000000, A: 1, rho: 7.4 / 10000 }

    const p = new DynamicProblem()

    let n1: Node
    let n2: Node
    const elementLength = L / 6
    for (let i = 0; i <= 5; i++) {
        n1 = Node.get(i * elementLength, 0, p)
        n2 = Node.get((i + 1) * elementLength, 0, p)
        new Element('Truss', n1, n2, properties, p)
    }

    new BoundaryCondition(Node.get(0, 0, p), 'RollerX', p)
    new BoundaryCondition(n2!, 'Pin', p)

    p.plot()

    // p.solveTimeHistory()

    // p.plotElementTension(p.elements.get(25)!)
    console.log('ok')
}
