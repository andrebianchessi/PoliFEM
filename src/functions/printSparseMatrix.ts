import { Matrix } from 'mathjs'
import { math } from '../models/math'
export function PrintSparseMatrix (m:Matrix) {
    console.log('[')
    const nRows = m.size()[0]
    const nCols = m.size()[1]
    for (let i = 0; i < nRows; i++) {
        let row = '\t[ '
        for (let j = 0; j < nCols; j++) {
            row += math.format!(m.get([i, j]), { precision: 2 }) + ' '
        }
        row += ' ]'
        console.log(row)
    }
    console.log(']')
}
