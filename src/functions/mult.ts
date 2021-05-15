import { Matrix } from 'mathjs'
import { math } from '../models/math'

export function mult (x: (Matrix|number)[]) {
    if (x.length < 2) {
        throw Error('Less than two values provided for multiplication')
    }
    let result = x[0]
    for (let i = 1; i < x.length - 1; i++) {
        result = math.multiply!(result, x[i]) as (Matrix|number)
    }
    return result
}
