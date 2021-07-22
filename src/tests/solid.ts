import { GmshParser } from '../models/gmshParser'
import { StaticProblem } from '../models/staticProblem'

export async function Solid () {
    console.log('Solid test')

    const p = new StaticProblem()
    const g = new GmshParser(p)
    g.readMshFile('./plate.msh', 1)

    console.log('ok')
}
