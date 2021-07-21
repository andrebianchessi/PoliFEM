import { BoundaryCondition } from '../models/boundaryCondition'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'

/**
 * Test of an axial impact on a horizontal bar fixed on one end
 */
export function TrussAxialImpact () {
    console.log('Truss axial impact')

    const timeStep = 0.00000001
    const duration = 300 * 1 / 1000000
    const nElements = 80
    const finalX = 20
    const properties = { E: 30 * 1000000, A: 1, rho: 7.4 / 10000 }

    const p = new DynamicProblem(timeStep, duration)
    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    for (let i = 0; i < nElements; i++) {
        n1 = Node.get(i * elementLength, 0, p)
        n2 = Node.get((i + 1) * elementLength, 0, p)
        new StructuralElement('Truss', n1, n2, properties, p)
    }
    new BoundaryCondition(n2!, 'Pin', p)
    new Load(100, 0, 0, Node.get(0, 0, p), p)
    p.plot()

    p.solveTimeHistory('Explicit')

    p.plotElementTension(p.elements.get(25)!)
    console.log('ok')
}
