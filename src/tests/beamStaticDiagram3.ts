import { BoundaryCondition } from '../models/boundaryCondition'
import { StructuralDistributedLoad } from '../models/structuralDistributedLoad'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'
import { Load } from '../models/load'

export function BeamStaticDiagram3 (showPlots: boolean) {
    console.log('Static beam diagram 3 test')

    const properties = { E: 29 * 1000000, A: 20, I: 1800 }

    const p = new StaticProblem()

    const nA = Node.get(0, 0, p)
    const nL = Node.get(5, 5, p)
    const nB = Node.get(10, 10, p)
    const nC = Node.get(5 + 5 + 14, 10, p)
    const nD = Node.get(5 + 5 + 14 + 10, 0, p)
    const e1 = new StructuralElement('Frame', nA, nL, properties, p)
    const e2 = new StructuralElement('Frame', nL, nB, properties, p)
    const e3 = new StructuralElement('Frame', nB, nC, properties, p)
    const e4 = new StructuralElement('Frame', nC, nD, properties, p)

    new StructuralDistributedLoad(e3, 0, -1200, 0, -1200, p)
    new Load(0, -10000, 0, nL, p)
    new BoundaryCondition(nA, 'RollerX', p)
    new BoundaryCondition(nD, 'Pin', p)

    p.solve()
    if (showPlots) {
        p.plot('Problem description')
        p.plotReactions('Ex3: External Reactions', 1)
        p.plotDisplacements('Ex3: Nodal displacements', 1000)
        p.plotForcesDiagram('Ex3: Forces on element A-L', e1)
        p.plotForcesDiagram('Ex3: Forces on element L-B', e2)
        p.plotForcesDiagram('Ex3: Forces on element B-C', e3)
        p.plotForcesDiagram('Ex3: Forces on element C-D', e4)
    }

    console.log('ok')
}
