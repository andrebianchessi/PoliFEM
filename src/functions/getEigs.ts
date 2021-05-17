import * as mathjs from 'mathjs'
import Matrix, { EigenvalueDecomposition } from 'ml-matrix'
import { Problem } from '../models/problem'
import { deleteCol, deleteRow } from './matrixUtils'

export function getEigs (m:mathjs.Matrix, p:Problem): { values: number[], vectors: number[][]} {
    for (const bc of p.boundaryConditions) {
        for (const i of bc.restrictedIndices) {
            m = deleteRow(i, m)
            m = deleteCol(i, m)
        }
    }

    const A = new Matrix(m.toArray() as number[][])
    const e = new EigenvalueDecomposition(A)
    const real = e.realEigenvalues
    const vectorsMatrix = e.eigenvectorMatrix
    const reducedVectors = []
    for (let i = 0; i < vectorsMatrix.rows; i++) {
        const line = []
        for (let j = 0; j < vectorsMatrix.columns; j++) {
            line.push(vectorsMatrix.get(i, j))
        }
        reducedVectors.push(line)
    }

    const expandedVectors: number[][] = []
    let expandedVector
    for (const v of reducedVectors) {
        expandedVector = new Array(p.dof).fill('*')
        for (const bc of p.boundaryConditions) {
            for (const i of bc.restrictedIndices) {
                expandedVector[i] = bc.value
            }
        }
        let i = 0
        for (const displacement of v) {
            while (expandedVector[i] !== '*') {
                i++
            }
            expandedVector[i] = displacement
        }
        expandedVectors.push(expandedVector)
    }

    return { values: real, vectors: expandedVectors }
}
