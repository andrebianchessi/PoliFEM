/*

Test of a truss bar structure

*/

import { BoundaryCondition } from '../models/boundaryCondition'
import { DynamicProblem } from '../models/dynamicProblem'
import { Element } from '../models/element'
import { Node } from '../models/node'

/**
 * Test of a truss bar structure
 */
export async function ModalTest () {
    console.log('Static truss test')
    const p = new DynamicProblem()

    const properties = { E: 30 * 10 ** 6, A: 10, rho: 0.1 / 10 }

    const n1 = Node.get(0, 0, p)
    const n2 = Node.get(0, 60, p)
    const n3 = Node.get(60, 0, p)

    new Element('Truss', n1, n2, properties, p)
    new Element('Truss', n2, n3, properties, p)
    new Element('Truss', n1, n3, properties, p)

    new BoundaryCondition(n1, 'Pin', p)
    new BoundaryCondition(n3, 'RollerX', p)

    await p.solveModal()
    // p.plotModeOfVibration(0, 10)
    // p.plotModeOfVibration(1, 10)
    // p.plotModeOfVibration(2, 10)
    // return checkResult(p.U!, [[0], [0], [0.00045767429203012776], [0.0004576742920301279], [0], [0], [0], [0]])
}
