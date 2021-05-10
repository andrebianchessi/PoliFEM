import { Angle } from './angleInRadians'
import { Node } from './node'

export class Line {
    n1 : Node
    n2 : Node
    angle: Angle

    constructor (n1:Node, n2:Node) {
        this.n1 = n1
        this.n2 = n2
        const deltaY = n2.y - n1.y
        const deltaX = n2.x - n1.x
        this.angle = new Angle(Math.atan(deltaY / deltaX))
    }

    distance ():number {
        const deltaX = this.n2.x - this.n1.x
        const deltaY = this.n2.y - this.n1.y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
}
