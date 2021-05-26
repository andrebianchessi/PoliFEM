/* eslint-disable camelcase */
import math, { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { Element } from './element'
import { Load } from './load'
import { Problem } from './problem'

export class DistributedLoad {
    e: Element
    l1: Load
    l2: Load
    l1Local: Load
    l2Local: Load
    constructor (e: Element, x1:number, y1:number, w1: number, x2:number, y2:number, w2: number, p:Problem) {
        this.e = e
        const l = e.length()
        this.l1 = new Load(
            (1 / 3 * x1 + 1 / 6 * x2) * l,
            (7 / 20 * y1 + 3 / 20 * y2) * l,
            (1 / 20 * w1 + 1 / 30 * w2) * l * l,
            e.n1, p
        )
        this.l2 = new Load(
            (1 / 3 * x2 + 1 / 6 * x1) * l,
            (7 / 20 * y2 + 3 / 20 * y1) * l,
            (1 / 20 * w2 + 1 / 30 * w1) * l * l,
            e.n2, p
        )
        p.distributedLoads.push(this)

        let f1Global: Matrix
        let f2Global: Matrix
        let t: Matrix

        if (e.type === 'Truss') {
            t = getT_4x4(e.angle())
            f1Global = math.matrix!([
                [x1],
                [y1]
            ])
            f2Global = math.matrix!([
                [x2],
                [y2]
            ])
        } else {
            t = getT_6x6(e.angle())
            f1Global = math.matrix!([
                [x1],
                [y1],
                [w1]
            ])
            f2Global = math.matrix!([
                [x2],
                [y2],
                [w2]
            ])
        }

        const f1Local = mult([t, f1Global]) as Matrix
        const f2Local = mult([t, f2Global]) as Matrix

        if (e.type === 'Truss') {
            this.l1Local = new Load(f1Local.get([0, 0]), f1Local.get([0, 1]), 0, e.n1, p, false)
            this.l2Local = new Load(f2Local.get([0, 0]), f2Local.get([0, 1]), 0, e.n2, p, false)
        } else {
            this.l1Local = new Load(f1Local.get([0, 0]), f1Local.get([0, 1]), f1Local.get([0, 2]), e.n1, p, false)
            this.l2Local = new Load(f2Local.get([0, 0]), f2Local.get([0, 1]), f2Local.get([0, 2]), e.n2, p, false)
        }
    }
}
