import { GmshParser } from '../models/gmshParser'
import { Node } from '../models/node'
import { SolidElementProperties } from '../models/solidElementProperties'
import { StaticProblem } from '../models/staticProblem'

export function FlatPlate () {
    console.log('Solid gmsh test')

    Node.firstNodeIndex = 1
    const p = new StaticProblem()
    const g = new GmshParser(p)
    const properties: SolidElementProperties = { E: 29 * 1000000, v: 0.3, t: 1 }
    g.readMshFile('./flatPlate.msh', properties)
    g.addNodesAndElements()
    g.createBoundaryConditions('Bottom', 'Fix')
    g.createDistributedLoad('Top', 0, 1)
    p.solve()
    g.saveStaticProblemToMsh('flatPlateSolution.msh', 0)
    console.log('ok')
}
