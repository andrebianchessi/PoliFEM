/*

Test of an axial impact on bar fixed o one end

*/

import { Element } from '../models/element'
import { Node } from '../models/node'
import { Load } from '../models/load'
import { StaticProblem } from '../models/staticProblem'
import { PrintSparseMatrix } from '../functions/printSparseMatrix'
import { BoundaryCondition } from '../models/boundaryCondition'

/**
 * Finds truss bridge natural frequency
 */
export function DynamicTrussTest2 () {
    console.log('Dynamic truss test 2')
    const L = 600 // bridge length
    const H = 20 // bridge height
    const properties = { E: 1, A: 1, rho: 7.4 / 10000 }

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
    const a1 = Node.get(elementLength, y(elementLength), p)
    const a2 = Node.get(elementLength * 2, y(elementLength * 2), p)

    // floor
    new Element('Frame', f1, f2, properties, p)
    new Element('Frame', f2, f3, properties, p)

    // cross
    new Element('Frame', f1, a1, properties, p)
    new Element('Frame', f2, a2, properties, p)

    // vertical
    new Element('Frame', f2, a1, properties, p)
    new Element('Frame', f3, a2, properties, p)

    // top
    new Element('Frame', a1, a2, properties, p)

    new Load(0, -1, 0, a2, p)
    new BoundaryCondition(f1, 'Pin', p)
    new BoundaryCondition(f3, 'RollerY', p)

    p.plot(true)
    try {
        p.solve()
        p.plot(false, 1 / 100000)
    } catch (e) {
        console.log(e)
    }

    // PrintSparseMatrix(p.K!)
    // PrintSparseMatrix(p.F!)
    // p.solveTimeHistory()

    // p.plotElementTension(p.elements.get(25)!)
}
