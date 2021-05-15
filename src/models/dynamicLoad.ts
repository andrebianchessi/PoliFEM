import { DynamicProblem } from './dynamicProblem'
import { Node } from './node'

export class DynamicLoad {
    x: (t:number)=>number // load on x direction
    y: (t:number)=>number // load on y direction
    w: (t:number)=>number // load on w direction
    node: Node

    constructor (x: (t:number)=>number, y: (t:number)=>number, w:(t:number)=>number, node: Node, p:DynamicProblem) {
        this.x = x
        this.y = y
        this.w = w
        this.node = node
        p.dynamicLoads.push(this)
    }
}
