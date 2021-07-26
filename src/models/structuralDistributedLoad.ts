/* eslint-disable camelcase */
import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { getT_6x6 } from '../functions/rotationalMatrix'
import { StructuralElement } from './structuralElement'
import { Load } from './load'
import { math } from './math'
import { Problem } from './problem'

export class StructuralDistributedLoad {
    e: StructuralElement
    l1: Load
    l2: Load
    l1PerLengthLocal: Load
    l2PerLengthLocal: Load

    /**
     * x1, y1, x2 and y2 are given in the global reference frame
     */
    constructor (e: StructuralElement, x1:number, y1:number, x2:number, y2:number, p:Problem) {
        if (e.type === 'Truss') {
            throw new Error('Distributed loads on trusses not implemented')
        }
        this.e = e
        const l = e.length()

        const t = getT_6x6(e.angle)
        const fGlobal = math.matrix!([
            [x1],
            [y1],
            [0],
            [x2],
            [y2],
            [0]
        ])
        const fLocal = mult([t, fGlobal]) as Matrix
        const fLocalX1 = fLocal.get([0, 0])
        const fLocalY1 = fLocal.get([1, 0])
        const fLocalX2 = fLocal.get([3, 0])
        const fLocalY2 = fLocal.get([4, 0])

        const fLocalX1Eq = (1 / 3 * fLocalX1 + 1 / 6 * fLocalX2) * l
        const fLocalY1Eq = (7 / 20 * fLocalY1 + 3 / 20 * fLocalY2) * l
        const fLocalZ1Eq = (1 / 20 * fLocalY1 + 1 / 30 * fLocalY2) * l * l
        const fLocalX2Eq = (1 / 3 * fLocalX2 + 1 / 6 * fLocalX1) * l
        const fLocalY2Eq = (7 / 20 * fLocalY2 + 3 / 20 * fLocalY1) * l
        const fLocalZ2Eq = (-1 / 20 * fLocalY2 - 1 / 30 * fLocalY1) * l * l

        const fLocalEq = math.matrix!([
            [fLocalX1Eq],
            [fLocalY1Eq],
            [fLocalZ1Eq],
            [fLocalX2Eq],
            [fLocalY2Eq],
            [fLocalZ2Eq]
        ])

        const tTranspose = math.transpose!(t)
        const fGLobalEq = mult([tTranspose, fLocalEq]) as Matrix

        this.l1 = new Load(
            fGLobalEq.get([0, 0]),
            fGLobalEq.get([1, 0]),
            fGLobalEq.get([2, 0]),
            e.n1, p, true, true
        )
        this.l2 = new Load(
            fGLobalEq.get([3, 0]),
            fGLobalEq.get([4, 0]),
            fGLobalEq.get([5, 0]),
            e.n2, p, true, true
        )
        p.structuralDistributedLoads.push(this)

        this.l1PerLengthLocal = new Load(fLocalX1, fLocalY1, 0, e.n1, p, false)
        this.l2PerLengthLocal = new Load(fLocalX2, fLocalY2, 0, e.n2, p, false)

        e.distributedLoads.push(this)
    }
}
