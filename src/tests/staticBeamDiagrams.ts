import { BoundaryCondition } from '../models/boundaryCondition'
import { Element } from '../models/element'
import { Load } from '../models/load'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'

export function StaticBeamDiagram () {
    console.log('Static beam diagrams test')
    const properties = { E: 30 * 1000000, A: 1, I: 1, rho: 7.4 / 10000 }

    const p = new StaticProblem()

    const n1 = Node.get(0, 0, p)
    const n2 = Node.get(100, 0, p)
    const e = new Element('Frame', n1, n2, properties, p)

    new Load(0, -100, 0, n2, p)
    new BoundaryCondition(n1, 'Fix', p)
    p.plot()
    p.solve()
    p.plotDisplacements(10)
    p.plotForcesDiagram(e)

    console.log('ok')
}
