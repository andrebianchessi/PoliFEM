/* eslint-disable no-unused-vars */
import { math } from './models/math'
import { DynamicTrussTest1 } from './tests/dynamicTrussTest1'
import { DynamicTrussTest2 } from './tests/dynamicTrussTest2'
import { ModalTest } from './tests/modalTest'
import { StaticTrussTest } from './tests/staticTrussTest'
import eig from 'eigen'
(async () => {
    await eig.ready
    const M = new eig.Matrix([[1, 2], [3, 4]])
    M.print('M')
    M.inverse()
    M.print('Minv')
    eig.GC.flush()
})()

// StaticTrussTest()
// DynamicTrussTest1()
// DynamicTrussTest2()
ModalTest()
console.log()
