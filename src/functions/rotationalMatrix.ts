/* eslint-disable camelcase */
import { Matrix } from 'mathjs'
import { Angle } from '../models/angleInRadians'
import { math } from '../models/math'

export function getT_6x6 (a: Angle): Matrix {
    const c = a.c()
    const s = a.s()
    return math.matrix!(
        [
            [c, s, 0, 0, 0, 0],
            [-s, c, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0],
            [0, 0, 0, c, s, 0],
            [0, 0, 0, -s, c, 0],
            [0, 0, 0, 0, 0, 1]
        ]
    )
}

export function getT_4x4 (a: Angle): Matrix {
    const c = a.c()
    const s = a.s()
    return math.matrix!(
        [
            [c, s, 0, 0],
            [-s, c, 0, 0],
            [0, 0, c, s],
            [0, 0, -s, c]
        ]
    )
}
