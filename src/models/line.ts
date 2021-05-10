import { Node } from './node'

export class Line {
    n1 : Node
    n2 : Node

    constructor (n1:Node, n2:Node) {
        this.n1 = n1
        this.n2 = n2
    }

    distance ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }

    horizontalAngle
}
