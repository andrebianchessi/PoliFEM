import { MassMatrix } from './massMatrix'
import { Problem } from './problem'
import { StiffnessMatrix } from './stiffnessMatrix'

export class SolidElement {
    static count = 0
    static type = 'PlaneStress'
    index: number
    K: StiffnessMatrix
    M?: MassMatrix
    constructor (p: Problem) {
        SolidElement.count += 1
        this.index = SolidElement.count
        this.K = new StiffnessMatrix(this, 'PlaneStress')
        p.solidElements.set(p.structuralElementCount, this)
        p.structuralElementCount += 1
    }
}
