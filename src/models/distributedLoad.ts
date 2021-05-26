import { Element } from './element'
import { Load } from './load'
import { Problem } from './problem'

export class DistributedLoad {
    e: Element
    l1Eq: Load
    l2Eq: Load
    constructor (e: Element, x1:number, y1:number, w1: number, x2:number, y2:number, w2: number, p:Problem) {
        this.e = e
        const l = e.length()
        this.l1Eq = new Load(
            (1 / 3 * x1 + 1 / 6 * x2) * l,
            (7 / 20 * y1 + 3 / 20 * y2) * l,
            (1 / 20 * w1 + 1 / 30 * w2) * l * l,
            e.n1, p, false
        )
        this.l2Eq = new Load(
            (1 / 3 * x2 + 1 / 6 * x1) * l,
            (7 / 20 * y2 + 3 / 20 * y1) * l,
            (1 / 20 * w2 + 1 / 30 * w1) * l * l,
            e.n2, p, false
        )
        p.distributedLoads.push(this)
    }
}
