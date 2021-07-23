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

                const c1 = E / (1 - v * v)
                const C = math.matrix!([
                    [c1, c1 * v, 0],
                    [c1 * v, c1, 0],
                    [0, 0, (1 - v) / 2]
                ])

                const xi = element.n1.x
                const xj = element.n2.x
                const xk = element.n3.x
                const yi = element.n1.y
                const yj = element.n2.y
                const yk = element.n3.y
                const A = 0.5 * math.det!(
                    math.matrix!([
                        [1, xi, yi],
                        [1, xj, yj],
                        [1, xk, yk]
                    ])
                )

                const b1 = 1 / (2 * A)
                const B = math.matrix!([
                    [b1 * (yj - yk), 0, b1 * (yk - yi), 0, b1 * (yi - yj), 0],
                    [0, b1 * (xk - xj), 0, b1 * (xi - xk), 0, b1 * (xj - xi)],
                    [b1 * (xk - xj), b1 * (yi - yk), b1 * (xi - xk), b1 * (yk - yi), b1 * (xj - xi), b1 * (yi - yk)]
                ])
                const BT = math.transpose!(B)
                this.k = mult([t, BT, C, B, A]) as Matrix
            }
            }
        }
    }
}
