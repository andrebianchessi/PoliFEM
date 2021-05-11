import { Node } from './node'
import { Problem } from './problem'

export class Load {
    x: number // load on x direction
    y: number // load on y direction
    w: number // load on w direction
    node: Node

    constructor (x: number, y: number, w:number, node: Node, p: Problem) {
        this.x = x
        this.y = y
        this.w = w
        this.node = node
        p.loads.push(this)
    }
}
