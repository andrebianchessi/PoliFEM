import { Matrix } from 'mathjs'
// eslint-disable-next-line camelcase
import { getT_4x4, getT_6x6 } from '../functions/rotationalMatrix'
import { StructuralElement } from './structuralElement'
import { FrameProperties } from './frameProperties'
import { math } from './math'
import { TrussProperties } from './trussProperties'
import { SolidElement } from './solidElement'
import { mult } from '../functions/mult'

export class StiffnessMatrix {
    type: 'Frame' | 'Truss' | 'PlaneStress'

    k: Matrix
    kLocal: Matrix

    constructor (element: StructuralElement | SolidElement, type: 'Frame' | 'Truss' | 'PlaneStress') {
        this.type = type

        // dummy constructor to avoid compilation errors
        this.kLocal = math.matrix!()
        this.k = math.matrix!()

        if (element instanceof StructuralElement) {
            let t
            switch (type) {
            case 'Frame': {
                t = getT_6x6(element.angle)

                const E = element.properties.E
                const I = (element.properties as FrameProperties).I
                const A = (element.properties as FrameProperties).A
                const l = element.length()
                const l3 = l * l * l
                const l2 = l * l

                const EAl = E * A / l
                const EI12l3 = E * I * 12 / l3
                const EI6l2 = E * I * 6 / l2
                const EI4l = E * I * 4 / l
                const EI2l = E * I * 2 / l
                this.kLocal = math.matrix!([
                    [EAl, 0, 0, -EAl, 0, 0],
                    [0, EI12l3, EI6l2, 0, -EI12l3, EI6l2],
                    [0, EI6l2, EI4l, 0, -EI6l2, EI2l],
                    [-EAl, 0, 0, EAl, 0, 0],
                    [0, -EI12l3, -EI6l2, 0, EI12l3, -EI6l2],
                    [0, EI6l2, EI2l, 0, -EI6l2, EI4l]
                ])
                break
            }
            case 'Truss': {
                t = t = getT_4x4(element.angle)

                const E = element.properties.E
                const A = (element.properties as TrussProperties).A
                const l = element.length()

                const EAl = E * A / l
                this.kLocal = math.matrix!([
                    [EAl, 0, -EAl, 0],
                    [0, 0, 0, 0],
                    [-EAl, 0, EAl, 0],
                    [0, 0, 0, 0]
                ])
                break
            }
            }

            this.k = math.multiply!(math.multiply!(math.transpose!(t as Matrix), this.kLocal), t as Matrix)
        } else {
            switch (type) {
            case 'PlaneStress': {
                // this.kLocal = math.matrix!([
                //     [1, 1, 1, 1, 1, 1],
                //     [1, 1, 1, 1, 1, 1],
                //     [1, 1, 1, 1, 1, 1],
                //     [1, 1, 1, 1, 1, 1],
                //     [1, 1, 1, 1, 1, 1],
                //     [1, 1, 1, 1, 1, 1]

                // ])
                const E = element.properties.E
                const v = element.properties.v
                const t = element.properties.t

                const C = mult([E / (1 - v * v), math.matrix!([
                    [1, 1 * v, 0],
                    [1 * v, 1, 0],
                    [0, 0, 1 * (1 - v) / 2]
                ])]) as Matrix

                const x1 = element.n1.x
                const x2 = element.n2.x
                const x3 = element.n3.x
                const y1 = element.n1.y
                const y2 = element.n2.y
                const y3 = element.n3.y
                const A = math.abs!(0.5 * math.det!(
                    math.matrix!([
                        [1, x1, y1],
                        [1, x2, y2],
                        [1, x3, y3]
                    ])
                ))

                // const a1 = x2 * y3 - x3 * y2
                // const a2 = x3 * y1 - x1 * y3
                // const a3 = x1 * y2 - x2 * y1
                const b1 = y2 - y3
                const b2 = y3 - y1
                const b3 = y1 - y2
                const c1 = x3 - x2
                const c2 = x1 - x3
                const c3 = x2 - x1
                const k = 1 / (2 * A)
                const B = mult([k, math.matrix!([
                    [b1, 0, b2, 0, b3, 0],
                    [0, c1, 0, c2, 0, c3],
                    [c1, b1, c2, b2, c3, b3]
                ])]) as Matrix
                const BT = math.transpose!(B)

                this.k = mult([t * A, BT, C, B]) as Matrix
            }
            }
        }
    }
}
