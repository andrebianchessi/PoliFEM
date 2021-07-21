import { BoundaryCondition } from '../models/boundaryCondition'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { StructuralElement } from '../models/structuralElement'
import { DynamicLoad } from '../models/dynamicLoad'

/**
 * Implicit dynamic analisys of beam fixed at one end
 */
export function BeamDynamic () {
    console.log('Beam dynamic test')

    const timeStep = 0.00001
    const duration = 0.004
    const nElements = 40
    const finalX = 20
    const properties = { E: 30 * 1000000, A: 1, I: 1, rho: 7.4 / 10000 }

    const p = new DynamicProblem(timeStep, duration)

    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    for (let i = 0; i < nElements; i++) {
        n1 = Node.get(i * elementLength, 0, p)
        n2 = Node.get((i + 1) * elementLength, 0, p)
        new StructuralElement('Frame', n1, n2, properties, p)
    }

    new BoundaryCondition(Node.get(0, 0, p), 'Fix', p)

    new DynamicLoad(function (t) { return 0 }, function (t) { return -1 }, function (t) { return 0 }, n2!, p)

    p.plot()

    p.solveTimeHistory('Implicit')
    p.plotNodeYDisplacement(n2!)
}
