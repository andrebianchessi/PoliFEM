import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { BoundaryCondition } from '../models/boundaryCondition'
import { DynamicProblem } from '../models/dynamicProblem'

/**
 * Test of modal analisys of a truss bridge
 */
export function BridgeModal (showPlots: boolean) {
    console.log('Bridge modal test')

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

    const pDynamic = new DynamicProblem()

    // Build floorNodes and archNodes
    const floorNodes: Node[] = []
    const archNodes: Node[] = []
    for (let i = 0; i < 7; i++) {
        floorNodes.push(Node.get(i * elementLength, 0, pDynamic))
    }
    for (let i = 1; i < 6; i++) {
        archNodes.push(Node.get(i * elementLength, y(i * elementLength), pDynamic))
    }

    // Connect floor and arch elements
    for (let i = 0; i < floorNodes.length - 1; i++) {
        new StructuralElement(elementType, floorNodes[i], floorNodes[i + 1], properties, pDynamic)
    }
    for (let i = 0; i < archNodes.length - 1; i++) {
        new StructuralElement(elementType, archNodes[i], archNodes[i + 1], properties, pDynamic)
    }

    // Vertical elements between floor and arch
    for (let i = 1; i < floorNodes.length - 1; i++) {
        new StructuralElement(elementType, floorNodes[i], archNodes[i - 1], properties, pDynamic)
    }

    // Diagonal elements between floor and arch
    for (let i = 0; i <= 2; i++) {
        new StructuralElement(elementType, floorNodes[i], archNodes[i], properties, pDynamic)
    }
    for (let i = 2; i <= 4; i++) {
        new StructuralElement(elementType, archNodes[i], floorNodes[i + 2], properties, pDynamic)
    }
    new BoundaryCondition(floorNodes[0], 'Pin', pDynamic)
    new BoundaryCondition(floorNodes[6], 'RollerX', pDynamic)

    pDynamic.solveModal()
    if (showPlots) {
        const displacementScale = 15
        pDynamic.plotModeOfVibration('Bridge', 0, displacementScale)
        pDynamic.plotModeOfVibration('Bridge', 1, displacementScale)
        pDynamic.plotModeOfVibration('Bridge', 2, displacementScale)
        pDynamic.plotModeOfVibration('Bridge', 3, displacementScale)
    }

    console.log('ok')
}
