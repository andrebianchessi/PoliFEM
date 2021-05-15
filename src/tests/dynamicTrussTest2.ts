/*

Test of an axial impact on bar fixed o one end

*/

import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'
import { StaticProblem } from '../models/staticProblem'

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
        x = x - 3 * elementLength
        const a = -4 * H / (L * L)
        return a * x * x + H
    }

    const p = new StaticProblem()

    const elementLength = L / 6
    const floorNodes: Node[] = []
    const archNodes: Node[] = []

    for (let i = 0; i < 7; i++) {
        floorNodes.push(Node.get(i * elementLength, 0, p))
    }
    for (let i = 1; i < 6; i++) {
        archNodes.push(Node.get(i * elementLength, y(i * elementLength), p))
    }

    for (let i = 0; i < 6; i++) {
        new Element('Truss', floorNodes[i], floorNodes[i + 1], properties, p)
    }
    for (let i = 0; i < 4; i++) {
        new Element('Truss', archNodes[i], archNodes[i + 1], properties, p)
    }

    new Element('Truss', floorNodes[0], archNodes[0], properties, p)
    new Element('Truss', floorNodes[6], archNodes[4], properties, p)

    for (let i = 1; i <= 5; i++) {
        new Element('Truss', floorNodes[i], archNodes[i - 1], properties, p)
    }
    new Load(0, -100, 0, archNodes[2], p)

    p.plot(true)
    p.solve()
    p.plot(false, 100000)

    // p.solveTimeHistory()

    // p.plotElementTension(p.elements.get(25)!)
}
