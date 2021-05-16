/*

Test of an axial impact on bar fixed o one end

*/

import { Element } from '../models/element'
import { Node } from '../models/node'
import { Load } from '../models/load'
import { StaticProblem } from '../models/staticProblem'
import { BoundaryCondition } from '../models/boundaryCondition'

/**
 * Finds truss bridge natural frequency
 */
export function DynamicTrussTest2 () {
    console.log('Dynamic truss test 2')
    const L = 600 // bridge length
    const H = 20 // bridge height
    const properties = { E: 1, A: 1, I: 1, rho: 7.4 / 10000 }
    const elementType = 'Frame'

    // Bridge top arch equation
    function y (x: number):number {
        x = x - 3 * elementLength
        const a = -4 * H / (L * L)
        return a * x * x + H
    }

    const p = new StaticProblem()

    const elementLength = L / 6

    const f1 = Node.get(0, 0, p)
    const f2 = Node.get(elementLength, 0, p)
    const f3 = Node.get(elementLength * 2, 0, p)
    const f4 = Node.get(elementLength * 3, 0, p)
    const a1 = Node.get(elementLength, y(elementLength), p)
    const a2 = Node.get(elementLength * 2, y(elementLength * 2), p)
    const a3 = Node.get(elementLength * 3, y(elementLength * 3), p)

    // floor
    new Element(elementType, f1, f2, properties, p)
    new Element(elementType, f2, f3, properties, p)
    new Element(elementType, f3, f4, properties, p)

    // arch
    new Element(elementType, a1, a2, properties, p)
    new Element(elementType, a2, a3, properties, p)

    // cross
    new Element(elementType, f1, a1, properties, p)
    new Element(elementType, f2, a2, properties, p)
    new Element(elementType, f3, a3, properties, p)

    // vertical
    new Element(elementType, f2, a1, properties, p)
    new Element(elementType, f3, a2, properties, p)
    new Element(elementType, f4, a3, properties, p)

    new Load(0, -0.001, 0, a3, p)
    new BoundaryCondition(f1, 'Fix', p)
    new BoundaryCondition(f4, 'RollerY', p)

    p.plot(true)
    try {
        p.solve()
        p.plot(false, 1 / 100000)
    } catch (e) {
        console.log(e)
    }

    // p.solveTimeHistory()

    // p.plotElementTension(p.elements.get(25)!)
}
