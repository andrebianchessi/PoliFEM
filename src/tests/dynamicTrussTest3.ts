import { BoundaryCondition } from '../models/boundaryCondition'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { ElementWithWeight } from '../models/elementWithWeight'

/**
 * Test of an axial impact on bar fixed on one end
 */
export function DynamicTrussTest3 () {
    console.log('Dynamic truss test 3')

    const timeStep = 0.0000005
    const duration = 300 * 1 / 1000000
    const nElements = 80
    const finalX = 20
    const properties = { E: 30 * 1000000, A: 1, rho: 7.4 / 10000 }

    const p = new DynamicProblem(timeStep, duration)
    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    for (let i = 0; i < nElements; i++) {
        n1 = Node.get(i * elementLength, i * elementLength, p)
        n2 = Node.get((i + 1) * elementLength, (i + 1) * elementLength, p)
        new ElementWithWeight('Truss', n1, n2, properties, p, 10)
    }
    new BoundaryCondition(Node.get(0, 0, p), 'Pin', p)
    p.plot()

    p.solveTimeHistory()
    p.plotNodeXDisplacement(n2!)

    // p.plotElementTension(p.elements.get(25)!)
    // console.log('ok')
}
