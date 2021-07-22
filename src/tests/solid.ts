import { GmshParser } from '../models/gmshParser'
import { Node } from '../models/node'
import { SolidElementProperties } from '../models/solidElementProperties'
import { StaticProblem } from '../models/staticProblem'

export async function Solid () {
    console.log('Solid test')

    Node.firstNodeIndex = 1
    const p = new StaticProblem()
    const g = new GmshParser(p)
    const properties: SolidElementProperties = { E: 29 * 1000000, v: 0.3 }
    g.readMshFile('./plate.msh', 1, properties)
    g.addNodesAndElements()
    g.createBoundaryConditions('Bottom', 'Fix')
    console.log(p)
    console.log('ok')
}
