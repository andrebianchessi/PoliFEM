/* eslint-disable no-unused-vars */
import { BoundaryCondition } from '../models/boundaryCondition'
import { StructuralDistributedLoad } from '../models/structuralDistributedLoad'
import { StructuralElement } from '../models/structuralElement'
import { Node } from '../models/node'
import { StaticProblem } from '../models/staticProblem'
import { PrintSparseMatrix } from '../functions/printSparseMatrix'

export function BeamStaticDiagram2 (showPlots: boolean) {
    console.log('Static beam diagram 2 test')

    const properties = { E: 29 * 10000000, A: 20, I: 1800 }

    const p = new StaticProblem()

    const nA = Node.get(0, 0, p)
    const nB = Node.get(10, 0, p)
    const nC = Node.get(30, 0, p)
    const nD = Node.get(10, -15, p)
    const e1 = new StructuralElement('Frame', nA, nB, properties, p)
    const e2 = new StructuralElement('Frame', nB, nC, properties, p)
    const e3 = new StructuralElement('Frame', nD, nB, properties, p)

    new StructuralDistributedLoad(e2, 0, -1200, 0, -1200, p)
    new BoundaryCondition(nA, 'Pin', p)
    new BoundaryCondition(nC, 'RollerX', p)
    new BoundaryCondition(nD, 'RollerX', p)

    p.solve()
    showPlots = true
    if (showPlots) {
        p.plotDisplacements('Ex2: Original and deformed structure', 100000)
        p.plotExternalLoads('Ex2: External loads', 1)
        // p.plotForcesDiagram('Ex2: Forces diagam on element A-B', e1)
        // p.plotForcesDiagram('Ex2: Forces diagam on element B-C', e2)
        // p.plotForcesDiagram('Ex2: Forces diagam on element B-D', e3)
    }

    console.log('ok')
}
