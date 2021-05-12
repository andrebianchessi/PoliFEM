import { Matrix } from 'mathjs'
import { Problem } from './problem'

export class DynamicProblem extends Problem {
    K?: Matrix
    U?: Matrix
    F?: Matrix
    M?: Matrix
    C?: Matrix

    solve () {
    }

    plot () {
    }
}
