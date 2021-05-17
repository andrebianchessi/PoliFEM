import * as mathjs from 'mathjs'
import Matrix, { EigenvalueDecomposition } from 'ml-matrix'

export function getEigs (m:mathjs.Matrix): { values: number[], vectors: number[][]} {
    const A = new Matrix(m.toArray() as number[][])
    const e = new EigenvalueDecomposition(A)
    const real = e.realEigenvalues
    const imaginary = e.imaginaryEigenvalues
    const vectorsMatrix = e.eigenvectorMatrix
    const vectors = []
    for (let i = 0; i < vectorsMatrix.rows; i++) {
        const line = []
        for (let j = 0; j < vectorsMatrix.columns; j++) {
            line.push(vectorsMatrix.get(i, j))
        }
        vectors.push(line)
    }
    return { values: real, vectors }
}
