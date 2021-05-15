import { Matrix } from 'mathjs'
import { math } from '../models/math'

export function sum (x: (Matrix|number)[]) {
    if (x.length < 2) {
        throw Error('Less than two values provided for multiplication')
    }
    let result = x[0]
    for (let i = 1; i < x.length; i++) {
        result = math.add!(result, x[i]) as (Matrix|number)
    }
    return result
}
