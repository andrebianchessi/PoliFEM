import { Node } from './node'
import { Problem } from './problem'

export class Load {
    x: number
    y: number
    node: Node

    constructor (x: number, y: number, node: Node, p: Problem) {
        this.x = x
        this.y = y
        this.node = node
        p.loads.push(this)
    }
}
