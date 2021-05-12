import { Matrix } from 'mathjs'
import { math } from '../models/math'
import { MatricesAreEqual } from './matricesAreEqual'

export function checkResult (result: Matrix, expectedResult:number[][]):boolean {
    const expectedResultMatrix = math.matrix!(expectedResult)
    if (MatricesAreEqual(expectedResultMatrix, result)) {
        console.log('ok')
        return true
    } else {
        console.log('fail')
        return false
    }
}
