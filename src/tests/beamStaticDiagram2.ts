import { BoundaryCondition } from '../models/boundaryCondition'
import { StructuralDistributedLoad } from '../models/structuralDistributedLoad'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'

export function BeamStaticDiagram2 (showPlots: boolean) {
    console.log('Static beam diagram 2 test')

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
    new BoundaryCondition(nA, 'Pin', p)
    new BoundaryCondition(nC, 'RollerX', p)
    new BoundaryCondition(nD, 'RollerX', p)

    p.solve()

    if (showPlots) {
        p.plot('Problem description')
        p.plotDisplacements('Title', 10000)
        p.plotExternalLoads('Title', 1)
        p.plotForcesDiagram('Title', e1)
        p.plotForcesDiagram('Title', e2)
        p.plotForcesDiagram('Title', e3)
    }

    console.log('ok')
}
