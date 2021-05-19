import { Matrix } from 'mathjs'
import { mult } from '../functions/mult'
import { Element } from './element'
import { FrameProperties } from './frameProperties'
import { math } from './math'
import { TrussProperties } from './trussProperties'

export class MassMatrix {
    // TODO: add consistent matrix options
    type: 'Truss' | 'Frame'
    m?: Matrix

    constructor (element: Element, type: 'Truss' | 'Frame') {
        this.type = type
        switch (type) {
        case 'Truss': {
            const rho = (element.properties as TrussProperties).rho!
            const A = (element.properties as TrussProperties).A
            const l = element.length()

            // Lumped
            this.m = math.multiply!(rho * A * l / 2, math.matrix!([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ])) as Matrix
            // Consistent
            // this.m = math.multiply!(rho * A * l / 6,
            //     math.matrix!([
            //         [2, 0, 1, 0],
            //         [0, 2, 0, 1],
            //         [1, 0, 2, 0],
            //         [0, 1, 0, 2]
            //     ])) as Matrix
            break
        }
        case 'Frame': {
            const rho = (element.properties as FrameProperties).rho!
            const A = (element.properties as FrameProperties).A
            const l = element.length()

            // Lumped
            const mLocal = math.multiply!(rho * A * l, math.matrix!([
                [0.5, 0, 0, 0, 0, 0],
                [0, 0.5, 0, 0, 0, 0],
                [0, 0, l * l / 78, 0, 0, 0],
                [0, 0, 0, 0.5, 0, 0],
                [0, 0, 0, 0, 0.5, 0],
                [0, 0, 0, 0, 0, l * l / 78]
            ])) as Matrix
            this.m = mLocal

            // Consistent
            // const mLocal = math.multiply!(rho * A * l, math.matrix!([
            //    ...
            // ])) as Matrix
            // const c = element.angle.c()
            // const s = element.angle.s()
            // const t = math.matrix!(
            //     [
            //         [c, s, 0, 0, 0, 0],
            //         [-s, c, 0, 0, 0, 0],
            //         [0, 0, 1, 0, 0, 0],
            //         [0, 0, 0, c, s, 0],
            //         [0, 0, 0, -s, c, 0],
            //         [0, 0, 0, 0, 0, 1]
            //     ]
            // )
            // this.m = mult([math.transpose!(t), mLocal, t]) as Matrix

            break
        }
        }
    }
}
