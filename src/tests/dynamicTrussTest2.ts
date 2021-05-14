/*

Test of an axial impact on bar fixed o one end

*/

import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'

export function DynamicTrussTest2 () {
    console.log('Dynamic truss test')

    const timeStep = 0.000001
    const duration = 10 * timeStep
    const properties = { E: 30, A: 10, rho: 0.01 }

    const p = new DynamicProblem(timeStep, duration)

    const n1 = Node.get(0, 0, p)
    const n2 = Node.get(0, 60, p)
    const n3 = Node.get(60, 0, p)

    new Element('Truss', n1, n2, properties, p)
    new Element('Truss', n2, n3, properties, p)
    new Element('Truss', n1, n3, properties, p)

    new BoundaryCondition(n1!, 'Pin', p)
    new BoundaryCondition(n3!, 'RollerX', p)
    // p.plot()

    p.buildK()
    p.buildM()
    p.buildF()
    p.applyBC()
    p.setInitialConditions()
}
