/*

Test of an axial impact on bar fixed o one end

*/

import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'

/**
 * Finds truss bridge natural frequency
 */
export function DynamicTrussTest2 () {
    console.log('Dynamic truss test 2')
    const L = 100 // bridge length
    const H = 20 // bridge height
    const properties = { E: 30 * 1000000, A: 1, rho: 7.4 / 10000 }

    // Bridge top arch equation
    function y (x: number):number {
        const a = -4 * H / (L * L)
        return a * x * x + H
    }

    const p = new DynamicProblem()

    const archNodes:Node[] = []
    const floorNodes:Node[] = []
    const elementLength = L / 6
    let x = 0
    for (let i = 0; i <= 3; i++) {
        x = i * elementLength
        floorNodes.push(Node.get(x, 0, p))
        archNodes.push(Node.get(x, y(x), p))
    }
    for (let i = 0; i < floorNodes.length - 1; i++) {
        new Element('Truss', floorNodes[i], floorNodes[i + 1], properties, p)
        new Element('Truss', archNodes[i], archNodes[i + 1], properties, p)
        new Element('Truss', floorNodes[i], archNodes[i], properties, p)
    }
    for (let i = 0; i < archNodes.length - 2; i++) {
        new Element('Truss', archNodes[i], floorNodes[i + 1], properties, p)
    }

    p.plot()

    // p.solveTimeHistory()

    // p.plotElementTension(p.elements.get(25)!)
    console.log('ok')
}
