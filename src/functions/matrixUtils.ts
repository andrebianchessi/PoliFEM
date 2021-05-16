import { Matrix } from 'mathjs'
import { math } from '../models/math'

export function replaceRowAndColByZeros (m: Matrix, index:number) {
    m.subset!(math.index!(index, math.range!(0, m.size()[1])), math.zeros!(1, m.size()[1]))
    m.subset!(math.index!(math.range!(0, m.size()[0]), index), math.zeros!(m.size()[0], 1))
}

export function getCol (i:number, m:Matrix): Matrix {
    return m.subset!(math.index!(math.range!(0, m.size()[0]), i))
}

export function getRow (i:number, m:Matrix): Matrix {
    return m.subset!(math.index!(i, math.range!(0, m.size()[1])))
}

export function deleteRow (i:number, m:Matrix): Matrix {
    let newM = null
    for (let row = 0; row < m.size()[0]; row++) {
        if (row !== i) {
            if (newM == null) {
                newM = getRow(row, m)
            } else {
                newM = math.concat!(newM, getRow(row, m), 0)
            }
        }
    }
    return newM as Matrix
}
