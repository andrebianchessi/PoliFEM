import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { BoundaryCondition } from '../models/boundaryCondition'
import { DynamicProblem } from '../models/dynamicProblem'
import { DynamicLoad } from '../models/dynamicLoad'

/**
 * Test of dynamic analisys of a truss bridge
 */
export function BridgeDynamic (showPlots: boolean) {
    console.log('Bridge dynamic test')
    const f0 = 3.8498 // Hz
    const f = function (t: number) {
        const omega = f0 * 2 * Math.PI
        return Math.sin(omega * t)
    }
    const timeStep = 0.001
    const duration = 10 * 1 / f0
    const L = 100 // bridge length
    const H = 50 // bridge height
    const properties = { E: 200 * 1000000000, A: 0.003, rho: 8000 }
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
        new StructuralElement(elementType, floorNodes[i], floorNodes[i + 1], properties, p)
    }
    for (let i = 0; i < archNodes.length - 1; i++) {
        new StructuralElement(elementType, archNodes[i], archNodes[i + 1], properties, p)
    }

    // Vertical elements between floor and arch
    for (let i = 1; i < floorNodes.length - 1; i++) {
        new StructuralElement(elementType, floorNodes[i], archNodes[i - 1], properties, p)
    }

    // Diagonal elements between floor and arch
    for (let i = 0; i <= 2; i++) {
        new StructuralElement(elementType, floorNodes[i], archNodes[i], properties, p)
    }
    for (let i = 2; i <= 4; i++) {
        new StructuralElement(elementType, archNodes[i], floorNodes[i + 2], properties, p)
    }

    new BoundaryCondition(floorNodes[0], 'Pin', p)
    new BoundaryCondition(floorNodes[6], 'RollerX', p)

    // new Load(0, -load, 0, archNodes[2], p)
    new DynamicLoad((t) => 0, f, (t) => 0, archNodes[2], p)

    p.solveTimeHistory('Implicit')

    if (showPlots) {
        p.plotNodeYDisplacement('Bridge dynamic analysis: Central node vertical displacement for sinusoidal excitation of ' + f0 + ' Hz', floorNodes[3])
    }

    console.log('ok')
}
