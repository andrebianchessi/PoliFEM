import { PrintSparseMatrix } from '../functions/printSparseMatrix'
import { Node } from '../models/node'
import { SolidElement } from '../models/solidElement'
import { SolidElementProperties } from '../models/solidElementProperties'
import { StaticProblem } from '../models/staticProblem'

export function Solid () {
    const p = new StaticProblem()
    const properties: SolidElementProperties = { E: 200 * 100000, v: 0.32, t: 0.3 }
    const nk = Node.get(1.5, 1, p)
    const ni = Node.get(2.25, 0.75, p)
    const nj = Node.get(2.4, 1.65, p)
    new SolidElement(ni, nj, nk, properties, p)
    p.build()
    PrintSparseMatrix(p.K!)
}
