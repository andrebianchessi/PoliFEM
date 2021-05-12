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

    const nElements = 30
    const finalX = 300

    const p = new DynamicProblem()
    const elementSize = finalX/nElements
    for (let x = 0; x<=finalX-elementSize; x = x + elementSize){
        const n1 = Node.get(x, 0, p)
    }

}