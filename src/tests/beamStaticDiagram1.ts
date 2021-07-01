import { BoundaryCondition } from '../models/boundaryCondition'
import { DistributedLoad } from '../models/distributedLoad'
import { Element } from '../models/element'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'

export function BeamStaticDiagram1 () {
    console.log('Static beam diagram 1 test')
    const L = 10
    const properties = { E: 30 * 1000000, A: 1, I: 1, rho: 7.4 / 10000 }

    const p = new StaticProblem()

    const n1 = Node.get(0, 0, p)
    const n2 = Node.get(L, 0, p)
    const n3 = Node.get(2 * L, 0, p)
    const e1 = new Element('Frame', n1, n2, properties, p)
    const e2 = new Element('Frame', n2, n3, properties, p)

    new DistributedLoad(e1, 0, -100, 0, -100, p)
    new BoundaryCondition(n1, 'Fix', p)
    new BoundaryCondition(n2, 'RollerX', p)
    new BoundaryCondition(n3, 'Fix', p)
    p.plot()
    p.solve()
    p.plotDisplacements(10)
    p.plotForcesDiagram(e1)
    p.plotForcesDiagram(e2)

    console.log('ok')
}
