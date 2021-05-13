/*

Test of an axial impact on bar fixed o one end

*/

import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'

export function DynamicTrussTest () {
    console.log('Dynamic truss test')

    const timeStep = 0.0000001
    const duration = 0.000001
    const nElements = 30
    const finalX = 300
    const properties = { E: 206000000000, A: 1 / 10000, rho: 1 }

    const p = new DynamicProblem(timeStep, duration)
    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    for (let x = 0; x <= finalX - elementLength; x = x + elementLength) {
        n1 = Node.get(x, 0, p)
        n2 = Node.get(x + elementLength, 0, p)
        new Element('Truss', n1, n2, properties, p)
    }
    new BoundaryCondition(n2!, 'Fix', p)
    new Load(1, 0, 0, Node.get(0, 0, p), p)
    // p.plot(true)

    p.buildK()
    p.buildM()
    p.buildF()
    p.setInitialConditions()
    p.solve()

    p.plot(false, 0)
}
