import { Matrix } from 'mathjs'
import { math } from '../models/math'

export function MatricesAreEqual (m1: Matrix, m2:Matrix): boolean {
    const error: Matrix = math.compare!(m1, m2) as Matrix
    error.forEach(function (value, index, matrix) {
        if (value !== 0) {
            return false
        }
    })
    return true
}
