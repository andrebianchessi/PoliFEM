import { PrintSparseMatrix } from '../functions/printSparseMatrix'
import { GmshParser } from '../models/gmshParser'
import { Node } from '../models/node'
import { SolidElementProperties } from '../models/solidElementProperties'
import { StaticProblem } from '../models/staticProblem'

export async function Solid () {
    console.log('Solid test')

    Node.firstNodeIndex = 1
    const p = new StaticProblem()
    const g = new GmshParser(p)
    const properties: SolidElementProperties = { E: 29 * 1000000, v: 0.3, t: 1 }
    g.readMshFile('./plate.msh', properties)
    g.addNodesAndElements()
    g.createBoundaryConditions('Bottom', 'Fix')
    g.createBoundaryConditions('Right', 'RollerY')
    g.createLoads('Top', 0, 10000)
    p.solve()
    // console.log(p.U?.get([Node.get(0, 0, p).uIndex!, 0]))
    // console.log(p.U?.get([Node.get(3, 0, p).uIndex!, 0]))
    // console.log(p.U?.get([Node.get(0, 10, p).uIndex!, 0]))
    // console.log(p.U?.get([Node.get(5, 10, p).uIndex!, 0]))
    // console.log(p.U?.get([Node.get(0, 0, p).vIndex!, 0]))
    // console.log(p.U?.get([Node.get(3, 0, p).vIndex!, 0]))
    // console.log(p.U?.get([Node.get(0, 10, p).vIndex!, 0]))
    // console.log(p.U?.get([Node.get(5, 10, p).vIndex!, 0]))
    g.saveStaticProblemToMsh('test.msh', 100)
    console.log('ok')
}
