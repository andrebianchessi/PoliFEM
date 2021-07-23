import { GmshParser } from '../models/gmshParser'
import { Node } from '../models/node'
import { SolidElementProperties } from '../models/solidElementProperties'
import { StaticProblem } from '../models/staticProblem'

export async function SolidGmsh2 () {
    console.log('Solid gmsh test 2')

    Node.firstNodeIndex = 1
    const p = new StaticProblem()
    const g = new GmshParser(p)
    const properties: SolidElementProperties = { E: 29 * 1000000, v: 0.3, t: 1 }
    g.readMshFile('./plateHole.msh', properties)
    g.addNodesAndElements()
    g.createBoundaryConditions('Bottom', 'Fix')
    g.createBoundaryConditions('Right', 'RollerY')
    g.createLoads('Top', 0, 100000)
    p.solve()
    g.saveStaticProblemToMsh('solid2.msh', 0)
    console.log('ok')
}
