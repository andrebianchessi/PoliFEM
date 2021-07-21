import { BoundaryCondition } from '../models/boundaryCondition'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { StructuralElement } from '../models/structuralElement'

/**
 * Modal analisys of beam pinned at both ends
 */
export function BeamModal () {
    console.log('Beam modal test')

    const nElements = 40
    const finalX = 20
    const properties = { E: 30 * 1000000, A: 1, I: 1, rho: 7.4 / 10000 }

    const p = new DynamicProblem()
    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    for (let i = 0; i < nElements; i++) {
        n1 = Node.get(i * elementLength, 0, p)
        n2 = Node.get((i + 1) * elementLength, 0, p)
        new StructuralElement('Frame', n1, n2, properties, p)
    }
    new BoundaryCondition(Node.get(0, 0, p), 'Pin', p)
    new BoundaryCondition(n2!, 'Pin', p)
    p.plot()

    p.solveModal()
    p.plotModeOfVibration(0)
    p.plotModeOfVibration(1)
    p.plotModeOfVibration(2)
    p.plotModeOfVibration(3)
}
