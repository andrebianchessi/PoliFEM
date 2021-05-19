import { BoundaryCondition } from '../models/boundaryCondition'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { InitialSpeed } from '../models/initialSpeed'
import { Element } from '../models/element'

/**
 * Simulates beam pinned at one end that falls into a support
 */
export function FallingBeam () {
    console.log('Falling beam test')

    const timeStep = 0.0000001
    const duration = 0.001
    const nElements = 40
    const finalX = 20
    const properties = { E: 30 * 1000000, A: 1, I: 1, rho: 7.4 / 10000 }
    const w = 50 // rotation speed

    const p = new DynamicProblem(timeStep, duration)
    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    const beamNodes = []
    for (let i = 0; i < nElements; i++) {
        n1 = Node.get(i * elementLength, 0, p)
        n2 = Node.get((i + 1) * elementLength, 0, p)
        beamNodes.push(n1)
        beamNodes.push(n2)
        new Element('Frame', n1, n2, properties, p)
        new InitialSpeed(n2, 'Y', -w * n2.x, p)
    }
    new BoundaryCondition(Node.get(0, 0, p), 'Pin', p)
    new BoundaryCondition(n2!, 'RollerX', p)
    p.plot()

    p.solveTimeHistory()
    p.plotNodeYDisplacement(beamNodes[Math.floor(beamNodes.length / 2)])
    p.plotNodeYDisplacement(beamNodes[3])
}