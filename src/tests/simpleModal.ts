import { BoundaryCondition } from '../models/boundaryCondition'
import { DynamicProblem } from '../models/dynamicProblem'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'

/**
 * Test of modal analysis of simple (triangular) truss structure
 */
export async function SimpleModal (showPlots: boolean) {
    console.log('Modal truss test')
    const p = new DynamicProblem()

    const properties = { E: 30 * 10 ** 6, A: 10, rho: 0.1 / 10 }

    const n1 = Node.get(0, 0, p)
    const n2 = Node.get(0, 60, p)
    const n3 = Node.get(60, 0, p)

    new StructuralElement('Truss', n1, n2, properties, p)
    new StructuralElement('Truss', n2, n3, properties, p)
    new StructuralElement('Truss', n1, n3, properties, p)

    new BoundaryCondition(n1, 'Pin', p)
    new BoundaryCondition(n3, 'RollerX', p)

    p.solveModal()

    if (showPlots) {
        p.plotModeOfVibration('Title', 0, 10)
        p.plotModeOfVibration('Title', 1, 10)
        p.plotModeOfVibration('Title', 2, 10)
    }

    console.log('ok')
}
