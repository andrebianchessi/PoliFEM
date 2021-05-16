import { Matrix } from 'mathjs'
import { math } from '../models/math'

export function replaceRowAndColByZeros (m: Matrix, index:number) {
    m.subset!(math.index!(index, math.range!(0, m.size()[0])), math.zeros!(1, m.size()[0]))
    m.subset!(math.index!(math.range!(0, m.size()[0]), index), math.zeros!(m.size()[0], 1))
}

export function getCol (i:number, m:Matrix): Matrix {
    return m.subset!(math.index!(i, math.range!(0, m.size()[0])))
}

export function getRow (i:number, m:Matrix): Matrix {
    return m.subset!(math.index!(math.range!(0, m.size()[0]), i))
}
