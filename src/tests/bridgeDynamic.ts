import { Element } from '../models/element'
import { Node } from '../models/node'
import { BoundaryCondition } from '../models/boundaryCondition'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'

/**
 * Test of dynamic analisys of a truss bridge
 */
export function BridgeDynamic () {
    console.log('Bridge dynamic test')

    const load = 100
    const timeStep = 0.00001
    const duration = 0.09
    const L = 1100 // bridge length
    const H = 213 // bridge height
    const properties = { E: 30 * 1000000, A: 8, rho: 7.4 / 10000 }
    const elementType = 'Truss'

    const elementLength = L / 6
    // Bridge top arch equation
    function y (x: number):number {
        x = x - 3 * elementLength
        const a = -4 * H / (L * L)
        return a * x * x + H
    }

    const p = new DynamicProblem(timeStep, duration)

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

    new BoundaryCondition(floorNodes[0], 'Pin', p)
    new BoundaryCondition(floorNodes[6], 'RollerX', p)

    new Load(0, -load, 0, archNodes[2], p)

    p.plot()
    p.solveTimeHistory('Implicit')
    p.plotNodeYDisplacement(floorNodes[3])

    console.log('ok')
}
