import { Node } from './node'
import { Problem } from './problem'

export class Load {
    x: number // load on x direction
    y: number // load on y direction
    w: number // load on w direction
    node: Node
    isDistEquivalent: boolean

    constructor (x: number, y: number, w:number, node: Node, p: Problem, addToProblem: boolean = true, isDistEquivalent: boolean = false) {
        this.x = x
        this.y = y
        this.w = w
        this.node = node
        this.isDistEquivalent = isDistEquivalent
        if (addToProblem) {
            p.loads.push(this)
        }
    }
}
