import { Node } from './node'
import { Problem } from './problem'

export class Load {
    x: number // load on x direction
    y: number // load on y direction
    w: number // load on w direction
    node: Node
    isWeight: boolean

    constructor (x: number, y: number, w:number, node: Node, p: Problem, isWeight: boolean = false) {
        this.x = x
        this.y = y
        this.w = w
        this.node = node
        this.isWeight = isWeight
        p.loads.push(this)
    }
}
