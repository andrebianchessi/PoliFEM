/* eslint-disable no-unused-vars */
import { deleteCol, deleteRow } from './functions/matrixUtils'
import { math } from './models/math'
import { DynamicTrussTest1 } from './tests/dynamicTrussTest1'
import { DynamicTrussTest2 } from './tests/dynamicTrussTest2'
import { ModalTest } from './tests/modalTest'
import { StaticTrussTest } from './tests/staticTrussTest'

// StaticTrussTest()
// DynamicTrussTest1()
// DynamicTrussTest2()
// ModalTest()

const m = math.matrix!([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
console.log(deleteCol(1, m))
console.log()
