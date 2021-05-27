/* eslint-disable camelcase */
import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { Element } from './element'
import { Load } from './load'
import { math } from './math'
import { Problem } from './problem'

export class DistributedLoad {
    e: Element
    l1: Load
    l2: Load
    l1PerLengthLocal: Load
    l2PerLengthLocal: Load
    constructor (e: Element, x1:number, y1:number, x2:number, y2:number, p:Problem) {
        this.e = e
        const l = e.length()
        this.l1 = new Load(
            (1 / 3 * x1 + 1 / 6 * x2) * l,
            (7 / 20 * y1 + 3 / 20 * y2) * l,
            (1 / 20 * y1 + 1 / 30 * y2) * l * l,
            e.n1, p, true, true
        )
        this.l2 = new Load(
            (1 / 3 * x2 + 1 / 6 * x1) * l,
            (7 / 20 * y2 + 3 / 20 * y1) * l,
            (-1 / 20 * y2 - 1 / 30 * y1) * l * l,
            e.n2, p, true, true
        )
        p.distributedLoads.push(this)

        let fGlobal: Matrix
        let t: Matrix

        if (e.type === 'Truss') {
            t = getT_4x4(e.angle)
            fGlobal = math.matrix!([
                [x1],
                [y1],
                [x2],
                [y2]
            ])
        } else {
            t = getT_6x6(e.angle)
            fGlobal = math.matrix!([
                [x1],
                [y1],
                [0],
                [x2],
                [y2],
                [0]
            ])
        }

        const fLocal = mult([t, fGlobal]) as Matrix

        if (e.type === 'Truss') {
            this.l1PerLengthLocal = new Load(fLocal.get([0, 0]), fLocal.get([0, 1]), 0, e.n1, p, false)
            this.l2PerLengthLocal = new Load(fLocal.get([0, 2]), fLocal.get([0, 3]), 0, e.n2, p, false)
        } else {
            this.l1PerLengthLocal = new Load(fLocal.get([0, 0]), fLocal.get([1, 0]), fLocal.get([2, 0]), e.n1, p, false)
            this.l2PerLengthLocal = new Load(fLocal.get([3, 0]), fLocal.get([4, 0]), fLocal.get([5, 0]), e.n2, p, false)
        }
        e.distributedLoads.push(this)
    }
}
