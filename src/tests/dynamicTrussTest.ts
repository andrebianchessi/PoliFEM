/*

Test of an axial impact on bar fixed o one end

*/

import { checkResult } from '../functions/checkResult'
import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Load } from '../models/load'
import { Node } from '../models/node'
import { DynamicProblem } from '../models/dynamicProblem'

export function DynamicTrussTest(){
    console.log('Dynamic truss test')

    const timeStep = 0.1
    const nElements = 50
    const finalX = 300
    const properties = { E: 206000000000, A: 1 / 10000 }

    const p = new DynamicProblem(timeStep)
    const elementLength = finalX/nElements
    let n1: Node
    let n2: Node
    for (let x = 0; x<=finalX-elementLength; x = x + elementLength){
        n1 = Node.get(x, 0, p)
        n2 = Node.get(x+elementLength, 0, p)
        new Element('Truss', n1, n2, properties, p)
    }
    new BoundaryCondition(n2!, 'Fix', p)
    p.plot(true)

    p.buildK()
    p.buildF()
    p.setInitialConditions()

}