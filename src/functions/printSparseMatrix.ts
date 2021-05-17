import { Matrix } from 'mathjs'
import { math } from '../models/math'
export function PrintSparseMatrix (m:Matrix, showValues: boolean = true) {
    console.log('[')
    const nRows = m.size()[0]
    const nCols = m.size()[1]
    for (let i = 0; i < nRows; i++) {
        let row = '\t[ '
        for (let j = 0; j < nCols; j++) {
            let value = m.get([i, j])
            if (!showValues) {
                if (value !== 0) {
                    value = 'x'
                } else {
                    value = '0'
                }
            }
            row += math.format!(value, { precision: 2 }) + ' '
        }
        row += ' ]'
        console.log(row)
    }
    console.log(']')
}
