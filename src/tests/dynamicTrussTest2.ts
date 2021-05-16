/*

Test of an axial impact on bar fixed o on

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
    const elementType = 'Truss'

    // Bridge top arch equation
    function y (x: number):number {
        x = x - 3 * elementLength
        const a = -4 * H / (L * L)
        return a * x * x + H
    }

    const p = new StaticProblem()

    const elementLength = L / 6

    // Build floorNodes and archNodes
    const floorNodes: Node[] = []
    const archNodes: Node[] = []
    for (let i = 0; i < 7; i++) {
        floorNodes.push(Node.get(i * elementLength, 0, p))
    }
    for (let i = 1; i < 6; i++) {
        archNodes.push(Node.get(i * elementLength, y(i * elementLength), p))
    }

    // Connect floor and arch elements
    for (let i = 0; i < floorNodes.length - 1; i++) {
        new Element(elementType, floorNodes[i], floorNodes[i + 1], properties, p)
    }
    for (let i = 0; i < archNodes.length - 1; i++) {
        new Element(elementType, archNodes[i], archNodes[i + 1], properties, p)
    }

    // Vertical elements between floor and arch
    for (let i = 1; i < floorNodes.length - 1; i++) {
        new Element(elementType, floorNodes[i], archNodes[i - 1], properties, p)
    }

    // Diagonal elements between floor and arch
    for (let i = 0; i <= 2; i++) {
        new Element(elementType, floorNodes[i], archNodes[i], properties, p)
    }
    for (let i = 2; i <= 4; i++) {
        new Element(elementType, archNodes[i], floorNodes[i + 2], properties, p)
    }

    new Load(0, -1, 0, archNodes[2], p)
    new BoundaryCondition(floorNodes[0], 'RollerX', p)
    new BoundaryCondition(floorNodes[6], 'Pin', p)

    p.plot()
    try {
        p.solve()
        p.plotDisplacements(1 / 1000000)
    } catch (e) {
        console.log(e)
    }

    console.log('ok')
}
