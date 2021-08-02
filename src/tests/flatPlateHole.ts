import { GmshParser } from '../models/gmshParser'
import { Node } from '../models/node'
import { SolidElementProperties } from '../models/solidElementProperties'
import { StaticProblem } from '../models/staticProblem'

export function FlatPlateHole () {
    console.log('Solid gmsh test 2')

    Node.firstNodeIndex = 1
    const p = new StaticProblem()
    const g = new GmshParser(p)
    const properties: SolidElementProperties = { E: 200000, v: 0.3, t: 1 }
    g.readMshFile('./flatPlateHole.msh', properties)
    g.addNodesAndElements()
    g.createBoundaryConditions('Bottom', 'RollerX')
    g.createBoundaryConditions('Right', 'RollerY')
    g.createDistributedLoad('Top', 0, 0.5)
    p.solve()
    g.saveStaticProblemToMsh('flatPlateHoleSolution.msh', 0)
    console.log('ok')
}
