import { BoundaryCondition } from '../models/boundaryCondition'
import { StructuralDistributedLoad } from '../models/structuralDistributedLoad'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'

export function BeamStaticDiagram1 (showPlots: boolean) {
    console.log('Static beam diagram 1 test')
    const L = 1
    const w = 1
    const properties = { E: 1, A: 1, I: 1, rho: 7.4 / 10000 }

    const p = new StaticProblem()

    const n1 = Node.get(0, 0, p)
    const n2 = Node.get(L, 0, p)
    const n3 = Node.get(3 * L, 0, p)
    const e1 = new StructuralElement('Frame', n1, n2, properties, p)
    const e2 = new StructuralElement('Frame', n2, n3, properties, p)

    new StructuralDistributedLoad(e1, 0, -w, 0, -w, p)
    new BoundaryCondition(n1, 'Fix', p)
    new BoundaryCondition(n2, 'RollerX', p)
    new BoundaryCondition(n3, 'Fix', p)

    p.solve()
    if (showPlots) {
        p.plot('Problem description')
        p.plotExternalLoads('Title', 0)
        p.plotForcesDiagram('Title', e1)
        p.plotForcesDiagram('Title', e2)
    }

    console.log('ok')
}
