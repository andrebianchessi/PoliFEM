import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'
import { Load } from '../models/load'
import { DynamicLoad } from '../models/dynamicLoad'

/**
 * Test of an axial impact on bar fixed on one end
 */
export function DynamicTrussTest1 () {
    console.log('Dynamic truss test 1')

    const timeStep = 0.0000005
    const duration = 300 * 1 / 1000000
    const nElements = 80
    const finalX = 20
    const properties = { E: 30 * 1000000, A: 1, rho: 7.4 / 10000 }

    const p = new DynamicProblem(timeStep, duration)
    const elementLength = finalX / nElements
    let n1: Node
    let n2: Node
    for (let x = 0; x <= finalX - elementLength; x = x + elementLength) {
        n1 = Node.get(x, 0, p)
        n2 = Node.get(x + elementLength, 0, p)
        new Element('Truss', n1, n2, properties, p)
    }
    new BoundaryCondition(n2!, 'Pin', p)
    new DynamicLoad((t:number) => 100, (t:number) => 0, (t:number) => 0, Node.get(0, 0, p), p)
    p.plot()

    p.buildK()
    p.buildM()
    p.buildF()
    p.setInitialConditions()
    p.applyBC()
    p.solveTimeHistory()

    p.plotElementTension(p.elements.get(25)!)
    console.log('ok')
}
