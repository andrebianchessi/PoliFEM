import { BoundaryCondition } from '../models/boundaryCondition'
import { StructuralDistributedLoad } from '../models/structuralDistributedLoad'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'

export function BeamStaticDiagram3 () {
    console.log('Static beam diagram 3 test')

    const properties = { E: 29 * 1000000, A: 20, I: 1800 }

    const p = new StaticProblem()

    const nA = Node.get(0, 0, p)
    const nB = Node.get(10, 0, p)
    const nC = Node.get(30, 0, p)
    const nD = Node.get(10, -15, p)
    const e1 = new StructuralElement('Frame', nA, nB, properties, p)
    const e2 = new StructuralElement('Frame', nB, nC, properties, p)
    const e3 = new StructuralElement('Frame', nB, nD, properties, p)

    new StructuralDistributedLoad(e2, 0, -1200, 0, -1200, p)
    new BoundaryCondition(nA, 'Fix', p)
    new BoundaryCondition(nC, 'RollerX', p)
    new BoundaryCondition(nD, 'RollerX', p)
    p.plot()
    p.solve()
    p.plotDisplacements(10)
    p.plotForcesDiagram(e1)
    p.plotForcesDiagram(e2)
    p.plotForcesDiagram(e3)

    console.log('ok')
}
