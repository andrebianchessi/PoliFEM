import { MassMatrix } from './massMatrix'
import { Node } from './node'
import { Problem } from './problem'
import { SolidElementProperties } from './solidElementProperties'
import { StiffnessMatrix } from './stiffnessMatrix'

export class SolidElement {
    static count = 0
    index: number
    n1: Node
    n2: Node
    n3: Node
    properties: SolidElementProperties
    K: StiffnessMatrix
    M?: MassMatrix
    constructor (n1: Node, n2: Node, n3: Node, properties: SolidElementProperties, p: Problem) {
        SolidElement.count += 1
        this.index = SolidElement.count

        this.properties = properties
        this.n1 = n1
        this.n2 = n2
        this.n3 = n3

        if (this.n1.uIndex == null) {
            this.n1.uIndex = p.dof
            p.dof += 1
        }
        if (this.n1.vIndex == null) {
            this.n1.vIndex = p.dof
            p.dof += 1
        }

        if (this.n2.uIndex == null) {
            this.n2.uIndex = p.dof
            p.dof += 1
        }
        if (this.n2.vIndex == null) {
            this.n2.vIndex = p.dof
            p.dof += 1
        }

        if (this.n3.uIndex == null) {
            this.n3.uIndex = p.dof
            p.dof += 1
        }
        if (this.n3.vIndex == null) {
            this.n3.vIndex = p.dof
            p.dof += 1
        }

        this.K = new StiffnessMatrix(this, 'PlaneStress')
        p.solidElements.set(p.solidElementCount, this)
        p.solidElementCount += 1
    }
}
